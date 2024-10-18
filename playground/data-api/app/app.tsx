import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { routes } from 'virtual:remix-flat-routes'
import { GlobalContext } from './contexts/global-context'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <ConfigProvider
      theme={{
        cssVar: true,
        algorithm: [theme.darkAlgorithm],
      }}
    >
      <GlobalContext.Provider>
        <RouterProvider router={router} />
      </GlobalContext.Provider>
    </ConfigProvider>
  )
}
