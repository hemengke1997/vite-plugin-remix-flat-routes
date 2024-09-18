import type * as Vite from 'vite'
import fs from 'node:fs'
import isPromise from 'p-is-promise'

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
