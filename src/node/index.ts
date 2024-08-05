import type * as Vite from 'vite'
import { init as initEsModuleLexer } from 'es-module-lexer'
import fs from 'fs-extra'
import path from 'node:path'
import { type SetOptional } from 'type-fest'
import { importViteEsmSync, preloadViteEsm } from './import-vite-esm-sync'
import { type RemixOptions, resolveRoutes } from './remix'
import { type PluginContext, getRouteManifestModuleExports, stringifyRoutes } from './utils'

export type Options = SetOptional<RemixOptions, 'appDirectory'> & {}

function validateRouteDir(dir: string): void {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`[vite-plugin-remix-flat-routes] routes directory not found: ${dir}`)
  }
}

const virtualModuleId = 'virtual:remix-flat-routes'
const resolvedVirtualModuleId = `\0${virtualModuleId}`

function remixFlatRoutes(options: Options = {}): Vite.Plugin {
  const { appDirectory = 'app', flatRoutesOptions } = options

  const routeDir = flatRoutesOptions?.routeDir || 'routes'
  const routeDirs = Array.isArray(routeDir) ? routeDir : [routeDir]

  for (const routeDir of routeDirs) {
    validateRouteDir(path.join(path.resolve(process.cwd(), appDirectory), routeDir))
  }

  let viteUserConfig: Vite.UserConfig
  let viteChildCompiler: Vite.ViteDevServer | null = null
  let viteConfig: Vite.ResolvedConfig | undefined
  let viteConfigEnv: Vite.ConfigEnv

  const ctx: PluginContext = {
    rootDirectory: process.cwd(),
    routeManifest: {},
    remixOptions: { appDirectory, flatRoutesOptions },
  }

  return {
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
          watch: viteConfig.command === 'build' ? null : undefined,
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
                plugin.name !== 'vite-plugin-remix-flat-routes',
            ),
        ],
      })
      await viteChildCompiler.pluginContainer.buildStart({})
    },
    async resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
      return null
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const { routes } = await resolveRoutes({ appDirectory, flatRoutesOptions }, async (routeManifest) => {
          ctx.routeManifest = routeManifest

          const routeManifestExports = await getRouteManifestModuleExports(viteChildCompiler, ctx)

          for (const [key, route] of Object.entries(ctx.routeManifest)) {
            const sourceExports = routeManifestExports[key]
            routeManifest[key] = {
              file: route.file,
              id: route.id,
              parentId: route.parentId,
              path: route.path,
              index: route.index,
              caseSensitive: route.caseSensitive,
              /**
               * @see https://reactrouter.com/en/main/route/route
               */
              hasAction: sourceExports.includes('action'),
              hasLoader: sourceExports.includes('loader'),
              hasHydrateFallback: sourceExports.includes('HydrateFallback'),
              hasHandle: sourceExports.includes('handle'),
              hasShouldRevalidate: sourceExports.includes('shouldRevalidate'),
              hasErrorBoundary: sourceExports.includes('ErrorBoundary'),
              /**
               * @ses https://reactrouter.com/en/main/route/lazy
               * Lazy Component
               */
              hasComponent: sourceExports.includes('Component'),
              /**
               * @ses https://reactrouter.com/en/main/route/lazy
               * Non-lazy Component
               */
              hasElement: sourceExports.includes('default'),
            }
          }
        })

        const { routesString, componentsString } = stringifyRoutes(routes, ctx)

        return {
          code: `import React from 'react';
          ${componentsString}\n
          export const routes = ${routesString};\n`,
          map: null,
        }
      }
      return null
    },
    /**
     * @see `buildEnd` in @remix-run/dev/vite/plugin.ts
     */
    async buildEnd() {
      await viteChildCompiler?.close()
    },
    handleHotUpdate({ server }) {
      const { moduleGraph, ws } = server
      const module = moduleGraph.getModuleById(resolvedVirtualModuleId)
      if (module) {
        moduleGraph.invalidateModule(module)
        ws.send({
          type: 'full-reload',
          path: '*',
        })
      }
    },
  }
}

export { remixFlatRoutes }
