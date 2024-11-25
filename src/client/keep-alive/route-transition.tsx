import { Transition } from 'react-transition-preset'
import { type KeepAliveProps } from './keep-alive'
import { KeepAliveContext } from './keep-alive-context'

export function RouteTransition(props: {
  children: React.ReactNode
  mounted: boolean
  transition: Exclude<KeepAliveProps['transition'], boolean>
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
