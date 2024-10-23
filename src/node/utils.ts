import type * as Vite from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import isPromise from 'p-is-promise'
import serializeJavascript from 'serialize-javascript'
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
      vite.normalizePath(path.join(config.appDirectory, route.file)),
    ) || []
  )
}

export const reactRefreshUnsupportedExports = ['handle', 'loader', 'action', 'shouldRevalidate', 'lazy']

export function reactRefreshHack(config: {
  viteConfig: Vite.ResolvedConfig
  appDirectory: string
  routeManifest: RouteManifest
  enable: boolean
}) {
  const { viteConfig, appDirectory, routeManifest, enable } = config

  if (!enable) return ''

  const routeFiles = getRouteFiles({ viteConfig, appDirectory, routeManifest })

  return `if (typeof window !== 'undefined' && import.meta.hot) {
    window.__getReactRefreshIgnoredExports = ({ id, prevExports, nextExports }) => {
      const routeFiles = ${JSON.stringify(routeFiles)}
      
      import.meta.hot.send('remix-flat-routes:react-refresh', {
        id,
        prevExports,
        nextExports,
      })
      
      if (routeFiles.includes(id)) {
        return ${JSON.stringify(reactRefreshUnsupportedExports)}
      }
      return []
    }
  }
  `
}

function pick<T extends Record<string, any>>(obj: T, keys: string[]) {
  const result = {} as Record<string, any>
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result as T
}

export function isObjEq<T extends Record<string, any>>(a: T, b: T): boolean {
  a = pick(a, reactRefreshUnsupportedExports)
  b = pick(b, reactRefreshUnsupportedExports)
  const keys1 = Object.keys(a)
  const keys2 = Object.keys(b)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (serializeJavascript(a[key]) !== serializeJavascript(b[key])) {
      return false
    }
  }

  return true
}
