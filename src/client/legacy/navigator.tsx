import { useNavigate } from 'react-router-dom'
import { useEffectOnce } from './react-hooks'

function Navigator(props: { to: string; replace: boolean }) {
  const { to, replace } = props
  const nav = useNavigate()
  useEffectOnce(() => {
    nav(to, { replace })
  }, [])

  return null
}

export { Navigator }
