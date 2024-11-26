import { useLocation } from 'react-router-dom'
import { ensureArray } from '@client/utils'
import { useMemoFn } from 'context-state'
import { useUpdate } from '../../hooks/use-update'
import { KeepAliveContext } from '../contexts/keep-alive'
import { useEventListener } from './use-event-listener'

export function useKeepAlive() {
  const { aliveRoutes, deleteAliveRoutes } = KeepAliveContext.usePicker(['aliveRoutes', 'deleteAliveRoutes'])

  const { pathname } = useLocation()

  const update = useUpdate()

  useEventListener({
    on: {
      activeChange: () => {
        update()
      },
    },
  })

  const destroy = useMemoFn((pathname: string | string[]) => {
    pathname = ensureArray(pathname)
    deleteAliveRoutes(pathname)
  })

  const destroyAll = useMemoFn(() => {
    const diff = getAliveRoutes().filter((t) => t !== pathname)
    deleteAliveRoutes(diff)
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
