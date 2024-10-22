import { useEffect } from 'react'
import { Button, Card } from 'antd'
import { useMatchRoutes } from 'vite-plugin-remix-flat-routes/client'

export default function Page() {
  const matchRoutes = useMatchRoutes<{
    fn: () => void
  }>()
  useEffect(() => {
    console.log(matchRoutes, 'matchRoutes')
  }, [matchRoutes])
  return (
    <Card title='page a'>
      <div>
        <Button
          onClick={() => {
            matchRoutes[0]?.handle?.fn()
          }}
        >
          执行fn
        </Button>
      </div>
    </Card>
  )
}
