import { type ReactNode } from 'react'
import { Link, useOutlet } from 'react-router-dom'

export default function Root() {
  const outlet = useOutlet()
  return <Layout>{outlet}</Layout>
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Link to='/'>go home</Link>
      <div>{children}</div>
    </>
  )
}
