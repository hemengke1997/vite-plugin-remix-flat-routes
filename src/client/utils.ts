import { type Meta, type Route } from './types'

export function collectMeta(route: Route) {
  const meta: Meta = {
    route: {},
  }

  if (route.meta) {
    Object.assign(meta, route.meta)
  }

  if (route.id) {
    Object.assign(meta.route, {
      id: route.id,
    })
  }
  if (route.index) {
    Object.assign(meta.route, {
      index: route.index,
    })
  }
  if (route.path) {
    Object.assign(meta.route, {
      pathname: route.path,
    })
  }

  return meta
}
