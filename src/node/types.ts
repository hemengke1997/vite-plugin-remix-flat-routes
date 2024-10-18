import type * as Vite from 'vite'
import { type RouteObject } from 'react-router-dom'
import { type SetOptional, type ValueOf } from 'type-fest'
import { type ConfigRoute } from './remix'
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
   * 当路由懒加载，但希望在路由加载前获取handle数据 (如 i18n namespace)，
   * 可以将此选项设置为 true，插件会将 handle 转化为异步函数，
   * 执行异步函数即可获取到懒加载路由的handle数据
   *
   * @default false
   */
  handleAsync?: boolean
}

export type RouteExports<T> = AddHasPrefix<T>

type AddHasPrefix<T> = {
  [K in keyof T as `has${Capitalize<string & K>}`]?: boolean
}

export type ProcessedRouteManifest = {
  [routeId: string]: ConfigRoute &
    RouteExports<RouteObject> & {
      /**
       * 路由文件是否默认导出
       */
      hasDefaultExport?: boolean
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
