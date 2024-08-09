import { type NavigateOptions, useNavigate } from 'react-router-dom'
import { useIsomorphicLayoutEffect } from './react-hooks'

function Navigator(props: { to: string } & NavigateOptions) {
  const { to, ...rest } = props
  const nav = useNavigate()
  useIsomorphicLayoutEffect(() => {
    nav(to, rest)
  }, [])

  return <></>
}

export { Navigator }
