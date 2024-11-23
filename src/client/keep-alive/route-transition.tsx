import { Transition, type TransitionProps } from 'react-transition-preset'
import { KeepAliveContext } from './keep-alive-context'

export function RouteTransition(props: {
  children: React.ReactNode
  mounted: boolean
  transition: Omit<TransitionProps, 'children' | 'mounted'>
}) {
  const { transition } = KeepAliveContext.usePicker(['transition'])
  const { children, mounted, transition: transitionProps } = props

  if (!transition) {
    return children
  }

  return (
    <Transition
      initial={true}
      {...(typeof transition === 'boolean' ? {} : transition)}
      {...transitionProps}
      mounted={mounted}
    >
      {(style) => <div style={style}>{children}</div>}
    </Transition>
  )
}
