import type * as Vite from 'vite'
import { flatRoutes } from '@remix-run/dev/dist/config/flat-routes.js'
import { defineRoutes } from '@remix-run/dev/dist/config/routes.js'
import { parse as esModuleLexer } from 'es-module-lexer'
import fs from 'fs-extra'
import path from 'node:path'
import { flatRoutes as flatRoutesPro } from 'remix-flat-routes'
import { type ValueOf } from 'type-fest'
import { importViteEsmSync } from './import-vite-esm-sync'
import { type PluginContext, type RemixOptions, type Route, type RouteManifest } from './types'

/**
 * @see @remix-run/dev/config.ts
 */
const entryExts = ['.js', '.jsx', '.ts', '.tsx']
export function findEntry(dir: string, basename: string): string | undefined {
  for (const ext of entryExts) {
    const file = path.resolve(dir, basename + ext)
    if (fs.existsSync(file)) {
      return path.relative(dir, file)
    }
  }

  return undefined
}

/**
 * @see `resolveConfig` in @remix-run/dev/config.ts
 */
export async function resolveRoutes(options: RemixOptions) {
  const { appDirectory, flatRoutesOptions } = options

  const rootRouteFile = findEntry(appDirectory, 'root')
  if (!rootRouteFile) {
    throw new Error(`Missing "root" route file in ${appDirectory}`)
  }

  const routeManifest: RouteManifest = {
    root: { path: '', id: 'root', file: rootRouteFile },
  }

  // ignore all files in routes folder to prevent
  // default remix convention from picking up routes
  const fileRoutes = flatRoutes(appDirectory, ['**/*'])
  for (const route of Object.values(fileRoutes)) {
    routeManifest[route.id] = { ...route, parentId: route.parentId || 'root' }
  }

  const manualRoutes = flatRoutesPro(flatRoutesOptions!.routeDir!, defineRoutes, flatRoutesOptions)
  for (const route of Object.values(manualRoutes)) {
    routeManifest[route.id] = { ...route, parentId: route.parentId || 'root' }
  }

  return {
    routeManifest,
  }
}

/**
 * @see `createClientRoutes` in @remix-run/react/routes.tsx
 */
export function createClientRoutes(routeManifest: RouteManifest, parentId?: string): Route[] {
  const routes = Object.keys(routeManifest)
    .filter((key) => routeManifest[key].parentId === parentId)
    .map((key) => {
      const route = createClientRoute(routeManifest[key])
      route.children = createClientRoutes(routeManifest, route.id)
      return route
    })

  return routes
}

/**
 * @see `createClientRoute` in @remix-run/react/routes.tsx
 */
export function createClientRoute(route: ValueOf<RouteManifest>): Route {
  return {
    ...route,
    path: route.path || '',
    index: !!route.index,
    children: [],
  }
}

/**
 * @see `getRouteModuleExports` in @remix-run/dev/vite/plugin.ts
 */
const getRouteModuleExports = async (
  viteChildCompiler: Vite.ViteDevServer | null,
  ctx: PluginContext,
  routeFile: string,
  readRouteFile?: () => string | Promise<string>,
): Promise<string[]> => {
  if (!viteChildCompiler) {
    throw new Error('Vite child compiler not found')
  }

  const ssr = false
  const { pluginContainer, moduleGraph } = viteChildCompiler

  const routePath = path.resolve(ctx.remixOptions.appDirectory, routeFile)
  const url = resolveFileUrl(ctx, routePath)

  const resolveId = async () => {
    const result = await pluginContainer.resolveId(url, undefined, { ssr })
    if (!result) throw new Error(`Could not resolve module ID for ${url}`)
    return result.id
  }

  const [id, code] = await Promise.all([
    resolveId(),
    readRouteFile?.() ?? fs.readFile(routePath, 'utf-8'),
    // pluginContainer.transform(...) fails if we don't do this first:
    moduleGraph.ensureEntryFromUrl(url, ssr),
  ])

  const transformed = await pluginContainer.transform(code, id, { ssr })
  const [, exports] = esModuleLexer(transformed.code)
  const exportNames = exports.map((e) => e.n)

  return exportNames
}

/**
 * @see `resolveFileUrl` in @remix-run/dev/vite/resolve-file-url.ts
 */
const resolveFileUrl = ({ rootDirectory }: { rootDirectory: string }, filePath: string) => {
  const relativePath = path.relative(rootDirectory, filePath)
  const isWithinRoot = !relativePath.startsWith('..') && !path.isAbsolute(relativePath)

  const vite = importViteEsmSync()

  if (!isWithinRoot) {
    // Vite will prevent serving files outside of the workspace
    // unless user explicitly opts in with `server.fs.allow`
    // https://vitejs.dev/config/server-options.html#server-fs-allow
    return path.posix.join('/@fs', vite.normalizePath(filePath))
  }

  return `/${vite.normalizePath(relativePath)}`
}

/**
 * @see `getRouteManifestModuleExports` in @remix-run/dev/vite/plugin.ts
 */
export const getRouteManifestModuleExports = async (
  viteChildCompiler: Vite.ViteDevServer | null,
  ctx: PluginContext,
): Promise<Record<string, string[]>> => {
  const entries = await Promise.all(
    Object.entries(ctx.routeManifest).map(async ([key, route]) => {
      const sourceExports = await getRouteModuleExports(viteChildCompiler, ctx, route.file)
      return [key, sourceExports] as const
    }),
  )
  return Object.fromEntries(entries)
}
