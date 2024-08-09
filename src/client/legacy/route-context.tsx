import { createContainer, useMemoFn } from 'context-state'
import pick from 'lodash.pick'
import { useRef, useState } from 'react'
import { matchRoutes, type RouteMatch, useLocation } from 'react-router-dom'
import { type Meta, type Route, type RouterProps } from './types'

function getMetasFromMatch(routes: RouteMatch[] | null): Meta[] {
  if (!routes) return []

  return routes?.map((item) => {
    const route = item.route as Route
    return {
      route: pick(route, ['id', 'index', 'meta', 'path']),
      ...pick(route, 'meta')?.meta,
    }
  })
}

function useRouteContext({ clientRoutes, basename }: { clientRoutes: Route[] } & RouterProps) {
  const location = useLocation()

  const resolveMetas = useMemoFn(() => {
    const matchedRoutes = matchRoutes(clientRoutes, location, basename)
    return getMetasFromMatch(matchedRoutes)
  })

  const [metas, setMetas] = useState(resolveMetas)

  const previousPath = useRef<string>()
  const updateMetas = useMemoFn((path: string) => {
    if (previousPath.current === path) return
    previousPath.current = path
    setMetas(resolveMetas())
  })

  return {
    metas,
    updateMetas,
  }
}

export const RouteContext = createContainer(useRouteContext)

export function useMetas() {
  const { metas } = RouteContext.usePicker(['metas'])

  return { metas }
}
