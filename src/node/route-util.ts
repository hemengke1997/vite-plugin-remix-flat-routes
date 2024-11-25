import { type RouteObject } from 'react-router-dom'
import { pascalSnakeCase } from 'change-case'
import path from 'node:path'
import { type ValueOf } from 'type-fest'
import { importViteEsmSync } from './react-router/react-router-dev/vite/import-vite-esm-sync'
import { getRouteManifestModuleExports } from './react-router/react-router-dev/vite/plugin'
import { type RouteManifest } from './react-router/react-router-remix-routes-option-adapter/manifest'
import { type PluginContext, type ProcessedRouteManifest, type Route, type RouteExports } from './types'
import { type LegacyRoute, type LegacyRouteObject, type ProcessedLegacyRouteManifest } from './types.legacy'
import { capitalize } from './utils'

export class RouteUtil {
  constructor(public ctx: PluginContext) {}

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
    const vite = importViteEsmSync()
    const componentPath = vite.normalizePath(path.resolve(this.ctx.remixOptions.appDirectory, route.file))
    const componentName = pascalSnakeCase(route.id)

    const isLazyComponent = route.hasDefaultExport

    const { setProps, props } = this.createPropsSetter<LegacyRouteObject>()

    if (isLazyComponent) {
      setProps(
        'handle',
        /*js*/ `async () => {
          const { handle } = await import('${componentPath}')
          if (!handle) return
          return handle
        }`,
      )
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

    const vite = importViteEsmSync()

    const componentPath = vite.normalizePath(path.resolve(this.ctx.remixOptions.appDirectory, route.file))

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
    setProps('clientLoader', this.constantInExports(route, { importee, namedExport: 'clientLoader' }))
    setProps(
      'loader',
      this.constantInExports(route, {
        importee,
        namedExport: 'loader',
      }),
    )

    setProps('clientAction', this.constantInExports(route, { importee, namedExport: 'clientAction' }))
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

    if (this.ctx.isLegacyMode) {
      const routeManifest = this.ctx.routeManifest as ProcessedLegacyRouteManifest
      await Promise.all(
        Object.entries(routeManifest).map(async ([key, route]) => {
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
        }),
      )

      return routeManifest
    } else {
      const routeManifest = this.ctx.routeManifest as ProcessedRouteManifest

      await Promise.all(
        Object.entries(routeManifest).map(async ([key, route]) => {
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
            hasClientAction: sourceExports.includes('clientAction'),
            hasLoader: sourceExports.includes('loader'),
            hasClientLoader: sourceExports.includes('clientLoader'),
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
        }),
      )
      return routeManifest
    }
  }

  getRoute(file: string): Route {
    const vite = importViteEsmSync()
    const routePath = vite.normalizePath(path.relative(this.ctx.remixOptions.appDirectory, file))
    const route = Object.values(this.ctx.routeManifest).find((r) => vite.normalizePath(r.file) === routePath)
    return route
  }

  /**
   * Adapted from `createClientRoutes` in react-router/lib/dom/ssr/routes.tsx
   */
  createClientRoutes(routeManifest: RouteManifest, parentId?: string): Route[] {
    const routes = Object.keys(routeManifest)
      .filter((key) => routeManifest[key].parentId === parentId)
      .map((key) => {
        const route = this.createClientRoute(routeManifest[key])
        route.children = this.createClientRoutes(routeManifest, route.id)
        return route
      })

    return routes
  }

  private createClientRoute(route: ValueOf<RouteManifest>): Route {
    return {
      ...route,
      path: route.path || '',
      index: !!route.index,
      children: [],
    }
  }
}
