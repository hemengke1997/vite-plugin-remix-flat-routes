import { type ValueOf } from 'type-fest'
import { type RouteExports } from './types'

// Taken from react-router-dom@6.3.0
export interface LegacyRouteObject {
  caseSensitive?: boolean
  children?: LegacyRouteObject[]
  element?: React.ReactNode
  index?: boolean
  path?: string

  // 自定义属性
  meta?: string
  Component?: React.ComponentType | null
  /**
   * 懒加载路由组件
   * 避免与 react-router6.4.0 的 lazy 冲突，命名为 lazyComponent
   */
  lazyComponent?: () => Promise<{ default: any }>
  id: string
  file: string
}

export type LegacyRouteManifest = {
  [routeId: string]: LegacyRouteObject &
    RouteExports<LegacyRouteObject> & {
      /**
       * 是否默认导出
       */
      hasDefaultExport?: boolean
    }
}

export type LegacyRoute = ValueOf<LegacyRouteManifest>
