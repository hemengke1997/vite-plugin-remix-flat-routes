import type * as Vite from 'vite'
import { type RouteManifest } from '@remix-run/dev/dist/config/routes'
import { pascalSnakeCase } from 'change-case'
import { parse as esModuleLexer } from 'es-module-lexer'
import fs from 'fs-extra'
import path from 'node:path'
import { type RouteObject } from 'react-router-dom'
import type { RemixOptions, Route, RouteExports } from './remix'
import { importViteEsmSync } from './import-vite-esm-sync'

export type RequireOnly<Object, Keys extends keyof Object> = Omit<Object, Keys> & Required<Pick<Object, Keys>>

export type PluginContext = {
  rootDirectory: string
  routeManifest: RouteManifest
  remixOptions: RemixOptions
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

export function stringifyRoutes(routes: Route[], ctx: PluginContext) {
  const staticImport: string[] = []
  const routesString = routesToString(routes, staticImport, ctx)

  return {
    componentsString: staticImport.join('\n'),
    routesString,
  }
}

function routesToString(routes: Route[], staticImport: string[], ctx: PluginContext) {
  return `[${routes.map((route) => routeToString(route, staticImport, ctx)).join(',')}]`
}

function routeToString(route: Route, staticImport: string[], ctx: PluginContext): string {
  const componentPath = path.resolve(ctx.remixOptions.appDirectory, route.file)
  const componentName = pascalSnakeCase(route.id)

  const isLazyComponent = route.hasComponent

  const props = new Map<keyof RouteObject, string>()

  const setProps = (name: keyof RouteObject, value: string | boolean) => {
    if (value) {
      props.set(name, `${value}`)
    }
  }

  setProps('path', `'${route.path}'`)
  setProps('id', `'${route.id}'`)
  setProps('index', `${route.index}`)

  if (isLazyComponent) {
    setProps('lazy', `() => import('${componentPath}')`)
  } else if (route.hasElement) {
    staticImport.push(`import * as ${componentName} from '${componentPath}';`)

    const isInExports = (name: keyof RouteObject) => {
      return route[`has${capitalize(name)}` as keyof RouteExports]
    }

    const reactElementInExports = (name: keyof RouteObject, defaultName?: string) => {
      return isInExports(name) ? `React.createElement(${componentName}.${defaultName || name})` : ''
    }

    const constantInExports = (name: keyof RouteObject) => {
      return isInExports(name) ? `${componentName}.${name}` : ''
    }

    // React Element Exports
    setProps('element', reactElementInExports('element', 'default'))
    setProps('errorElement', reactElementInExports('ErrorBoundary'))
    setProps('hydrateFallbackElement', reactElementInExports('HydrateFallback'))

    // Constant/Function Exports
    setProps('loader', constantInExports('loader'))
    setProps('action', constantInExports('action'))
    setProps('handle', constantInExports('handle'))
    setProps('shouldRevalidate', constantInExports('shouldRevalidate'))
  }

  if (route.children.length) {
    const children = routesToString(route.children, staticImport, ctx)
    setProps('children', children)
  }

  return `{${[...props.entries()].map(([k, v]) => `${k}:${v}`).join(',')}}`
}

function capitalize(str: string) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
