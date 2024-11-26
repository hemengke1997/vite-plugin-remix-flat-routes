import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'
import './css/index.css'

console.log(routes, 'routes')

createRoot(document.querySelector('#root')!).render(
  <ConfigProvider
    theme={{
      cssVar: true,
      algorithm: [theme.darkAlgorithm],
    }}
  >
    <RouterProvider router={createBrowserRouter(routes)} />
  </ConfigProvider>,
)
