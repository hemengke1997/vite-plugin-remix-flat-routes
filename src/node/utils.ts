import type * as Vite from 'vite'
import { pascalSnakeCase } from 'change-case'
import fs from 'fs-extra'
import path from 'node:path'
import { type RouteObject } from 'react-router-dom'
import { findEntry, getRouteManifestModuleExports } from './remix'
import { type PluginContext, type Route, type RouteExports, type RouteManifest } from './types'
import { type LegacyRoute, type LegacyRouteManifest, type LegacyRouteObject } from './types-legacy'

export function stringifyRoutes(routes: Route[], ctx: PluginContext) {
  const staticImport: string[] = []
  const routesString = routesToString(routes, staticImport, ctx)

  return {
    componentsString: staticImport.join('\n'),
    routesString,
  }
}

function routesToString(routes: Route[] | LegacyRoute[], staticImport: string[], ctx: PluginContext) {
  if (ctx.isLegacyMode) {
    return `[${(routes as LegacyRoute[]).map((route) => legacyRouteToString(route, staticImport, ctx)).join(',')}]`
  } else {
    return `[${(routes as Route[]).map((route) => routeToString(route, staticImport, ctx)).join(',')}]`
  }
}

function _setProps<T>(props: Map<T, string | boolean>, name: T, value: string | boolean) {
  if (value) {
    props.set(name, `${value}`)
  }
}

function _isInExports<T>(route: Route | LegacyRoute, name: string) {
  return route[`has${capitalize(name)}` as keyof RouteExports<T>]
}

function _reactElementInExports(route: Route | LegacyRoute, componentName: string, name: string, defaultName?: string) {
  return _isInExports(route, name) ? `React.createElement(${componentName}.${defaultName || name})` : ''
}

function _constantInExports(route: Route | LegacyRoute, componentName: string, name: string) {
  return _isInExports(route, name) ? `${componentName}.${name}` : ''
}

/**
 * 数据路由模式下的路由转换
 */
function routeToString(route: Route, staticImport: string[], ctx: PluginContext): string {
  const componentPath = path.resolve(ctx.remixOptions.appDirectory, route.file)
  const componentName = pascalSnakeCase(route.id)

  const isLazyComponent = route.hasComponent

  const props = new Map<keyof RouteObject, string>()

  const setProps = (name: keyof RouteObject, value: string | boolean) => {
    _setProps(props, name, value)
  }

  setProps('path', route.index && !route.path ? `'/'` : `'${route.path}'`)
  setProps('id', `'${route.id}'`)
  setProps('index', `${route.index}`)

  if (isLazyComponent) {
    setProps('lazy', `() => import('${componentPath}')`)
  } else if (route.hasElement) {
    staticImport.push(`import * as ${componentName} from '${componentPath}';`)

    const reactElementInExports = (name: keyof RouteObject, defaultName?: string) => {
      return _reactElementInExports(route, componentName, name, defaultName)
    }

    const constantInExports = (name: keyof RouteObject) => {
      return _constantInExports(route, componentName, name)
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

/**
 * 非数据路由模式下的路由转换
 */
function legacyRouteToString(route: LegacyRoute, staticImport: string[], ctx: PluginContext): string {
  const componentPath = path.resolve(ctx.remixOptions.appDirectory, route.file)
  const componentName = pascalSnakeCase(route.id)
  const metaPath = route.meta ? path.resolve(ctx.remixOptions.appDirectory, route.meta) : null

  // 与数据路由相反
  const isLazyComponent = !route.hasComponent

  const props = new Map<keyof LegacyRouteObject, string>()

  const setProps = (name: keyof LegacyRouteObject, value: string | boolean) => {
    _setProps(props, name, value)
  }

  if (metaPath) {
    staticImport.push(`import * as ${componentName}_Meta from '${metaPath}';`)
    setProps('meta', `${componentName}_Meta`)
  }

  const reactElementInExports = (name: keyof LegacyRouteObject, defaultName?: string) => {
    return _reactElementInExports(route, componentName, name, defaultName)
  }

  if (isLazyComponent) {
    setProps('lazy', `() => import('${componentPath}')`)
  } else {
    staticImport.push(`import * as ${componentName} from '${componentPath}';`)
    setProps('element', reactElementInExports('Component'))
  }

  setProps('path', route.index && !route.path ? `'/'` : `'${route.path}'`)
  setProps('id', `'${route.id}'`)
  setProps('index', `${route.index}`)

  if (route.children?.length) {
    const children = routesToString(route.children, staticImport, ctx)
    setProps('children', children)
  }

  return `{${[...props.entries()].map(([k, v]) => `${k}:${v}`).join(',')}}`
}

export async function processRouteManifest(viteChildCompiler: Vite.ViteDevServer, ctx: PluginContext) {
  const routeManifestExports = await getRouteManifestModuleExports(viteChildCompiler, ctx)

  let routeManifest: RouteManifest | LegacyRouteManifest
  if (ctx.isLegacyMode) {
    routeManifest = ctx.routeManifest as LegacyRouteManifest
    for (const [key, route] of Object.entries(routeManifest)) {
      const sourceExports = routeManifestExports[key]

      const routeFileDir = path.dirname(route.file)
      let metaFile = findEntry(path.join(ctx.remixOptions.appDirectory, routeFileDir), 'meta')
      if (metaFile) {
        metaFile = path.join(routeFileDir, metaFile)
      }

      routeManifest[key] = {
        ...route,
        file: route.file,
        id: route.id,
        path: route.path,
        index: route.index,
        parentId: route.parentId,
        caseSensitive: route.caseSensitive,
        // 注意：legacy模式下，懒加载组件是默认导出，非懒加载组件是 Component
        // 与数据路由模式正好相反
        // 因为 React.lazy 的入参必须是默认导出

        // Non-lazy Component
        hasElement: sourceExports.includes('default'),
        // Lazy Component
        hasComponent: sourceExports.includes('Component'),
        meta: metaFile,
      }
    }
  } else {
    routeManifest = ctx.routeManifest as RouteManifest
    for (const [key, route] of Object.entries(routeManifest)) {
      const sourceExports = routeManifestExports[key]
      routeManifest[key] = {
        ...route,
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
  }

  return routeManifest
}

export function validateRouteDir(dir: string): void {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`[vite-plugin-remix-flat-routes] routes directory not found: ${dir}`)
  }
}

function capitalize(str: string) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
