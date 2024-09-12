import { useEffect } from 'react'
import { Link, useMatches } from 'react-router-dom'
import { GlobalContext } from '../../contexts/global-context'

export function Component() {
  const { value } = GlobalContext.usePicker(['value'])
  const matches = useMatches()
  useEffect(() => {
    console.log(matches, 'matches')
  }, [])
  return (
    <div>
      /index/index.jsx {value}
      <Link to='/signin'>跳转signin</Link>
    </div>
  )
}
