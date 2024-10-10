import type * as Vite from 'vite'
import { init as initEsModuleLexer } from 'es-module-lexer'
import path from 'node:path'
import { resolveLegacyMode } from './detect-legacy'
import { importViteEsmSync, preloadViteEsm } from './import-vite-esm-sync'
import { createClientRoutes, resolveRoutes } from './remix'
import { RotueUtil } from './route-util'
import { type Options, type PluginContext } from './types'
import { getVitePluginName, validateRouteDir } from './utils'
import { invalidateVirtualModule, resolvedVirtualModuleId, virtualModuleId } from './virtual'

function remixFlatRoutes(options: Options = {}): Vite.PluginOption {
  const { appDirectory = 'app', flatRoutesOptions, legacy, meta = 'meta' } = options

  const routeDir = flatRoutesOptions?.routeDir || 'routes'
  const routeDirs = Array.isArray(routeDir) ? routeDir : [routeDir]

  let isLegacyMode = legacy
  if (isLegacyMode === undefined) {
    isLegacyMode = resolveLegacyMode()
  }

  for (const routeDir of routeDirs) {
    validateRouteDir(path.join(path.resolve(process.cwd(), appDirectory), routeDir))
  }

  let viteUserConfig: Vite.UserConfig
  let viteChildCompiler: Vite.ViteDevServer | null = null
  let viteConfig: Vite.ResolvedConfig | undefined
  let viteConfigEnv: Vite.ConfigEnv

  const ctx: PluginContext = {
    remixOptions: { appDirectory, flatRoutesOptions },
    meta,
    isLegacyMode,
    rootDirectory: process.cwd(),
    inRemixContext: false,
    routeManifest: {},
  }

  return {
    enforce: 'pre',
    name: 'vite-plugin-remix-flat-routes',
    /**
     * @see `config` in @remix-run/dev/vite/plugin.ts
     */
    async config(_viteUserConfig, _viteConfigEnv) {
      await preloadViteEsm()

      viteUserConfig = _viteUserConfig
      viteConfigEnv = _viteConfigEnv
    },
    /**
     * @see `configResolved` in @remix-run/dev/vite/plugin.ts
     */
    async configResolved(resolvedViteConfig) {
      await initEsModuleLexer

      viteConfig = resolvedViteConfig

      ctx.rootDirectory = viteConfig.root

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

        viteChildCompiler = await vite.createServer({
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

        await viteChildCompiler.pluginContainer.buildStart({})
      }
    },
    configureServer(server) {
      // viteConfig.command === 'serve'
      viteChildCompiler = server
    },
    async resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
      return null
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const { routeManifest } = await resolveRoutes(ctx)

        ctx.routeManifest = routeManifest
        const routeUtil = new RotueUtil(ctx)

        await routeUtil.processRouteManifest(viteChildCompiler!)
        const routes = createClientRoutes(ctx.routeManifest)

        const { routesString, componentsString } = routeUtil.stringifyRoutes(routes)

        return {
          code: `import React from 'react';
          ${componentsString}
          export const routes = ${routesString};
          `,
          map: null,
        }
      }
      return null
    },

    /**
     * @see `buildEnd` in @remix-run/dev/vite/plugin.ts
     */
    async buildEnd() {
      viteChildCompiler?.httpServer?.close()
      await viteChildCompiler?.close()
    },
    handleHotUpdate(ctx) {
      invalidateVirtualModule(ctx.server)
    },
    watchChange(_, change) {
      if (change.event === 'update') {
        return
      }
      invalidateVirtualModule(viteChildCompiler!, true)
    },
  }
}

export { remixFlatRoutes, Options }
