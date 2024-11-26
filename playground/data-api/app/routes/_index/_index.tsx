import { useState } from 'react'
import { type LoaderFunction } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Button, Card, Modal } from 'antd'
import LoadMore from '../../components/load-more'

const x = 1

export const handle = {
  i18n: ['namespace'],
  fn: () => {
    console.log('this is fn', x)
  },
  crumb: () => <Link to='/sign'>To Sign</Link>,
  keepAlive: true,
}

export default function Page() {
  const [count, setCount] = useState(0)

  // const { getAliveRoutes } = useKeepAlive()

  console.log('index --- render')

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className={'h-screen'}>
      <Card title={'首页'}>
        <div className={'flex gap-2'}>
          <Button
            onClick={() => {
              setCount(count + 1)
            }}
          >
            +1 {count}
          </Button>
          <Link to='/signin'>
            <Button>跳转登录</Button>
          </Link>
          <Link to='/signup'>
            <Button>跳转注册</Button>
          </Link>
          <Button onClick={() => setModalOpen(true)}>打开modal</Button>
          <Button
            onClick={() => {
              // console.log(getAliveRoutes())
            }}
          >
            输出已缓存路由
          </Button>
        </div>
      </Card>
      <LoadMore />
      <Modal
        open={modalOpen}
        title={'首页'}
        onCancel={() => {
          setModalOpen(false)
        }}
        footer={null}
      >
        <Link to='/signin'>
          <Button>跳转登录</Button>
        </Link>
        <Link to='/signup'>
          <Button>跳转注册</Button>
        </Link>
      </Modal>
    </div>
  )
}

export const loader: LoaderFunction = () => {
  return null
}
