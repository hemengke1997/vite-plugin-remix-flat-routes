import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Space } from 'antd'

export default function Page() {
  const [count, setCount] = useState(0)

  console.log('signup --- render')

  useEffect(() => {
    console.log('signup --- effect')
    return () => {
      console.log('signup --- cleanup')
    }
  }, [])

  return (
    <div className={'mt-32 flex min-h-screen items-center'}>
      <Card title={'注册页'}>
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
          <Link to='/signin'>
            <Button>跳转登录</Button>
          </Link>
        </Space>
      </Card>
    </div>
  )
}
