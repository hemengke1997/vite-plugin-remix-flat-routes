import { type AppConfig } from '@remix-run/dev/dist/config'
import { flatRoutes } from '@remix-run/dev/dist/config/flat-routes.js'
import { type ConfigRoute } from '@remix-run/dev/dist/config/routes'
import { defineRoutes } from '@remix-run/dev/dist/config/routes.js'
import fs from 'fs-extra'
import path from 'node:path'
import { type RouteObject } from 'react-router-dom'
import { type FlatRoutesOptions } from 'remix-flat-routes'
import { flatRoutes as flatRoutesPro } from 'remix-flat-routes'
import { type SetRequired, type ValueOf } from 'type-fest'

export type RouteExports = AddHasPrefix<RouteObject>

type AddHasPrefix<T> = {
  [K in keyof T as `has${Capitalize<string & K>}`]: boolean
}

export type RemixRouteManifest = {
  [routeId: string]: ConfigRoute & RouteExports
}

export type Route = ConfigRoute &
  RouteExports & {
    // custom properties
    id: string
    file: string

    // react-router route properties
    path: string
    index: boolean
    children: Route[]
  }

export type RemixOptions = SetRequired<Pick<AppConfig, 'appDirectory'>, 'appDirectory'> & {
  flatRoutesOptions?: Pick<
    FlatRoutesOptions,
    'paramPrefixChar' | 'routeDir' | 'routeRegex' | 'visitFiles' | 'basePath' | 'ignoredRouteFiles'
  >
}

/**
 * @see @remix-run/dev/config.ts
 */
const entryExts = ['.js', '.jsx', '.ts', '.tsx']
function findEntry(dir: string, basename: string): string | undefined {
  for (const ext of entryExts) {
    const file = path.resolve(dir, basename + ext)
    if (fs.existsSync(file)) return path.relative(dir, file)
  }

  return undefined
}

/**
 * @see `resolveConfig` in @remix-run/dev/config.ts
 */
export async function resolveRoutes(
  options: RemixOptions,
  onRemixFlatEnd: (routeManifest: RemixRouteManifest) => Promise<void>,
) {
  const { appDirectory, flatRoutesOptions } = options

  const rootRouteFile = findEntry(appDirectory, 'root')
  if (!rootRouteFile) {
    throw new Error(`Missing "root" route file in ${appDirectory}`)
  }

  const routeManifest: RemixRouteManifest = {
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

  await onRemixFlatEnd(routeManifest)

  return {
    routes: createClientRoutes(routeManifest) as Route[],
    routeManifest,
  }
}

/**
 * @see `createClientRoutes` in @remix-run/react/routes.tsx
 */
export function createClientRoutes(routeManifest: RemixRouteManifest, parentId?: string): Route[] {
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
export function createClientRoute(route: ValueOf<RemixRouteManifest>): Route {
  return {
    ...route,
    path: route.path || '',
    index: !!route.index,
    children: [],
  }
}
