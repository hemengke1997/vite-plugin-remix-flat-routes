import { useMemo, useRef, useState } from 'react'
import { matchRoutes, type RouteMatch, useLocation } from 'react-router-dom'
import { createContainer, useMemoFn } from 'context-state'
import { type AnyObject, type Meta, type Route, type RouterProps } from './types'
import { collectMeta } from './utils'

function getMetasFromMatch<M extends AnyObject = AnyObject>(routes: RouteMatch[] | null): Meta<M>[] {
  if (!routes) return []

  return routes?.map((item) => {
    const route = item.route as Route

    const meta = collectMeta<M>(route)
    return meta
  })
}

export type RouteContextValue<M extends AnyObject = AnyObject> = { clientRoutes: Route[] } & RouterProps<M>

function useRouteContext<M extends AnyObject = AnyObject>({ clientRoutes, basename }: RouteContextValue<M>) {
  const location = useLocation()

  const resolveMetas = useMemoFn(() => {
    const matchedRoutes = matchRoutes(clientRoutes, location, basename)
    return getMetasFromMatch<M>(matchedRoutes)
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

export function createRouteContext<M extends AnyObject = AnyObject>() {
  return createContainer(useRouteContext<M>)
}

export function useMetas<M extends AnyObject = AnyObject>() {
  const RouteContext = useMemo(() => createRouteContext<M>(), [])
  const { metas } = RouteContext.usePicker(['metas'])
  return { metas }
}
