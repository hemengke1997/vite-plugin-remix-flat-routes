import type * as Vite from 'vite'
import { init as initEsModuleLexer } from 'es-module-lexer'
import path from 'node:path'
import { resolveLegacyMode } from './detect-legacy'
import { importViteEsmSync, preloadViteEsm } from './import-vite-esm-sync'
import { createClientRoutes, resolveRoutes } from './remix'
import { type Options, type PluginContext } from './types'
import { processRouteManifest, stringifyRoutes, validateRouteDir } from './utils'
import { invalidateVirtualModule, resolvedVirtualModuleId, virtualModuleId } from './virtual'

function remixFlatRoutes(options: Options = {}): Vite.PluginOption {
  const { appDirectory = 'app', flatRoutesOptions, legacy } = options

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
  let viteServer: Vite.ViteDevServer

  const ctx: PluginContext = {
    rootDirectory: process.cwd(),
    routeManifest: {},
    remixOptions: { appDirectory, flatRoutesOptions },
    meta: 'meta',
    isLegacyMode,
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

      if (viteConfig.command === 'build') {
        const vite = importViteEsmSync()

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
          configFile: false,
          envFile: false,
          plugins: [
            ...(childCompilerConfigFile?.config.plugins ?? [])
              .flat()
              .filter(
                (plugin) =>
                  typeof plugin === 'object' &&
                  plugin !== null &&
                  'name' in plugin &&
                  !['vite-plugin-remix-flat-routes', 'remix', 'remix-hmr-updates'].includes(plugin.name),
              ),
          ],
        })

        await viteChildCompiler.pluginContainer.buildStart({})
      }
    },
    configureServer(server) {
      viteServer = server

      // viteConfig.command === 'serve
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

        await processRouteManifest(viteChildCompiler!, ctx)

        const routes = createClientRoutes(ctx.routeManifest)

        const { routesString, componentsString } = stringifyRoutes(routes, ctx)

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
      invalidateVirtualModule(viteServer, true)
    },
  }
}

export { remixFlatRoutes, Options }
