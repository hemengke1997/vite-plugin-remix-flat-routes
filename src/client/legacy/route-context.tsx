import { createContainer, useMemoFn } from 'context-state'
import pick from 'lodash.pick'
import { useState } from 'react'
import { matchRoutes, type RouteMatch, useLocation } from 'react-router-dom'
import { useUpdateEffect } from './react-hooks'
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

  useUpdateEffect(() => {
    setMetas(resolveMetas())
  }, [location])

  return {
    metas,
  }
}

export const RouteContext = createContainer(useRouteContext)

export function useMetas() {
  const { metas } = RouteContext.usePicker(['metas'])

  return { metas }
}
