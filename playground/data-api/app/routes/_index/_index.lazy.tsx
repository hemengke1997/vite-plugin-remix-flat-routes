import { useEffect } from 'react'
import { Link, useMatches } from 'react-router-dom'

export default function () {
  const matches = useMatches()
  useEffect(() => {
    console.log(matches, 'matches')
  }, [])
  return (
    <div>
      /index/index.jsx
      <Link to='/signin'>跳转signin</Link>
    </div>
  )
}
