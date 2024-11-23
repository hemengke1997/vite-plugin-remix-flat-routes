import { memo, useMemo } from 'react'
import { useRoutes } from 'react-router-dom'
import { createRouteContext } from './route-context'
import { Router } from './router'
import { type AnyObject, type RouterProps } from './types'

function ConfigurableRouter<M extends AnyObject = AnyObject>(props: RouterProps<M>) {
  const { routes, onRouteWillMount, onRouteMount, onRouteUnmount, render, suspense } = props

  const router = useMemo(
    () =>
      new Router<M>({
        routes,
        onRouteWillMount,
        onRouteMount,
        onRouteUnmount,
        suspense,
      }),
    [routes, onRouteWillMount, onRouteMount, onRouteUnmount, suspense],
  )

  const clientRoutes = useMemo(() => router.createClientRoutes(routes), [routes, router])

  const elements = useRoutes(clientRoutes)
  const RouteContext = useMemo(() => createRouteContext<M>(), [])

  return (
    <RouteContext.Provider
      value={{
        clientRoutes,
        ...props,
      }}
    >
      {render ? render(elements) : elements}
    </RouteContext.Provider>
  )
}

export default memo(ConfigurableRouter) as typeof ConfigurableRouter
