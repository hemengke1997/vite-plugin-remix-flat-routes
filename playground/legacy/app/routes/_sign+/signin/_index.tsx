import { useEffect } from 'react'
import { type PropsWithMeta } from 'vite-plugin-remix-flat-routes/client'

// 非懒加载路由组件
export function Component(props: PropsWithMeta) {
  useEffect(() => {
    console.log(props, 'signin')
  }, [])
  return <div>/signin/index.jsx</div>
}

// export default function () {
//   return <div>/signin/index.jsx</div>
// }
