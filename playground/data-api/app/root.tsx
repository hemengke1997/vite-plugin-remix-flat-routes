import { toast } from 'react-atom-toast'
import { Link, ScrollRestoration, useRouteError } from 'react-router-dom'
import { getScrollRestoration, KeepAlive } from 'vite-plugin-remix-flat-routes/client'

toast.setDefaultOptions({
  className: 'bg-slate-400',
})

export const handle = {
  layout: 'app',
}

export function Component() {
  return (
    <>
      <div className={'mb-4 flex gap-2'}>
        <Link to='/'>go home</Link>
        <Link to='/other'>go other</Link>
        <Link to='/signin'>go signin</Link>
        <Link to='/signup'>go signup</Link>
      </div>
      <>
        <KeepAlive transition={true} />
      </>
      <ScrollRestoration getKey={getScrollRestoration} />
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.log(error)

  return <>Oops!</>
}
