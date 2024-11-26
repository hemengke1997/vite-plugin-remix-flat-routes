import { useLocation, useMatches, useOutlet } from 'react-router-dom'
import { useAsyncLayoutEffect } from '../hooks/use-async-layout-effect'
import { isFunction } from '../utils'
import { KeepAliveContext } from './contexts/keep-alive'
import OffScreen from './off-screen'
import { OnScreen } from './on-screen'

function KeepAliveIn() {
  const { aliveRoutes, setAliveRoutes } = KeepAliveContext.usePicker(['aliveRoutes', 'setAliveRoutes'])
  const outLet = useOutlet()
  const { pathname } = useLocation()
  const matches = useMatches()

  useAsyncLayoutEffect(async () => {
    let shouldKeepAlive = false
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      const handle = match.handle
      if (!handle) continue

      let resolvedHandle: { keepAlive: boolean } | undefined = undefined
      if (isFunction(handle)) {
        resolvedHandle = await handle()
      } else {
        resolvedHandle = handle as { keepAlive: boolean }
      }
      if (resolvedHandle?.keepAlive) {
        shouldKeepAlive = true
        break
      }
    }

    const current = aliveRoutes.get(pathname)

    if (!current || shouldKeepAlive !== current.shouldKeepAlive) {
      setAliveRoutes(pathname, {
        component: outLet,
        shouldKeepAlive,
      })
    }
  }, [pathname])

  return (
    <>
      {Array.from(aliveRoutes).map(([key, route]) =>
        route.shouldKeepAlive ? (
          <OffScreen key={key} pathname={key} mode={pathname === key ? 'visible' : 'hidden'}>
            {route.component}
          </OffScreen>
        ) : (
          <OnScreen key={key} mounted={pathname === key}>
            {route.component}
          </OnScreen>
        ),
      )}
    </>
  )
}

export default KeepAliveIn
