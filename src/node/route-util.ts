import type * as Vite from 'vite'
import { type RouteObject } from 'react-router-dom'
import { pascalSnakeCase } from 'change-case'
import path from 'node:path'
import { findEntry, getRouteManifestModuleExports, getRouteModuleExports } from './remix'
import { type PluginContext, type ProcessedRouteManifest, type Route, type RouteExports } from './types'
import { type LegacyRoute, type LegacyRouteObject, type ProcessedLegacyRouteManifest } from './types.legacy'
import { capitalize } from './utils'

export class RotueUtil {
  constructor(public ctx: PluginContext) {}

  stringifyRoutes(routes: Route[] | LegacyRoute[]) {
    const staticImport: string[] = []
    const routesString = this.routesToString(routes, staticImport)

    return {
      componentsString: staticImport.join('\n'),
      routesString,
    }
  }

  routesToString(routes: Route[] | LegacyRoute[], staticImport: string[]) {
    if (this.ctx.isLegacyMode) {
      return `[${(routes as LegacyRoute[]).map((route) => this.legacyRouteToString(route, staticImport)).join(',')}]`
    } else {
      return `[${(routes as Route[]).map((route) => this.dataApiRouteToString(route, staticImport)).join(',')}]`
    }
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
  legacyRouteToString(route: LegacyRoute, staticImport: string[]): string {
    const componentPath = path.resolve(this.ctx.remixOptions.appDirectory, route.file)
    const componentName = pascalSnakeCase(route.id)
    const metaPath = route.meta ? path.resolve(this.ctx.remixOptions.appDirectory, route.meta) : null

    const isLazyComponent = route.hasDefaultExport

    const { setProps, props } = this.createPropsSetter<LegacyRouteObject>()

    if (metaPath) {
      staticImport.push(`import * as ${componentName}_Meta from '${metaPath}';`)
      setProps('meta', `${componentName}_Meta`)
    }

    if (isLazyComponent) {
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
      const children = this.routesToString(route.children, staticImport)
      setProps('children', children)
    }

    return `{${[...props.entries()].map(([k, v]) => `${k}:${v}`).join(',')}}`
  }

  /**
   * 数据路由模式下的路由转换
   */
  dataApiRouteToString(route: Route, staticImport: string[]): string {
    const importee = pascalSnakeCase(route.id)
    const componentPath = path.resolve(this.ctx.remixOptions.appDirectory, route.file)

    const metaFile = route.metaFile ? path.resolve(this.ctx.remixOptions.appDirectory, route.metaFile) : null

    const { setProps, props } = this.createPropsSetter<RouteObject>()

    setProps('path', route.index && !route.path ? `''` : `'${route.path}'`)
    setProps('id', `'${route.id}'`)
    setProps('index', `${route.index}`)

    // 只要是默认导出，就视为懒加载组件
    if (route.hasDefaultExport) {
      setProps(
        'lazy',
        /*js*/ `async () => {
            const { default: Component, ...rest } = await import('${componentPath}');
            return {
              Component,
              ...rest
            }
          }`,
      )
    }

    if (metaFile) {
      // 如果存在 metaFile，认为是 meta 约定
      // metaFile 中导出的所有属性认为是 Data API
      // @see https://reactrouter.com/en/main/route/route

      const metaImportee = `${importee}_Meta`
      staticImport.push(`import * as ${metaImportee} from '${metaFile}';`)
      this.setDataApiToProps(props, { route, importee: metaImportee, meta: true })

      if (route.hasComponent) {
        // 命名导出
        // 非懒加载组件
        staticImport.push(`import * as ${importee} from '${componentPath}';`)
        this.setDataApiToProps(props, { route, importee, meta: false })
      }
    } else {
      // 遵循 react-router-dom 的约定
      // 可自行导出 react-router-dom 支持的属性
      // @see https://reactrouter.com/en/main/route/route

      // eslint-disable-next-line no-lonely-if
      if (!route.hasDefaultExport) {
        // 非懒加载，把所有导出都认为是 Data API
        staticImport.push(`import * as ${importee} from '${componentPath}';`)
        this.setDataApiToProps(props, { route, importee, meta: false })
      }
    }

    if (route.children.length) {
      const children = this.routesToString(route.children, staticImport)
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
      meta,
    }: {
      route: Route | LegacyRoute
      importee: string
      meta: boolean
    },
  ) {
    const { setProps } = this.createPropsSetter<R>(props)

    // React Element Exports

    setProps(
      'element',
      this.reactElementInExports(route, {
        importee,
        namedExport: 'Component',
        field: meta ? 'metaComponent' : '',
      }),
    )

    setProps(
      'errorElement',
      this.reactElementInExports(route, {
        importee,
        namedExport: 'ErrorBoundary',
        field: meta ? 'metaErrorBoundary' : '',
      }),
    )

    // Constant/Function Exports
    setProps(
      'loader',
      this.constantInExports(route, {
        importee,
        namedExport: 'loader',
        field: meta ? 'metaLoader' : '',
      }),
    )
    setProps(
      'action',
      this.constantInExports(route, {
        importee,
        namedExport: 'action',
        field: meta ? 'metaAction' : '',
      }),
    )

    setProps(
      'handle',
      this.constantInExports(route, {
        importee,
        namedExport: 'handle',
        field: meta ? 'metaHandle' : '',
      }),
    )

    setProps(
      'shouldRevalidate',
      this.constantInExports(route, {
        importee,
        namedExport: 'shouldRevalidate',
        field: meta ? 'metaShouldRevalidate' : '',
      }),
    )

    setProps(
      'lazy',
      this.constantInExports(route, {
        importee,
        namedExport: 'lazy',
        field: meta ? 'metaLazy' : '',
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

  async processRouteManifest(viteChildCompiler: Vite.ViteDevServer) {
    const routeManifestExports = await getRouteManifestModuleExports(viteChildCompiler, this.ctx)

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

          meta: this.resolveMetaFilePath(route.file),
        }
      }
    } else {
      routeManifest = this.ctx.routeManifest as ProcessedRouteManifest

      for (const [key, route] of Object.entries(routeManifest)) {
        const metaFile = this.resolveMetaFilePath(route.file)

        let metaSourceExports: string[] = []

        if (metaFile) {
          metaSourceExports = await getRouteModuleExports(viteChildCompiler, this.ctx, metaFile)
        }

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

          // meta相关
          metaFile,
          hasMetaAction: metaSourceExports.includes('action'),
          hasMetaLoader: metaSourceExports.includes('loader'),
          hasMetaHandle: metaSourceExports.includes('handle'),
          hasMetaShouldRevalidate: metaSourceExports.includes('shouldRevalidate'),
          hasMetaErrorBoundary: metaSourceExports.includes('ErrorBoundary'),
        }
      }
    }

    return routeManifest
  }

  private resolveMetaFilePath(routeFile: string) {
    const routeFileDir = path.dirname(routeFile)
    let metaFile = findEntry(path.join(this.ctx.remixOptions.appDirectory, routeFileDir), this.ctx.meta)
    if (metaFile) {
      metaFile = path.join(routeFileDir, metaFile)
    }
    return metaFile
  }
}
