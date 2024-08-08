import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { type PropsWithMeta, useMetas } from 'vite-plugin-remix-flat-routes/client'
import { GlobalContext } from '../../contexts/global-context'

// 懒加载路由组件
export default function (props: PropsWithMeta) {
  const { value } = GlobalContext.usePicker(['value'])
  const { metas } = useMetas()
  useEffect(() => {
    console.log(props, 'props')
    console.log(metas, 'useMetas result')
  }, [metas])
  return (
    <div>
      /index/index.jsx {value}
      <Link to='/signin'>跳转signin</Link>
    </div>
  )
}
