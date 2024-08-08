import cloneDeep from 'clone-deep'
import React, { Fragment, type ReactNode } from 'react'
import { Guard } from './guard'
import {
  type Meta,
  type OnRouteMount,
  type OnRouteUnmount,
  type OnRouteWillMount,
  type Route,
  type RouterProps,
} from './types'

export class Router {
  routes: Route[]
  onRouteWillMount?: OnRouteWillMount
  onRouteMount?: OnRouteMount
  onRouteUnmount?: OnRouteUnmount
  suspense: ReactNode

  constructor(option: RouterProps) {
    this.routes = option.routes || []
    this.onRouteWillMount = option.onRouteWillMount
    this.onRouteMount = option.onRouteMount
    this.onRouteUnmount = option.onRouteUnmount
    this.suspense = option.suspense || <Fragment />
  }

  createClientRoutes(_routes: Route[]) {
    const clientRoutes: Route[] = []
    cloneDeep(_routes).forEach(async (route) => {
      if (route.path === undefined) {
        return
      }

      const meta: Meta = {
        route: {
          id: route.id!,
          index: route.index!,
          path: route.path,
        },
      }

      if (route.meta) {
        Object.assign(meta, route.meta)
      }

      if (route.lazy) {
        const Component = React.lazy(route.lazy)
        const element = (
          <React.Suspense fallback={this.suspense}>
            <Component meta={meta} />
          </React.Suspense>
        )
        route.element = this.createGuard(element, meta)
      } else if (route.element) {
        if (route.element) {
          route.element = this.createGuard(
            React.cloneElement(route.element as React.ReactElement, {
              meta,
            }),
            meta,
          )
        }
      }

      if (route.children) {
        route.children = this.createClientRoutes(route.children)
      }

      clientRoutes.push(route)
    })
    return clientRoutes
  }

  private createGuard(element: ReactNode, meta: Meta) {
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
