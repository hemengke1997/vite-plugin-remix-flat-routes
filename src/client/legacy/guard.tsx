import isPromise from 'p-is-promise'
import { type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Navigator } from './navigator'
import { useEffectOnce } from './react-hooks'
import {
  type MetaType,
  type OnRouteBeforeResType,
  type OnRouteMountType,
  type OnRouteUnmountType,
  type onRouteWillMountType,
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
  onRouteWillMount?: onRouteWillMountType
  onRouteMount?: OnRouteMountType
  onRouteUnmount?: OnRouteUnmountType
}) {
  useEffectOnce(() => {
    onRouteMount?.(meta)
    return () => {
      onRouteUnmount?.(meta)
    }
  }, [])

  const { pathname } = useLocation()

  const navigate = useNavigate()

  if (onRouteWillMount) {
    if (cache === element) {
      return element
    }
    const pathRes = onRouteWillMount({ pathname, meta })
    if (isPromise(pathRes)) {
      pathRes.then((res: OnRouteBeforeResType) => {
        if (res && res !== pathname) {
          navigate(res, { replace: true })
        }
      })
    } else if (pathRes && pathRes !== pathname) {
      element = <Navigator to={pathRes} replace />
    }
  }

  cache = element
  return element
}

export { Guard }
