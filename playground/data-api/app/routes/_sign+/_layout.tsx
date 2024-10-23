import { useEffect } from 'react'
import { toast } from 'react-atom-toast'
import { Outlet } from 'react-router-dom'

export default function Page() {
  useEffect(() => {
    toast.open({ content: 'this is a toast' })
  }, [])
  return (
    <div>
      <div>Sign Layout</div>
      <Outlet />
    </div>
  )
}

export const handle = {
  layout: 'layout handle',
}
