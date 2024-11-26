import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Space } from 'antd'
import { useActiveChanged } from 'vite-plugin-remix-flat-routes/client'

export default function Page() {
  const [count, setCount] = useState(0)

  console.log('signin --- render')

  useActiveChanged((active) => {
    console.log('signin --- active changed', active)
    if (active) {
      setCount((count) => count + 1)
    } else {
      setCount((count) => count - 1)
    }
  })

  return (
    <div className={'mt-36 min-h-screen'}>
      <Card title={'登录页'}>
        <Space>
          <Button
            onClick={() => {
              setCount(count + 1)
            }}
          >
            点击count+ {count}
          </Button>
          <Link to='/'>
            <Button>跳转首页</Button>
          </Link>
          <Link to='/signup'>
            <Button>跳转注册</Button>
          </Link>
        </Space>
      </Card>
    </div>
  )
}

export const handle = {
  keepAlive: true,
}
