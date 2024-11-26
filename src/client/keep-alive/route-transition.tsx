import type React from 'react'
import { lazy, Suspense } from 'react'
import { type KeepAliveProps } from './keep-alive'
import { KeepAliveContext } from './keep-alive-context'

const LazyTransition = lazy(() => import('react-transition-preset').then((module) => ({ default: module.Transition })))

export function RouteTransition(props: {
  children: React.ReactNode
  mounted: boolean
  transition: Exclude<KeepAliveProps['transition'], boolean>
}) {
  const { transition } = KeepAliveContext.usePicker(['transition'])
  const { children, mounted, transition: transitionProps } = props

  if (!transition) {
    if (transitionProps?.keepMounted) {
      return children
    }
    return mounted ? children : null
  }

  return (
    <Suspense fallback={null}>
      <LazyTransition
        initial={true}
        duration={200}
        transition={'fade-right'}
        {...(typeof transition === 'boolean' ? {} : transition)}
        {...transitionProps}
        exitDuration={0}
        mounted={mounted}
      >
        {(style: React.CSSProperties) => <div style={style}>{children}</div>}
      </LazyTransition>
    </Suspense>
  )
}
