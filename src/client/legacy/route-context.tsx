import { createContainer } from 'context-state'
import { useState } from 'react'
import { type MetaType } from './types'

function useRouteContext() {
  const [metas, setMetas] = useState<MetaType[]>([])

  return {
    metas,
    setMetas,
  }
}

export const RouteContext = createContainer(useRouteContext)

export function useMetas() {
  // const { metas } = RouteContext.usePicker(['metas'])
  // return { metas }
  return { metas: [] }
}
