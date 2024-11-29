import type * as Vite from 'vite'
import { type RouteObject } from 'react-router-dom'
import { type SetOptional, type ValueOf } from 'type-fest'
import { type RouteManifestEntry } from './react-router/react-router-remix-routes-option-adapter/manifest'
import { type DefineRoutesFunction, type FlatRoutesOptions } from './remix-flat-routes'
import { type ProcessedLegacyRouteManifest } from './types.legacy'

export type Options = SetOptional<RemixOptions, 'appDirectory'> & {
  /**
   * @description 使用 react-router-dom<=6.3.0 传统路由模式
   * 插件默认会探测 react-router-dom 版本，如果版本小于等于 6.3.0，则使用legacy模式
   */
  legacy?: boolean
  /**
   * @description handle 转化为异步函数获取数据
   *
   * 若选项为 true，插件会将 handle 转化为异步函数，
   * 执行异步函数即可获取到懒加载路由的handle数据
   *
   * 传统路由模式下，此选项无效，始终为 true
   *
   * @default false
   */
  handleAsync?: boolean
  /**
   * @description 是否对 react-refresh 进行 hack
   *
   * react-refresh 无法处理非组件导出，hmr 会导致页面刷新
   *
   * 开启此选项，插件会 hack react-refresh，避免页面刷新
   *
   * 需要 @vitejs/plugin-react>=4.3.2
   * 或 @vitejs/plugin-react-swc>=3.6.0
   *
   * @default true
   */
  reactRefresh?: boolean
}

export type RouteExports<T> = AddHasPrefix<T>

type AddHasPrefix<T> = {
  [K in keyof T as `has${Capitalize<string & K>}`]?: boolean
}

export type ProcessedRouteManifest = {
  [routeId: string]: RouteManifestEntry &
    // Add `has` prefix to each key
    RouteExports<RouteObject> & {
      /**
       * 路由文件是否默认导出
       */
      hasDefaultExport?: boolean

      /**
       * react-router@7
       */
      hasClientLoader?: boolean
      hasClientAction?: boolean
    }
}

export type Route = ValueOf<ProcessedRouteManifest> & {
  /**
   * @description 存放路由元数据的文件路径
   */
  children: Route[]
}

export type PluginContext = {
  /**
   * @description 项目根目录
   */
  rootDirectory: string
  /**
   * @description 路由清单
   */
  routeManifest: ProcessedRouteManifest | ProcessedLegacyRouteManifest
  /**
   * @description remix-flat-routes 配置
   */
  remixOptions: RemixOptions
  /**
   * @description 是否使用 react-router-dom<=6.3.0 传统路由模式
   */
  isLegacyMode: boolean
  /**
   * 是否在remix环境中
   */
  inRemixContext: boolean
  /**
   * vite编译器
   */
  viteChildCompiler: Vite.ViteDevServer | null
  /**
   * handle 转化为异步函数获取数据
   */
  handleAsync: boolean
  /**
   * hack react-refresh
   */
  reactRefresh: boolean
}

export type RemixOptions = {
  appDirectory: string
  flatRoutesOptions?: Pick<
    FlatRoutesOptions,
    'paramPrefixChar' | 'routeDir' | 'routeRegex' | 'visitFiles' | 'basePath' | 'ignoredRouteFiles' | 'defineRoutes'
  >
  routes?: (
    defineRoutes: DefineRoutesFunction,
    options: {
      ignoredRouteFiles: string[]
    },
  ) => ReturnType<DefineRoutesFunction> | Promise<ReturnType<DefineRoutesFunction>>
}
