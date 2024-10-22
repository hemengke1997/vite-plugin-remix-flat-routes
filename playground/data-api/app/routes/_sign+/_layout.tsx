import { Outlet } from 'react-router-dom'

export default function Page() {
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
