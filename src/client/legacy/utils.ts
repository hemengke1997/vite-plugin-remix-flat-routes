import { type AnyObject, type MatchRoute, type Route } from './types'

export function collectRouteInfo<M extends AnyObject = AnyObject>(route: Route<M>) {
  const matchRoute: MatchRoute<M> = {}

  if (route.handle) {
    Object.assign(matchRoute, {
      handle: route.handle,
    })
  }

  if (route.id) {
    Object.assign(matchRoute, {
      id: route.id,
    })
  }

  if (route.path) {
    Object.assign(matchRoute, {
      pathname: route.path,
    })
  }

  return matchRoute
}
