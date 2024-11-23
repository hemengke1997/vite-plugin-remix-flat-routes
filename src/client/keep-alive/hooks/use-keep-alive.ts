import { useMemoFn } from 'context-state'
import { useUpdate } from '../../hooks/use-update'
import { KeepAliveContext } from '../keep-alive-context'
import { useEventListener } from './use-event-listener'

export function useKeepAlive() {
  const { aliveRoutes, deleteAliveRoutes, clearAliveRoutes } = KeepAliveContext.usePicker([
    'aliveRoutes',
    'deleteAliveRoutes',
    'clearAliveRoutes',
  ])

  const update = useUpdate()

  useEventListener({
    on: {
      modeChange: () => {
        update()
      },
    },
  })

  const destroy = useMemoFn((pathname: string) => {
    deleteAliveRoutes(pathname)
  })

  const destroyAll = useMemoFn(() => {
    clearAliveRoutes()
  })

  const getAliveRoutes = useMemoFn(() =>
    Array.from(aliveRoutes.entries())
      .filter(([, route]) => route.shouldKeepAlive)
      .map(([pathname]) => pathname),
  )

  return {
    destroy,
    destroyAll,
    getAliveRoutes,
  }
}
