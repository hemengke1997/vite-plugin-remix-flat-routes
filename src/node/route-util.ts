import { type RouteObject } from 'react-router-dom'
import { pascalSnakeCase } from 'change-case'
import path from 'node:path'
import serialize from 'serialize-javascript'
import { normalizePath } from 'vite'
import { ViteNodeRunner } from 'vite-node/client'
import { ViteNodeServer } from 'vite-node/server'
import { getRouteManifestModuleExports } from './remix'
import { type PluginContext, type ProcessedRouteManifest, type Route, type RouteExports } from './types'
import { type LegacyRoute, type LegacyRouteObject, type ProcessedLegacyRouteManifest } from './types.legacy'
import { capitalize } from './utils'

export class RouteUtil {
  runner: ViteNodeRunner

  constructor(public ctx: PluginContext) {
    const server = new ViteNodeServer(ctx.viteChildCompiler!)

    this.runner = new ViteNodeRunner({
      root: ctx.viteChildCompiler!.config.root,
      base: ctx.viteChildCompiler!.config.base,
      fetchModule(id) {
        return server.fetchModule(id)
      },
      resolveId(id, importer) {
        return server.resolveId(id, importer)
      },
    })
  }

  async stringifyRoutes(routes: Route[] | LegacyRoute[]) {
    const staticImport: string[] = []
    const routesString = await this.routesToString(routes, staticImport)

    return {
      componentsString: staticImport.join('\n'),
      routesString,
    }
  }

  async routesToString(routes: Route[] | LegacyRoute[], staticImport: string[]) {
    let strs: string[]
    if (this.ctx.isLegacyMode) {
      strs = await Promise.all((routes as LegacyRoute[]).map((route) => this.legacyRouteToString(route, staticImport)))
    } else {
      strs = await Promise.all((routes as Route[]).map((route) => this.dataApiRouteToString(route, staticImport)))
    }
    return `[${strs.join(',')}]`
  }

  /**
   * @description 判断是否在导出中
   * @param route 路由对象
   * @param exportName 导出名称
   * @example route.hasComponent
   */
  private isInExports<T>(route: Route | LegacyRoute, exportName: string) {
    return route[`has${capitalize(exportName)}` as keyof RouteExports<T>]
  }

  /**
   * @description 从导出中转换 React Element
   */
  private reactElementInExports(
    route: Route | LegacyRoute,
    {
      importee,
      namedExport,
      field = namedExport,
    }: {
      // 路由字段名称
      field?: string
      // 导入文件名称
      importee: string
      // named export 名称
      namedExport: string
    },
  ) {
    return this.isInExports(route, field || namedExport) ? `React.createElement(${importee}.${namedExport})` : ''
  }

  private createPropsSetter<T extends RouteObject | LegacyRouteObject>(props: Map<keyof T, string> = new Map()) {
    return {
      props,
      setProps: (name: keyof T, value: string | boolean) => {
        if (this.ctx.inRemixContext) {
          const necessary: Array<keyof RouteObject> = ['handle', 'id', 'index', 'caseSensitive', 'children', 'path']

          // @ts-ignore
          if (!necessary.includes(name)) {
            return
          }
        }

        if (value) {
          props.set(name, `${value}`)
        }
      },
    }
  }

  /**
   * 传统路由模式下的路由转换
   */
  async legacyRouteToString(route: LegacyRoute, staticImport: string[]) {
    const componentPath = normalizePath(path.resolve(this.ctx.remixOptions.appDirectory, route.file))
    const componentName = pascalSnakeCase(route.id)

    const isLazyComponent = route.hasDefaultExport

    const { setProps, props } = this.createPropsSetter<LegacyRouteObject>()

    if (isLazyComponent) {
      if (this.ctx.handleAsync) {
        setProps(
          'handle',
          /*ts*/ `async () => {
            const { handle } = await import('${componentPath}')
            if (!handle) return
            return handle
          }`,
        )
      } else {
        const { handle } = await this.runner.executeFile(componentPath)
        if (handle && typeof handle === 'object') {
          setProps('handle', serialize(handle))
        }
      }
      setProps('lazyComponent', `() => import('${componentPath}')`)
    } else if (route.hasComponent) {
      staticImport.push(`import * as ${componentName} from '${componentPath}';`)
      setProps(
        'element',
        this.reactElementInExports(route, {
          importee: componentName,
          namedExport: 'Component',
        }),
      )
    }

    setProps('path', route.index && !route.path ? `''` : `'${route.path}'`)
    setProps('id', `'${route.id}'`)
    setProps('index', `${route.index}`)

    if (route.children?.length) {
      const children = await this.routesToString(route.children, staticImport)
      setProps('children', children)
    }

    return `{${[...props.entries()].map(([k, v]) => `${k}:${v}`).join(',')}}`
  }

  /**
   * 数据路由模式下的路由转换
   */
  async dataApiRouteToString(route: Route, staticImport: string[]): Promise<string> {
    const importee = pascalSnakeCase(route.id)
    const componentPath = normalizePath(path.resolve(this.ctx.remixOptions.appDirectory, route.file))

    const { setProps, props } = this.createPropsSetter<RouteObject>()

    setProps('path', route.index && !route.path ? `''` : `'${route.path}'`)
    setProps('id', `'${route.id}'`)
    setProps('index', `${route.index}`)

    // 只要是默认导出，就视为懒加载组件
    if (route.hasDefaultExport) {
      const escapeHandle = /*ts*/ `async () => {
            const { default: Component, handle, ...rest } = await import('${componentPath}');
            return {
              Component,
              ...rest,
            };
          }`

      if (this.ctx.handleAsync) {
        setProps('lazy', escapeHandle)
        setProps(
          'handle',
          /*ts*/ `async () => {
            const { handle } = await import('${componentPath}')
            if (!handle) return
            return handle
          }`,
        )
      } else {
        setProps('lazy', escapeHandle.replace('handle,', ''))
      }
    }

    // 遵循 react-router-dom 的约定
    // 可自行导出 react-router-dom 支持的属性
    // @see https://reactrouter.com/en/main/route/route
    if (!route.hasDefaultExport) {
      // 非懒加载，把所有导出都认为是 Data API
      staticImport.push(`import * as ${importee} from '${componentPath}';`)
      this.setDataApiToProps(props, {
        route,
        importee,
      })
    }

    if (route.children.length) {
      const children = await this.routesToString(route.children, staticImport)
      setProps('children', children)
    }

    return `{${[...props.entries()].map(([k, v]) => `${k}:${v}`).join(',')}}`
  }

  /**
   * @description 设置 Data API 到 props
   */
  private setDataApiToProps<R extends Record<string, any>>(
    props: Map<keyof R, string>,
    {
      route,
      importee,
    }: {
      route: Route | LegacyRoute
      importee: string
    },
  ) {
    const { setProps } = this.createPropsSetter<R>(props)

    // React Element Exports
    setProps(
      'element',
      this.reactElementInExports(route, {
        importee,
        namedExport: 'Component',
      }),
    )

    setProps(
      'errorElement',
      this.reactElementInExports(route, {
        importee,
        namedExport: 'ErrorBoundary',
      }),
    )

    // Constant/Function Exports
    setProps(
      'loader',
      this.constantInExports(route, {
        importee,
        namedExport: 'loader',
      }),
    )
    setProps(
      'action',
      this.constantInExports(route, {
        importee,
        namedExport: 'action',
      }),
    )

    setProps(
      'handle',
      this.constantInExports(route, {
        importee,
        namedExport: 'handle',
      }),
    )

    setProps(
      'shouldRevalidate',
      this.constantInExports(route, {
        importee,
        namedExport: 'shouldRevalidate',
      }),
    )

    setProps(
      'lazy',
      this.constantInExports(route, {
        importee,
        namedExport: 'lazy',
      }),
    )
  }

  /**
   * @description 从导出中转换常量
   */
  private constantInExports(
    route: Route | LegacyRoute,
    {
      importee,
      namedExport,
      field = namedExport,
    }: {
      // 路由字段名称
      field?: string
      // 导入文件名称
      importee: string
      // named export 名称
      namedExport: string
    },
  ) {
    return this.isInExports(route, field || namedExport) ? `${importee}.${namedExport}` : ''
  }

  async processRouteManifest() {
    const routeManifestExports = await getRouteManifestModuleExports(this.ctx)

    let routeManifest
    if (this.ctx.isLegacyMode) {
      routeManifest = this.ctx.routeManifest as ProcessedLegacyRouteManifest
      for (const [key, route] of Object.entries(routeManifest)) {
        const sourceExports = routeManifestExports[key]

        routeManifest[key] = {
          ...route,
          file: route.file,
          id: route.id,
          path: route.path,
          index: route.index,
          caseSensitive: route.caseSensitive,

          // lazy Component
          hasDefaultExport: sourceExports.includes('default'),
          // Non-Lazy Component
          hasComponent: sourceExports.includes('Component'),
        }
      }
    } else {
      routeManifest = this.ctx.routeManifest as ProcessedRouteManifest

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
          hasHandle: sourceExports.includes('handle'),
          hasShouldRevalidate: sourceExports.includes('shouldRevalidate'),
          hasErrorBoundary: sourceExports.includes('ErrorBoundary'),
          /**
           * @ses https://reactrouter.com/en/main/route/lazy
           * Lazy Component
           */
          hasLazy: sourceExports.includes('lazy'),
          hasComponent: sourceExports.includes('Component'),

          hasDefaultExport: sourceExports.includes('default'),
        }
      }
    }

    return routeManifest
  }
}
