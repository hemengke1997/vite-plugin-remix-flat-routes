import { useMatches } from 'react-router-dom'

export default function () {
  const matches = useMatches()
  console.log(matches, 'matches')

  return <div>登录页</div>
}
