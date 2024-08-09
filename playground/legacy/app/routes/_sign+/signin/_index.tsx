import { useEffect } from 'react'
import { type PropsWithMeta, useMetas } from 'vite-plugin-remix-flat-routes/client'

// 非懒加载路由组件
export function Component(props: PropsWithMeta) {
  const { metas } = useMetas()
  useEffect(() => {
    console.log(metas, 'signin meta')
    console.log(props.meta, 'signin props meta')
  }, [])
  return <div>/signin/index.jsx</div>
}
