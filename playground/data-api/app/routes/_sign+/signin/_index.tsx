import { useEffect } from 'react'
import { useMatches } from 'react-router-dom'

export default function () {
  const matches = useMatches()
  useEffect(() => {
    console.log(matches, 'matches 登录页')
  }, [matches])
  return <div>登录页</div>
}

export const handle = {
  xxxx: 'any value',
}
