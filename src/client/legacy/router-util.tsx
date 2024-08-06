import React, { type ReactNode } from 'react'
import { type RouteObject } from 'react-router-dom'
import { Guard } from './guard'
import {
  type MetaType,
  type OnRouteMountType,
  type OnRouteUnmountType,
  type onRouteWillMountType,
  type RouterPropsType,
  type RoutesType,
  type RouteType,
} from './types'

export class RouterUtil {
  routes: RoutesType
  onRouteWillMount?: onRouteWillMountType
  onRouteMount?: OnRouteMountType
  onRouteUnmount?: OnRouteUnmountType
  suspense: ReactNode

  constructor(option: RouterPropsType) {
    this.routes = option.routes || []
    this.onRouteWillMount = option.onRouteWillMount
    this.onRouteMount = option.onRouteMount
    this.onRouteUnmount = option.onRouteUnmount
    this.suspense = option.suspense || <div />
  }

  createClientRoutes(routes: RoutesType = this.routes) {
    const useRoutesList: RouteObject[] = []
    const routeList = [...routes]
    routeList.forEach(async (route) => {
      const item = { ...route }
      if (item.path === undefined) {
        return
      }

      const meta: MetaType = {
        __route__: {
          id: item.id!,
          index: item.index!,
          path: item.path,
        },
      }
      if (item.meta) {
        Object.assign(meta, item.meta)
      }

      if (item.lazy) {
        const Component = React.lazy(item.lazy)
        const element = (
          <React.Suspense fallback={this.suspense}>
            <Component __meta__={meta} />
          </React.Suspense>
        )
        item.element = this.createGuard(element, meta)
      } else if (item.element) {
        if (item.element) {
          item.element = this.createGuard(item.element, meta)
        }
      }

      if (item.children) {
        item.children = this.createClientRoutes(item.children)
      }

      useRoutesList.push(this.deleteCustomfProperty(item))
    })
    return useRoutesList
  }

  private deleteCustomfProperty(r: RouteType) {
    delete r.lazy
    delete r.meta

    return r as RouteObject
  }

  private createGuard(element: ReactNode, meta: MetaType) {
    return (
      <Guard
        element={element}
        meta={meta}
        onRouteWillMount={this.onRouteWillMount}
        onRouteMount={this.onRouteMount}
        onRouteUnmount={this.onRouteUnmount}
      />
    )
  }
}
