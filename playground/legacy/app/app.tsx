import { AnimatePresence, motion } from 'framer-motion'
import { type PropsWithChildren } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { routes } from 'virtual:remix-flat-routes'
import { LegacyRouterProvider } from 'vite-plugin-remix-flat-routes/client'
import { GlobalContext } from './contexts/global-context'

export const RouteAnimation = ({ children }: PropsWithChildren) => {
  const location = useLocation()

  return (
    <AnimatePresence mode={'wait'} initial={false}>
      <motion.div
        key={location.pathname}
        initial={{
          translateX: 10,
          opacity: 0,
        }}
        animate={{ translateX: 0, opacity: 1 }}
        exit={{ translateX: -10, opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

console.log(routes, 'routes')

export default function App() {
  return (
    <BrowserRouter>
      <GlobalContext.Provider>
        <LegacyRouterProvider
          routes={routes}
          onRouteMount={(_payload) => {
            // console.log(payload, 'onRouteMount')
          }}
          onRouteUnmount={(_payload) => {
            // console.log(payload, 'onRouteUnmount')
          }}
          onRouteWillMount={(_payload) => {
            // console.log(payload, 'onRouteWillMount')
          }}
          render={(children) => <RouteAnimation>{children}</RouteAnimation>}
        />
      </GlobalContext.Provider>
    </BrowserRouter>
  )
}
