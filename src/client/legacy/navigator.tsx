import { memo, useEffect, useRef } from 'react'
import { type NavigateOptions, useNavigate } from 'react-router-dom'
import { useMemoFn } from 'context-state'

function Navigator(props: { to: string } & NavigateOptions) {
  const { to, ...rest } = props
  const naved = useRef(false)
  const nav = useNavigate()

  const navOnce = useMemoFn(() => {
    if (naved.current) return
    naved.current = true
    nav(to, rest)
  })

  useEffect(() => {
    navOnce()
  })

  return null
}

export default memo(Navigator)
