import { memo } from 'react'
import { useRoutes } from 'react-router-dom'
import { RouteContext } from './route-context'
import { Router } from './router'
import { type RouterProps } from './types'

function ConfigurableRouter(props: RouterProps) {
  const { routes, onRouteWillMount, onRouteMount, onRouteUnmount, render, suspense } = props

  const router = new Router({
    routes,
    onRouteWillMount,
    onRouteMount,
    onRouteUnmount,
    suspense,
  })

  const clientRoutes = router.createClientRoutes(routes)

  const elements = useRoutes(clientRoutes)

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

export default memo(ConfigurableRouter)
