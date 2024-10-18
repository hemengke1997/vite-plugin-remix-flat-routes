import { Button, Card } from 'antd'
import { useMatchRoutes } from 'vite-plugin-remix-flat-routes/client'

export default function () {
  const matchRoutes = useMatchRoutes<
    () => Promise<{
      fn: () => void
    }>
  >()
  return (
    <Card title={'signup'}>
      <Button
        onClick={async () => {
          matchRoutes.forEach(async (item) => {
            if (item.handle) {
              ;(await item.handle())?.fn()
            }
          })
        }}
      >
        执行fn
      </Button>
    </Card>
  )
}

const x = 2
export const handle = {
  any: '这是注册页',
  fn: () => {
    console.log('执行fn', x)
  },
}
