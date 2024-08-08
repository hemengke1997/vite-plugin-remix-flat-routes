import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from 'virtual:remix-flat-routes'
import { GlobalContext } from './contexts/global-context'

console.log(routes, 'routes')

const router = createBrowserRouter(routes)

console.log(router.state, 'state')

export default function App() {
  return (
    <GlobalContext.Provider>
      <RouterProvider router={router} />
    </GlobalContext.Provider>
  )
}
