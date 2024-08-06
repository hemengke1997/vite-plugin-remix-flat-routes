import { type ReactNode } from 'react'
import { type RouteObject } from 'react-router-dom'

interface MetaType {
  __route__: {
    id: string
    path: string
    index: boolean
  }
  [key: string]: any
}

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

type OnRouteBeforeResType = string | undefined

interface onRouteWillMountType {
  (payload: { pathname: string; meta: MetaType }): OnRouteBeforeResType | Promise<OnRouteBeforeResType>
}

type OnRouteMountType = (meta: MetaType) => void

type OnRouteUnmountType = (meta: MetaType) => void

interface RouterPropsType {
  /**
   * 路由配置
   */
  routes: RoutesType
  /**
   * 路由挂载之前执行，用于拦截路由重定向
   */
  onRouteWillMount?: onRouteWillMountType
  /**
   * 路由挂载时执行
   */
  onRouteMount?: OnRouteMountType
  /**
   * 路由卸载时执行
   */
  onRouteUnmount?: OnRouteUnmountType
  /**
   * 路由加载时的loading组件
   */
  suspense?: ReactNode
}

export type {
  FunctionalImportType,
  MetaType,
  OnRouteBeforeResType,
  onRouteWillMountType,
  OnRouteMountType,
  OnRouteUnmountType,
  RouterPropsType,
  RouteType,
  RoutesType,
}
