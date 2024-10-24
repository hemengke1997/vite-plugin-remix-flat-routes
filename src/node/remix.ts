import { parse as esModuleLexer } from 'es-module-lexer'
import fs from 'node:fs'
import path from 'node:path'
import { type ValueOf } from 'type-fest'
import { importViteEsmSync } from './import-vite-esm-sync'
import { flatRoutes, type RouteManifest } from './remix-flat-routes'
import { type PluginContext, type Route } from './types'

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
export async function resolveRoutes(ctx: PluginContext) {
  const {
    remixOptions: { appDirectory, flatRoutesOptions, routes },
  } = ctx

  const rootRouteFile = findEntry(appDirectory, 'root')
  if (!rootRouteFile) {
    throw new Error(`Missing "root" route file in ${appDirectory}`)
  }

  const routeManifest: RouteManifest = {
    root: { path: '', id: 'root', file: rootRouteFile },
  }

  const flatedRotues = flatRoutes(flatRoutesOptions!.routeDir!, flatRoutesOptions?.defineRoutes || defineRoutes, {
    ...flatRoutesOptions,
    ignoredRouteFiles: [...(flatRoutesOptions?.ignoredRouteFiles || []), '**/*.lazy.*'],
  })

  for (const route of Object.values(flatedRotues)) {
    routeManifest[route.id] = { ...route, parentId: route.parentId || 'root' }
  }

  if (routes) {
    const manualRoutes = await routes(defineRoutes, {
      ignoredRouteFiles: ['**/*.lazy.*'],
    })
    for (const route of Object.values(manualRoutes)) {
      routeManifest[route.id] = { ...route, parentId: route.parentId || 'root' }
    }
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
export const getRouteModuleExports = async (
  ctx: PluginContext,
  routeFile: string,
  readRouteFile?: () => string | Promise<string>,
): Promise<string[]> => {
  const { viteChildCompiler } = ctx
  if (!viteChildCompiler) {
    throw new Error('Vite child compiler not found')
  }

  // We transform the route module code with the Vite child compiler so that we
  // can parse the exports from non-JS files like MDX. This ensures that we can
  // understand the exports from anything that Vite can compile to JS, not just
  // the route file formats that the Remix compiler historically supported.

  const ssr = true
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
    readRouteFile?.() ?? fs.promises.readFile(routePath, 'utf-8'),
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
export const getRouteManifestModuleExports = async (ctx: PluginContext): Promise<Record<string, string[]>> => {
  const entries = await Promise.all(
    Object.entries(ctx.routeManifest).map(async ([key, route]) => {
      const sourceExports = await getRouteModuleExports(ctx, route.file)
      return [key, sourceExports] as const
    }),
  )
  return Object.fromEntries(entries)
}

/**
 * @see @remix-run/dev/config/routes.ts
 */
export interface ConfigRoute {
  /**
   * The path this route uses to match on the URL pathname.
   */
  path?: string

  /**
   * Should be `true` if it is an index route. This disallows child routes.
   */
  index?: boolean

  /**
   * Should be `true` if the `path` is case-sensitive. Defaults to `false`.
   */
  caseSensitive?: boolean

  /**
   * The unique id for this route, named like its `file` but without the
   * extension. So `app/routes/gists/$username.tsx` will have an `id` of
   * `routes/gists/$username`.
   */
  id: string

  /**
   * The unique `id` for this route's parent route, if there is one.
   */
  parentId?: string

  /**
   * The path to the entry point for this route, relative to
   * `config.appDirectory`.
   */
  file: string
}

/**
 * @see @remix-run/dev/config/routes.ts
 */
export interface DefineRouteOptions {
  /**
   * Should be `true` if the route `path` is case-sensitive. Defaults to
   * `false`.
   */
  caseSensitive?: boolean

  /**
   * Should be `true` if this is an index route that does not allow child routes.
   */
  index?: boolean

  /**
   * An optional unique id string for this route. Use this if you need to aggregate
   * two or more routes with the same route file.
   */
  id?: string
}

/**
 * @see @remix-run/dev/config/routes.ts
 */
interface DefineRouteChildren {
  (): void
}

/**
 * @see @remix-run/dev/config/routes.ts
 */
export interface DefineRouteFunction {
  (
    /**
     * The path this route uses to match the URL pathname.
     */
    path: string | undefined,

    /**
     * The path to the file that exports the React component rendered by this
     * route as its default export, relative to the `app` directory.
     */
    file: string,

    /**
     * Options for defining routes, or a function for defining child routes.
     */
    optionsOrChildren?: DefineRouteOptions | DefineRouteChildren,

    /**
     * A function for defining child routes.
     */
    children?: DefineRouteChildren,
  ): void
}

/**
 * @see `defineRoutes` in @remix-dev/config/routes.ts
 */
export function defineRoutes(callback: (defineRoute: DefineRouteFunction) => void): RouteManifest {
  const routes: RouteManifest = Object.create(null)
  const parentRoutes: ConfigRoute[] = []
  let alreadyReturned = false

  const defineRoute: DefineRouteFunction = (path, file, optionsOrChildren, children) => {
    if (alreadyReturned) {
      throw new Error(
        'You tried to define routes asynchronously but started defining ' +
          'routes before the async work was done. Please await all async ' +
          'data before calling `defineRoutes()`',
      )
    }

    let options: DefineRouteOptions
    if (typeof optionsOrChildren === 'function') {
      // route(path, file, children)
      options = {}
      children = optionsOrChildren
    } else {
      // route(path, file, options, children)
      // route(path, file, options)
      options = optionsOrChildren || {}
    }

    const route: ConfigRoute = {
      path: path ? path : undefined,
      index: options.index ? true : undefined,
      caseSensitive: options.caseSensitive ? true : undefined,
      id: options.id || createRouteId(file),
      parentId: parentRoutes.length > 0 ? parentRoutes[parentRoutes.length - 1].id : 'root',
      file,
    }

    if (route.id in routes) {
      throw new Error(`Unable to define routes with duplicate route id: "${route.id}"`)
    }

    routes[route.id] = route

    if (children) {
      parentRoutes.push(route)
      children()
      parentRoutes.pop()
    }
  }

  callback(defineRoute)

  alreadyReturned = true

  return routes
}

/**
 * @see `createRouteId` in @remix-dev/config/routes.ts
 */
function createRouteId(file: string) {
  return normalizeSlashes(stripFileExtension(file))
}

/**
 * @see `createRouteId` in @remix-dev/config/routes.ts
 */
function normalizeSlashes(file: string) {
  return file.split(path.win32.sep).join('/')
}

/**
 * @see `createRouteId` in @remix-dev/config/routes.ts
 */
function stripFileExtension(file: string) {
  return file.replace(/\.[a-z0-9]+$/i, '')
}
