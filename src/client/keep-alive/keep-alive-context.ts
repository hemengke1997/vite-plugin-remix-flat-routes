import { createContainer } from 'context-state'
import { useMapState } from './hooks/use-map-state'
import { type KeepAliveProps } from './keep-alive'

function useKeepAliveContext(initialValue: { transition?: KeepAliveProps['transition'] }) {
  const { transition = false } = initialValue

  const [
    aliveRoutes,
    { mapSetState: setAliveRoutes, mapDeleteState: deleteAliveRoutes, clearMapState: clearAliveRoutes },
  ] = useMapState<
    Map<
      string,
      {
        component: React.ReactElement | null
        shouldKeepAlive: boolean
      }
    >
  >(new Map())

  return {
    aliveRoutes,
    setAliveRoutes,
    deleteAliveRoutes,
    clearAliveRoutes,
    transition,
  }
}

export const KeepAliveContext = createContainer(useKeepAliveContext)
