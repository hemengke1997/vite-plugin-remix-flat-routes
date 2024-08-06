import { memo } from 'react'
import { useRoutes } from 'react-router-dom'
import { RouteContext } from './route-context'
import { RouterUtil } from './router-util'
import { type RouterPropsType } from './types'

function RouterComponent({ routes, onRouteWillMount, onRouteMount, onRouteUnmount, suspense }: RouterPropsType) {
  const { setMetas } = RouteContext.usePicker(['setMetas'])
  const router = new RouterUtil({
    routes,
    onRouteWillMount,
    onRouteMount: (...args) => {
      setMetas((prev) => {
        const meta = args[0]
        if (meta) {
          return [...prev, meta]
        }
        return prev
      })
      onRouteMount?.(...args)
    },
    onRouteUnmount: (...args) => {
      setMetas((prev) => {
        const meta = args[0]
        if (meta) {
          return prev.filter((item) => item !== meta)
        }
        return prev
      })
      onRouteUnmount?.(...args)
    },
    suspense,
  })

  const clientRoutes = router.createClientRoutes()

  return useRoutes(clientRoutes)
}

export default memo(RouterComponent)
