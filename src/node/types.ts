import { type RouteObject } from 'react-router-dom'
import { type SetOptional, type ValueOf } from 'type-fest'
import { type ConfigRoute } from './remix'
import { type FlatRoutesOptions } from './remix-flat-routes'
import { type LegacyRouteManifest } from './types-legacy'

export type Options = SetOptional<RemixOptions, 'appDirectory'> & {
  /**
   * @description 使用 react-router-dom<=6.3.0 传统路由模式
   * 插件默认会探测 react-router-dom 版本，如果版本小于等于 6.3.0，则使用legacy模式
   */
  legacy?: boolean
}

export type RouteExports<T> = AddHasPrefix<T>

type AddHasPrefix<T> = {
  [K in keyof T as `has${Capitalize<string & K>}`]?: boolean
}

export type RouteManifest = {
  [routeId: string]: ConfigRoute &
    RouteExports<RouteObject> & {
      // 自定义属性
      /**
       * meta 文件路径
       */
      metaFile?: string
      /**
       * meta 是否导出 action
       */
      hasMetaAction?: boolean
      /**
       * meta 是否导出 loader
       */
      hasMetaLoader?: boolean
      /**
       * meta 是否导出 hydrateFallback
       */
      hasMetaHydrateFallback?: boolean
      /**
       * meta 是否导出 handle
       */
      hasMetaHandle?: boolean
      /**
       * meta 是否导出 shouldRevalidate
       */
      hasMetaShouldRevalidate?: boolean
      /**
       * meta 是否导出 errorBoundary
       */
      hasMetaErrorBoundary?: boolean
    }
}

export type Route = ValueOf<RouteManifest> & {
  /**
   * @description 存放路由元数据的文件路径
   */
  metaFile?: string
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
  routeManifest: RouteManifest | LegacyRouteManifest
  /**
   * @description remix-flat-routes 配置
   */
  remixOptions: RemixOptions
  /**
   * @description meta 文件名
   */
  meta: string
  /**
   * @description 是否使用 react-router-dom<=6.3.0 传统路由模式
   */
  isLegacyMode: boolean
}

export type RemixOptions = {
  appDirectory: string
  flatRoutesOptions?: Pick<
    FlatRoutesOptions,
    'paramPrefixChar' | 'routeDir' | 'routeRegex' | 'visitFiles' | 'basePath' | 'ignoredRouteFiles'
  >
}
