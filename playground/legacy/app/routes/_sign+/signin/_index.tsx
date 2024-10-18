import { useEffect } from 'react'
import { type PropsWithMatchRoute, useMatchRoutes } from 'vite-plugin-remix-flat-routes/client'

// 非懒加载路由组件
export function Component(props: PropsWithMatchRoute) {
  const matchRoutes = useMatchRoutes()
  useEffect(() => {
    console.log(matchRoutes, 'signin matchRoutes')
    console.log(props, 'signin props')
  }, [])
  return <div>/signin/index.jsx</div>
}
