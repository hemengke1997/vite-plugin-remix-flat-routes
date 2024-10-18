import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const nav = useNavigate()
  useEffect(() => {
    nav('/', { replace: true })
  }, [])

  return null
}

export const handle = {
  404: true,
}
