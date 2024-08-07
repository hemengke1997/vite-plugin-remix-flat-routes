import { useEffect } from 'react'
import { Link, type LoaderFunction, useMatches } from 'react-router-dom'
import { GlobalContext } from '../../contexts/global-context'
import { useBearStore } from '../../store'

export const handle = {
  test: '测试一下handle',
}

export function Component() {
  const { value } = GlobalContext.usePicker(['value'])
  const matches = useMatches()
  useEffect(() => {
    console.log(matches, 'matches')
  }, [])
  return (
    <div>
      /index/index.jsx {value}
      <Link to='/signin'>跳转signin</Link>
    </div>
  )
}

export const loader: LoaderFunction = (args) => {
  console.log(useBearStore.getState().bears, 'bears')
  console.log('this is loader', args)
  return null
}
