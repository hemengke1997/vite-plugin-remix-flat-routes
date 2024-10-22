import { type PropsWithChildren } from 'react'
import { Link, ScrollRestoration, useLocation, useOutlet, useRouteError } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

function RouteAnimation({ children }: PropsWithChildren) {
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
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default function Root() {
  const outlet = useOutlet()
  return (
    <>
      <RouteAnimation>
        <div className={'flex gap-2 mb-4'}>
          <Link to='/'>go home</Link>
          <Link to='/other'>go other</Link>
          <Link to='/signin'>go signin</Link>
          <Link to='/signup'>go signup</Link>
        </div>
        {outlet}
      </RouteAnimation>
      <ScrollRestoration />
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.log(error)

  return <>Oops!</>
}
