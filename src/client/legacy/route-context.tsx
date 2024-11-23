import { useMemo, useRef, useState } from 'react'
import { type RouteMatch, matchRoutes as routerMathRoutes, useLocation } from 'react-router-dom'
import { createContainer, useMemoFn } from 'context-state'
import { type AnyObject, type MatchRoute, type Route, type RouterProps } from './types'
import { collectRouteInfo } from './utils'

function getHandlesFromMatch<M extends AnyObject = AnyObject>(routes: RouteMatch[] | null): MatchRoute<M>[] {
  if (!routes) return []
  return routes?.map((item) => {
    const route = item.route as Route<M>
    const matchRoute = collectRouteInfo<M>(route)
    return matchRoute
  })
}

export type RouteContextValue<M extends AnyObject = AnyObject> = { clientRoutes: Route[] } & RouterProps<M>

function useRouteContext<M extends AnyObject = AnyObject>({ clientRoutes, basename }: RouteContextValue<M>) {
  const location = useLocation()

  const resolveMatches = useMemoFn(() => {
    const matchedRoutes = routerMathRoutes(clientRoutes, location, basename)
    return getHandlesFromMatch<M>(matchedRoutes)
  })

  const [matchRoutes, setMatchRoutes] = useState(resolveMatches)

  const previousPath = useRef<string>()
  const updateMatchRoutes = useMemoFn((path: string) => {
    if (previousPath.current === path) return
    previousPath.current = path
    setMatchRoutes(resolveMatches())
  })

  return {
    matchRoutes,
    updateMatchRoutes,
  }
}

export function createRouteContext<M extends AnyObject = AnyObject>() {
  return createContainer(useRouteContext<M>)
}

export function useMatchRoutes<M extends AnyObject = AnyObject>() {
  const RouteContext = useMemo(() => createRouteContext<M>(), [])
  const { matchRoutes } = RouteContext.usePicker(['matchRoutes'])
  return matchRoutes
}
