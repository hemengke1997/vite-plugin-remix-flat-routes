import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'
import './css/index.css'

createRoot(document.querySelector('#root')!).render(
  <ConfigProvider
    theme={{
      cssVar: true,
      algorithm: [theme.darkAlgorithm],
    }}
  >
    <RouterProvider
      router={createBrowserRouter(routes, {
        dataStrategy: async ({ matches }) => {
          const matchesToLoad = matches.filter((m) => m.shouldLoad)
          const results = await Promise.all(matchesToLoad.map((m) => m.resolve()))

          return results.reduce((acc, result, i) => Object.assign(acc, { [matchesToLoad[i].route.id]: result }), {})
        },
      })}
    />
  </ConfigProvider>,
)
