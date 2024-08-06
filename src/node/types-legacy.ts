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
  /**
   * @description 存放路由元数据的文件路径
   */
  meta?: string
  Component?: React.ComponentType | null
  /**
   * 懒加载路由组件
   */
  lazy?: () => Promise<{ default: any }>
  id: string
  file: string
}

export type LegacyRouteManifest = {
  [routeId: string]: LegacyRouteObject & RouteExports<LegacyRouteObject>
}

export type LegacyRoute = ValueOf<LegacyRouteManifest>
