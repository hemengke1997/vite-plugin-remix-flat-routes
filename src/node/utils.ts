import type * as Vite from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import isPromise from 'p-is-promise'
import { importViteEsmSync } from './import-vite-esm-sync'
import { type RouteManifest } from './remix-flat-routes'

export function validateRouteDir(dir: string): void {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`[vite-plugin-remix-flat-routes] routes directory not found: ${dir}`)
  }
}

export function capitalize(str: string) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getVitePluginName(plugin: Vite.PluginOption) {
  if (!isPromise(plugin) && typeof plugin === 'object' && plugin !== null && 'name' in plugin) {
    return plugin.name
  }
}

function getRouteFiles(config: {
  viteConfig: Vite.ResolvedConfig
  appDirectory: string
  routeManifest: RouteManifest
}) {
  const vite = importViteEsmSync()
  return (
    Object.values(config.routeManifest).map((route) =>
      vite.normalizePath(path.join(config.viteConfig.root, config.appDirectory, route.file)),
    ) || []
  )
}

export function reactRefreshHack(config: {
  viteConfig: Vite.ResolvedConfig | undefined
  appDirectory: string
  routeManifest: RouteManifest
}) {
  const { viteConfig, appDirectory, routeManifest } = config
  if (
    !viteConfig ||
    viteConfig.isProduction ||
    viteConfig.build.ssr ||
    viteConfig.command === 'build' ||
    viteConfig.server.hmr === false
  ) {
    return ''
  }

  const routeFiles = getRouteFiles({ viteConfig, appDirectory, routeManifest })
  return /*js*/ `if (typeof window !== 'undefined' && import.meta.hot) {
    window.__getReactRefreshIgnoredExports = ({ id }) => {
      const routeFiles = ${JSON.stringify(routeFiles)};
      if (routeFiles.includes(id)) {
        return ['handle', 'loader', 'action', 'shouldRevalidate', 'lazy']
      }
      return []
    }
  }`
}
