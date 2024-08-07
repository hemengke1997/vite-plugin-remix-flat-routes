import { useNavigate } from 'react-router-dom'
import { useIsomorphicLayoutEffect } from './react-hooks'

function Navigator(props: { to: string; replace: boolean }) {
  const { to, replace } = props
  const nav = useNavigate()
  useIsomorphicLayoutEffect(() => {
    nav(to, { replace })
  }, [])

  return null
}

export { Navigator }
