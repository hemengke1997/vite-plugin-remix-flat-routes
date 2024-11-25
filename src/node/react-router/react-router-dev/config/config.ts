import { defineRoutes } from '@node/react-router/react-router-remix-routes-option-adapter/defineRoutes'
import { type RouteManifest } from '@node/react-router/react-router-remix-routes-option-adapter/manifest'
import flatRoutes from '@node/remix-flat-routes'
import { type PluginContext } from '@node/types'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Adapted from react-router/packages/react-router-dev/config/config.ts
 * @see `resolveConfig`
 */
export async function resolveConfig(ctx: PluginContext) {
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
