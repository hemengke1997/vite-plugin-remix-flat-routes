import { useEffect } from 'react'
import { useMatches } from 'react-router-dom'

export default function Page() {
  const matches = useMatches()
  useEffect(() => {
    console.log(matches, 'matches 登录页')
    matches.forEach(async (item) => {
      if (typeof item.handle === 'function') {
        console.log(await item.handle())
      }
    })
  }, [matches])

  return <div>登录页</div>
}

export const handle = {
  xxxx: 'any value',
}
