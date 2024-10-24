import { useEffect } from 'react'
import { type LoaderFunction } from 'react-router-dom'
import { Link, useMatches } from 'react-router-dom'
import { Button, Card } from 'antd'
import { manifest } from 'virtual:public-typescript-manifest'
import { useBearStore } from '../../store'

const x = 1

export const handle = {
  i18n: ['namespace'],
  fn: () => {
    console.log('this is fn', x)
  },
  crumb: () => <Link to='/sign'>To Sign</Link>,
}

export default function Page() {
  const matches = useMatches()

  console.log(manifest)

  useEffect(() => {
    console.log(matches, 'matches')
  }, [])

  return (
    <Card title={'首页'}>
      <div className={'flex gap-2'}>
        <Button
          onClick={async () => {
            matches.forEach(async (item) => {
              if (typeof item.handle === 'function') {
                ;(await item.handle())?.fn()
              }
            })
          }}
        >
          执行handle.fn
        </Button>
        <Button>
          <Link to='/signin'>跳转signin</Link>
        </Button>
      </div>
    </Card>
  )
}

export const loader: LoaderFunction = (args) => {
  console.log(useBearStore.getState().bears, 'bears')
  console.log('this is loader', args)
  return null
}
