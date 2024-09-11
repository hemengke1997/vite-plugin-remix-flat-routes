import { memo, type ReactNode, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import isPromise from 'p-is-promise'
import Navigator from './navigator'
import { useIsomorphicLayoutEffectOnce } from './react-hooks'
import { createRouteContext } from './route-context'
import {
  type AnyObject,
  type Meta,
  type OnRouteMount,
  type OnRouteUnmount,
  type OnRouteWillMount,
  type Payload,
} from './types'

let cache: ReactNode | null = null

function Guard<M extends AnyObject>({
  element,
  meta,
  onRouteWillMount,
  onRouteMount,
  onRouteUnmount,
}: {
  element: ReactNode
  meta: Meta<M>
  onRouteWillMount?: OnRouteWillMount<M>
  onRouteMount?: OnRouteMount<M>
  onRouteUnmount?: OnRouteUnmount<M>
}) {
  const RouteContext = useMemo(() => createRouteContext<M>(), [])
  const { updateMetas } = RouteContext.usePicker(['updateMetas'])
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()

  const payload: Payload<M> = useMemo(
    () => ({
      location,
      params,
      meta,
    }),
    [location, params, meta],
  )

  const fullPath = useMemo(() => location.pathname + location.search + location.hash, [location])

  useIsomorphicLayoutEffectOnce(() => {
    onRouteMount?.(payload)
    updateMetas(fullPath)
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
