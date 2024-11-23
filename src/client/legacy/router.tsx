import React, { Fragment, type ReactNode } from 'react'
import cloneDeep from 'clone-deep'
import Guard from './guard'
import Navigator from './navigator'
import {
  type AnyObject,
  type MatchRoute,
  type OnRouteMount,
  type OnRouteUnmount,
  type OnRouteWillMount,
  type Route,
  type RouterProps,
} from './types'
import { collectRouteInfo } from './utils'

export class Router<M extends AnyObject = AnyObject> {
  routes: Route[]
  onRouteWillMount?: OnRouteWillMount<M>
  onRouteMount?: OnRouteMount<M>
  onRouteUnmount?: OnRouteUnmount<M>
  suspense: ReactNode

  constructor(option: RouterProps<M>) {
    this.routes = option.routes || []
    this.onRouteWillMount = option.onRouteWillMount
    this.onRouteMount = option.onRouteMount
    this.onRouteUnmount = option.onRouteUnmount
    this.suspense = option.suspense || <Fragment />
  }

  createClientRoutes(_routes: Route<M>[]) {
    const clientRoutes: Route<M>[] = []
    for (const route of cloneDeep(_routes)) {
      if (route.path === undefined) {
        continue
      }

      const matchRoute = collectRouteInfo<M>(route)
      if (route.redirect) {
        route.element = <Navigator to={route.redirect} replace={true}></Navigator>
      } else if (route.lazyComponent) {
        const Component = React.lazy(route.lazyComponent)
        const element = (
          <React.Suspense fallback={this.suspense}>
            <Component {...matchRoute} />
          </React.Suspense>
        )
        route.element = this.createGuard(element, matchRoute)
      } else if (route.element) {
        route.element = this.createGuard(
          React.cloneElement(route.element as React.ReactElement, {
            ...matchRoute,
          }),
          matchRoute,
        )
      }

      if (route.children) {
        route.children = this.createClientRoutes(route.children)
      }

      clientRoutes.push(route)
    }
    return clientRoutes
  }

  private createGuard(element: ReactNode, matchRoute: MatchRoute<M>) {
    return (
      <Guard<M>
        element={element}
        matchRoute={matchRoute}
        onRouteWillMount={this.onRouteWillMount}
        onRouteMount={this.onRouteMount}
        onRouteUnmount={this.onRouteUnmount}
      />
    )
  }
}
