import { Link } from 'react-router-dom'
import { type PropsWithMeta } from 'vite-plugin-remix-flat-routes/client'

export default function (props: PropsWithMeta) {
  console.log(props, 'props')
  return (
    <div>
      <div>home</div>
      <Link to={'/page-a'}>to page a</Link>
      <Link to={'/page-b'}>to page b</Link>
      <Link to={'/page-c'}>to page c</Link>
    </div>
  )
}