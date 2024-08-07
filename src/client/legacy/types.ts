import { type ReactNode } from 'react'
import { type Location, type Params, type RouteObject } from 'react-router-dom'

interface FunctionalImportType {
  (): Promise<any>
}

type Merge<T, U, X = Pick<U, Exclude<keyof U, keyof T & keyof U>>> = Pick<T & X, keyof T | keyof X>

type RouteType = Merge<
  {
    lazy?: FunctionalImportType
    meta?: MetaType
    children?: RouteType[]
  },
  RouteObject
>

type RoutesType = RouteType[]

type Payload = {
  location: Location
  params: Params
  meta: MetaType
}

type OnRouteBeforeResType = string | void

type OnRouteWillMountType = (payload: Payload) => OnRouteBeforeResType | Promise<OnRouteBeforeResType>

type OnRouteMountType = (payload: Payload) => void

type OnRouteUnmountType = (payload: Payload) => void

/**
 * 路由元信息
 */
type MetaType = {
  /**
   * 内置路由元信息
   */
  __route__: {
    id: string
    path: string
    index: boolean
  }
  /**
   * 用户自定义元信息
   */
  [key: string]: any
}

interface RouterProps {
  /**
   * 路由配置
   */
  routes: RoutesType
  /**
   * 路由挂载之前执行，用于拦截路由重定向
   */
  onRouteWillMount?: OnRouteWillMountType
  /**
   * 路由挂载时执行
   */
  onRouteMount?: OnRouteMountType
  /**
   * 路由卸载时执行
   */
  onRouteUnmount?: OnRouteUnmountType
  /**
   * 增强渲染函数，用于自定义渲染逻辑
   * 可以跟动画库结合，实现路由切换动画
   */
  render?: (children: ReactNode | null) => ReactNode
  /**
   * 路由加载时的loading组件
   */
  suspense?: ReactNode
}

export type {
  FunctionalImportType,
  MetaType,
  OnRouteBeforeResType,
  OnRouteWillMountType,
  OnRouteMountType,
  OnRouteUnmountType,
  RouterProps,
  RouteType,
  RoutesType,
}
