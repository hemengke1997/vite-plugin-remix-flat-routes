import { type ReactNode } from 'react'
import { type Location, type Params, type RouteObject } from 'react-router-dom'

export type AnyObject = Record<string, any>

export type Payload<M extends AnyObject = AnyObject> = {
  location: Location
  params: Params
} & MatchRoute<M>

type OnRouteWillMountRes = string | void

export type OnRouteWillMount<M extends AnyObject = AnyObject> = (
  payload: Payload<M>,
) => OnRouteWillMountRes | Promise<OnRouteWillMountRes>

export type OnRouteMount<M extends AnyObject = AnyObject> = (payload: Payload<M>) => void

export type OnRouteUnmount<M extends AnyObject = AnyObject> = (payload: Payload<M>) => void

/**
 * 路由对象
 */
export type Route<M extends AnyObject = AnyObject> = Omit<RouteObject, 'handle' | 'index'> & {
  /**
   * 路由组件
   */
  lazyComponent?: () => Promise<any>
  /**
   * 重定向
   */
  redirect?: string
  /**
   * handle
   */
  handle?: M
  /**
   * 子路由
   */
  children?: Route<M>[]
}

export type MatchRoute<M extends AnyObject = AnyObject> = {
  id?: string
  pathname?: string
  handle?: M
}

export type PropsWithMatchRoute<P = unknown, M extends AnyObject = AnyObject> = MatchRoute<M> & P

export interface RouterProps<M extends AnyObject = AnyObject> {
  /**
   * 路由配置
   */
  routes: Route<M>[]
  /**
   * 路由挂载之前执行，可用于拦截路由重定向
   */
  onRouteWillMount?: OnRouteWillMount<M>
  /**
   * 路由挂载时执行
   */
  onRouteMount?: OnRouteMount<M>
  /**
   * 路由卸载时执行
   */
  onRouteUnmount?: OnRouteUnmount<M>
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
