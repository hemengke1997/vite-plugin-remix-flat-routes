import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'
import { GlobalContext } from './contexts/global-context'
import './css/index.css'

createRoot(document.querySelector('#root')!).render(
  <ConfigProvider
    theme={{
      cssVar: true,
      algorithm: [theme.darkAlgorithm],
    }}
  >
    <GlobalContext.Provider>
      <RouterProvider router={createBrowserRouter(routes)} />
    </GlobalContext.Provider>
  </ConfigProvider>,
)
