import type * as Vite from 'vite'
import { init as initEsModuleLexer } from 'es-module-lexer'
import path from 'node:path'
import { detectLegacyMode, detectReactRefresh } from './detect'
import { resolveConfig } from './react-router/react-router-dev/config/config'
import { importViteEsmSync, preloadViteEsm } from './react-router/react-router-dev/vite/import-vite-esm-sync'
import { RouteUtil } from './route-util'
import { type Options, type PluginContext } from './types'
import { getVitePluginName, isObjEq, reactRefreshHack, validateRouteDir } from './utils'
import { invalidateVirtualModule, resolvedVirtualModuleId, routesId, vmods } from './virtual'

function remixFlatRoutes(options: Options = {}): Vite.PluginOption {
  const { appDirectory = 'app', flatRoutesOptions, routes, legacy, handleAsync = false, reactRefresh } = options

  const routeDir = flatRoutesOptions?.routeDir || 'routes'
  const routeDirs = Array.isArray(routeDir) ? routeDir : [routeDir]

  let isLegacyMode = legacy
  if (isLegacyMode === undefined) {
    isLegacyMode = detectLegacyMode()
  }

  let reactRefreshEnabled = reactRefresh
  if (reactRefreshEnabled === undefined) {
    reactRefreshEnabled = detectReactRefresh()
  }

  for (const routeDir of routeDirs) {
    validateRouteDir(path.join(path.resolve(process.cwd(), appDirectory), routeDir))
  }

  let viteUserConfig: Vite.UserConfig
  let viteConfig: Vite.ResolvedConfig | undefined
  let viteConfigEnv: Vite.ConfigEnv
  let routeUtil: RouteUtil | undefined

  const ctx: PluginContext = {
    remixOptions: { appDirectory, flatRoutesOptions, routes },
    isLegacyMode,
    handleAsync,
    rootDirectory: process.cwd(),
    inRemixContext: false,
    routeManifest: {},
    viteChildCompiler: null,
    reactRefresh: reactRefreshEnabled,
  }

  return [
    {
      enforce: 'pre',
      name: 'vite-plugin-remix-flat-routes',
      /**
       * @see `config` in react-router-dev/vite/plugin.ts
       */
      async config(_viteUserConfig, _viteConfigEnv) {
        // Preload Vite's ESM build up-front as soon as we're in an async context
        await preloadViteEsm()

        viteUserConfig = _viteUserConfig
        viteConfigEnv = _viteConfigEnv
      },
      /**
       * @see `configResolved` in react-router-dev/vite/plugin.ts
       */
      async configResolved(resolvedViteConfig) {
        await initEsModuleLexer

        viteConfig = resolvedViteConfig

        if (
          !viteConfig ||
          viteConfig.isProduction ||
          viteConfig.build.ssr ||
          viteConfig.command === 'build' ||
          viteConfig.server.hmr === false
        ) {
          ctx.reactRefresh = false
        }

        ctx.rootDirectory = viteConfig.root
        ctx.remixOptions.appDirectory = path.resolve(viteConfig.root, appDirectory)

        if (viteConfig.plugins.some((plugin) => getVitePluginName(plugin) === 'remix')) {
          // in Remix Context
          ctx.inRemixContext = true
        }

        // Only create the child compiler for `vite build` command
        // Because we can reuse vite server as the child compiler for `vite serve`
        if (viteConfig.command === 'build') {
          const vite = importViteEsmSync()

          // We load the same Vite config file again for the child compiler so
          // that both parent and child compiler's plugins have independent state.
          // If we re-used the `viteUserConfig.plugins` array for the child
          // compiler, it could lead to mutating shared state between plugin
          // instances in unexpected ways, e.g. during `vite build` the
          // `configResolved` plugin hook would be called with `command = "build"`
          // by parent and then `command = "serve"` by child, which some plugins
          // may respond to by updating state referenced by the parent.
          const childCompilerConfigFile = await vite.loadConfigFromFile(
            {
              command: viteConfig.command,
              mode: viteConfig.mode,
              isSsrBuild: viteConfigEnv.isSsrBuild,
            },
            viteConfig.configFile,
          )

          ctx.viteChildCompiler = await vite.createServer({
            ...viteUserConfig,
            mode: viteConfig.mode,
            server: {
              watch: null,
              preTransformRequests: false,
              hmr: false,
            },
            configFile: ctx.inRemixContext ? undefined : false,
            envFile: false,
            plugins: [
              ...(childCompilerConfigFile?.config.plugins ?? [])
                .flat()
                // Exclude this plugin from the child compiler to prevent an
                // infinite loop (plugin creates a child compiler with the same
                // plugin that creates another child compiler, repeat ad
                // infinitum), and to prevent the manifest from being written to
                // disk from the child compiler. This is important in the
                // production build because the child compiler is a Vite dev
                // server and will generate incorrect manifests.
                .filter((plugin) => getVitePluginName(plugin) === 'vite-plugin-remix-flat-routes'),
            ],
          })

          await ctx.viteChildCompiler.pluginContainer.buildStart({})
        }
      },
      configureServer(server) {
        // viteConfig.command === 'serve'
        ctx.viteChildCompiler = server

        server.ws.on(
          'remix-flat-routes:react-refresh',
          (data: { id: string; prevExports: Record<string, any>; nextExports: Record<string, any> }) => {
            const { prevExports, nextExports } = data
            if (isObjEq(prevExports, nextExports)) {
              return
            }
            invalidateVirtualModule(server, true)
          },
        )
      },
      async resolveId(id) {
        if (vmods.includes(id)) {
          return resolvedVirtualModuleId(id)
        }
        return null
      },
      async load(id) {
        switch (id) {
          case resolvedVirtualModuleId(routesId): {
            const { routeManifest } = await resolveConfig(ctx)

            routeUtil = new RouteUtil({
              ...ctx,
              routeManifest,
            })

            ctx.routeManifest = await routeUtil.processRouteManifest()

            const routes = routeUtil.createClientRoutes(ctx.routeManifest)

            const { routesString, componentsString } = await routeUtil.stringifyRoutes(routes)

            return {
              code: `import React from 'react';
                ${reactRefreshHack({
                  appDirectory: ctx.remixOptions.appDirectory,
                  routeManifest,
                  viteConfig: viteConfig!,
                  enable: ctx.reactRefresh,
                })}
                ${componentsString}
                export const routes = ${routesString};
              `,
              map: null,
            }
          }

          default:
            break
        }

        return null
      },
      /**
       * @see `buildEnd` in react-router-dev/vite/plugin.ts
       */
      buildEnd() {
        ctx.viteChildCompiler?.httpServer?.close()
        // vite6
        // Unexpected early exit. This happens when Promises returned by plugins cannot //resolve. Unfinished hook action(s) on exit:
        // (vite-plugin-remix-flat-routes) buildEnd
        ctx.viteChildCompiler?.close()
      },
      async handleHotUpdate({ server, file }) {
        const route = routeUtil?.getRoute(file)

        if (route) {
          invalidateVirtualModule(server)
        }
      },
      async watchChange(filepath, change) {
        if (change.event === 'update') {
          return
        }

        const vite = importViteEsmSync()
        const appFileAddedOrRemoved = filepath.startsWith(vite.normalizePath(ctx.remixOptions.appDirectory))

        if (appFileAddedOrRemoved && ctx.viteChildCompiler) {
          invalidateVirtualModule(ctx.viteChildCompiler, true)
        }
      },
    },
    {
      name: 'vite-plugin-remix-flat-routes:react-refresh',
      enforce: 'post',
      apply() {
        return ctx.reactRefresh
      },
      transform(code, id) {
        if (id === '/@react-refresh') {
          return {
            code: code.replace(
              'window.__getReactRefreshIgnoredExports?.({ id })',
              'window.__getReactRefreshIgnoredExports?.({ id, prevExports, nextExports })',
            ),
            map: null,
          }
        }
      },
    },
  ]
}

export { remixFlatRoutes, Options }
