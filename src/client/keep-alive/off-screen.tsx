import { Suspense, useRef } from 'react'
import { useMemoFn } from 'context-state'
import { useUpdateEffect } from '../hooks/use-update-effect'
import { useEventListener } from './hooks/use-event-listener'
import OffScreenIn, { type OffScreenInProps } from './off-screen-in'
import { RouteTransition } from './route-transition'

export default function OffScreen(props: OffScreenInProps) {
  const { mode, pathname } = props

  const { eventListener } = useEventListener()

  const emitted = useRef(false)

  const emitActiveChange = useMemoFn(() => {
    eventListener.emit('activeChange', {
      pathname,
      mode,
    })
  })

  useUpdateEffect(() => {
    if (mode === 'visible') {
      emitActiveChange()
      emitted.current = true
    } else if (emitted.current) {
      // hidden
      emitActiveChange()
    }
  }, [mode])

  return (
    <RouteTransition
      mounted={mode === 'visible'}
      transition={{
        keepMounted: true,
        unsafe_alwaysMounted: true,
      }}
    >
      <Suspense fallback={null}>
        <OffScreenIn {...props} />
      </Suspense>
    </RouteTransition>
  )
}
