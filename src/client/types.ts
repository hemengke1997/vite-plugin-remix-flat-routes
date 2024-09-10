import { type ReactNode } from 'react'
import { type Location, type Params, type RouteObject } from 'react-router-dom'

export type Payload = {
  location: Location
  params: Params
  meta: Meta
}

type OnRouteWillMountRes = string | void

export type OnRouteWillMount = (payload: Payload) => OnRouteWillMountRes | Promise<OnRouteWillMountRes>

export type OnRouteMount = (payload: Payload) => void

export type OnRouteUnmount = (payload: Payload) => void

/**
 * 路由对象
 */
export type Route = RouteObject & {
  /**
   * 路由组件
   */
  lazyComponent?: () => Promise<any>
  /**
   * 重定向
   */
  redirect?: string
  /**
   * 路由元信息
   */
  meta?: Meta
  /**
   * 子路由
   */
  children?: Route[]
}

/**
 * 路由元信息
 */
export interface Meta {
  route: {
    id?: string
    index?: boolean
    pathname?: string
  }
  /**
   * 用户自定义元信息
   */
  [key: string]: any
}

export type PropsWithMeta<T = unknown> = {
  meta: Meta
} & T

export interface RouterProps {
  /**
   * 路由配置
   */
  routes: Route[]
  /**
   * 路由挂载之前执行，可用于拦截路由重定向
   */
  onRouteWillMount?: OnRouteWillMount
  /**
   * 路由挂载时执行
   */
  onRouteMount?: OnRouteMount
  /**
   * 路由卸载时执行
   */
  onRouteUnmount?: OnRouteUnmount
  /**
   * 增强渲染函数，用于自定义渲染逻辑
   * 可以跟动画库结合，实现路由切换动画
   */
  render?: (children: ReactNode | null) => ReactNode
  /**
   * 路由懒加载时的loading组件
   */
  suspense?: ReactNode
  /**
   * basename
   */
  basename?: string
}
