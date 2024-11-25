import { type TransitionProps } from 'react-transition-preset'
import { KeepAliveContext } from './keep-alive-context'
import KeepAliveIn from './keep-alive-in'

export type KeepAliveProps = {
  children?: React.ReactNode
  /**
   * @description Route transition
   * @see react-transition-preset
   * @default false
   */
  transition?: boolean | Omit<TransitionProps, 'children' | 'mounted'>
}

export function KeepAlive(props: KeepAliveProps) {
  return (
    <KeepAliveContext.Provider
      value={{
        transition: props.transition,
      }}
    >
      <KeepAliveIn />
      {props.children}
    </KeepAliveContext.Provider>
  )
}
