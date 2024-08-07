import { memo } from 'react'
import { useRoutes } from 'react-router-dom'
import { RouteContext } from './route-context'
import { RouterUtil } from './router-util'
import { type RouterPropsType } from './types'

function RouterComponent({
  routes,
  onRouteWillMount,
  onRouteMount,
  onRouteUnmount,
  render,
  suspense,
}: RouterPropsType) {
  const { setMetas } = RouteContext.usePicker(['setMetas'])
  const router = new RouterUtil({
    routes,
    onRouteWillMount,
    onRouteMount: (...args) => {
      setMetas((prev) => {
        const meta = args[0]
        if (meta) {
          if (prev.some((item) => item.__route__.id === meta.__route__.id)) {
            return prev
          }
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
          return prev.filter((item) => item.__route__.id !== meta.__route__.id)
        }
        return prev
      })
      onRouteUnmount?.(...args)
    },
    suspense,
  })

  const elements = useRoutes(router.createClientRoutes())

  return render ? render(elements) : elements
}

export default memo(RouterComponent)
