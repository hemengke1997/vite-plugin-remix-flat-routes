import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Space } from 'antd'
import { type PropsWithMatchRoute, useMatchRoutes } from 'vite-plugin-remix-flat-routes/client'

// 懒加载路由组件
export default function (props: PropsWithMatchRoute) {
  const matchRoutes = useMatchRoutes<
    () => Promise<{
      fn: () => void
    }>
  >()
  useEffect(() => {
    console.log(props, 'props')
    console.log(matchRoutes, 'useMatchRoutes result')
  }, [matchRoutes])
  return (
    <Card title={'index'}>
      <Space>
        <Link to='/signin'>跳转signin</Link>
        <Link to={'/signup'}>跳转signup</Link>
        <Button
          onClick={async () => {
            matchRoutes.forEach(async (item) => {
              if (typeof item.handle === 'function') {
                ;(await item.handle())?.fn()
              }
            })
          }}
        >
          执行fn
        </Button>
      </Space>
    </Card>
  )
}

const x = 1
export const handle = {
  any: '这是首页',
  fn: () => {
    console.log(x, '执行fn')
  },
}
