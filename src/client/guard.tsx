import { memo, type ReactNode, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import isPromise from 'p-is-promise'
import { useIsomorphicLayoutEffectOnce } from './hooks/use-isomorphic-layout-effectOnce'
import Navigator from './navigator'
import { createRouteContext } from './route-context'
import {
  type AnyObject,
  type MatchRoute,
  type OnRouteMount,
  type OnRouteUnmount,
  type OnRouteWillMount,
  type Payload,
} from './types'

let cache: ReactNode | null = null

function Guard<M extends AnyObject>({
  element,
  matchRoute,
  onRouteWillMount,
  onRouteMount,
  onRouteUnmount,
}: {
  element: ReactNode
  matchRoute: MatchRoute<M>
  onRouteWillMount?: OnRouteWillMount<M>
  onRouteMount?: OnRouteMount<M>
  onRouteUnmount?: OnRouteUnmount<M>
}) {
  const RouteContext = useMemo(() => createRouteContext<M>(), [])
  const { updateMatchRoutes } = RouteContext.usePicker(['updateMatchRoutes'])
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()

  const payload: Payload<M> = useMemo(
    () => ({
      location,
      params,
      ...matchRoute,
    }),
    [location, params, matchRoute],
  )

  const fullPath = useMemo(() => location.pathname + location.search + location.hash, [location])

  useIsomorphicLayoutEffectOnce(() => {
    onRouteMount?.(payload)
    updateMatchRoutes(fullPath)
    return () => {
      onRouteUnmount?.(payload)
    }
  }, [])

  if (onRouteWillMount) {
    if (cache === element) {
      return element
    }

    const pathRes = onRouteWillMount(payload)
    if (isPromise(pathRes)) {
      pathRes.then((res) => {
        if (res && res !== fullPath) {
          navigate(res, { replace: true, state: location.state })
        }
      })
    } else if (pathRes && pathRes !== fullPath) {
      element = <Navigator to={pathRes} replace state={location.state} />
    }
  }

  cache = element
  return element
}

export default memo(Guard) as typeof Guard
