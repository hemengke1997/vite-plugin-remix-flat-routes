import isPromise from 'p-is-promise'
import { type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Navigator } from './navigator'
import { useIsomorphicLayoutEffect } from './react-hooks'
import {
  type MetaType,
  type OnRouteBeforeResType,
  type OnRouteMountType,
  type OnRouteUnmountType,
  type OnRouteWillMountType,
} from './types'

let cache: ReactNode | null = null

function Guard({
  element,
  meta,
  onRouteWillMount,
  onRouteMount,
  onRouteUnmount,
}: {
  element: ReactNode
  meta: MetaType
  onRouteWillMount?: OnRouteWillMountType
  onRouteMount?: OnRouteMountType
  onRouteUnmount?: OnRouteUnmountType
}) {
  const location = useLocation()
  const params = useParams()
  const payload = {
    location,
    params,
    meta,
  }

  useIsomorphicLayoutEffect(() => {
    onRouteMount?.(payload)
    return () => {
      onRouteUnmount?.(payload)
    }
  }, [])

  const navigate = useNavigate()

  if (onRouteWillMount) {
    if (cache === element) {
      return element
    }

    const fullPath = location.pathname + location.search + location.hash
    const pathRes = onRouteWillMount(payload)
    if (isPromise(pathRes)) {
      pathRes.then((res: OnRouteBeforeResType) => {
        if (res && res !== fullPath) {
          navigate(res, { replace: true })
        }
      })
    } else if (pathRes && pathRes !== fullPath) {
      element = <Navigator to={pathRes} replace />
    }
  }

  cache = element
  return element
}

export { Guard }
