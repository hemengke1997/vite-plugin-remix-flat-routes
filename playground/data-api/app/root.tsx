import { toast } from 'react-atom-toast'
import { Link, useRouteError } from 'react-router-dom'
import { useUpdate } from 'ahooks'
import { Button } from 'antd'
import { KeepAlive, KeepAliveProvider } from 'vite-plugin-remix-flat-routes/client'
import { GlobalContext } from './contexts/global-context'

toast.setDefaultOptions({
  className: 'bg-slate-400',
})

export const handle = {
  layout: 'app',
}

export function Component() {
  const update = useUpdate()
  console.log('root render')
  return (
    <>
      <div className={'mb-4 flex items-center gap-2'}>
        <Link to='/'>go home</Link>
        <Link to='/other'>go other</Link>
        <Link to='/signin'>go signin</Link>
        <Link to='/signup'>go signup</Link>
        <Button onClick={() => update()}>render</Button>
      </div>
      <>
        <KeepAliveProvider>
          <GlobalContext.Provider>
            <KeepAlive transition={true} scrollRestoration={false} />
          </GlobalContext.Provider>
        </KeepAliveProvider>
      </>
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.log(error)

  return <>Oops!</>
}
