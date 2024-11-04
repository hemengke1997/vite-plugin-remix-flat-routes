# 配置式路由

得益于 `Legacy` 传统路由，此插件也支持了静态的配置式路由。

::: tip
虽然支持了配置式路由，但是强烈推荐使用文件系统路由
:::

按照以下步骤配置路由

## 第 1 步: 定义路由


```tsx
import { type Route } from 'vite-plugin-remix-flat-routes/client'

export const routes: Route<{
  i18n: string[]
  fn?: () => void
}>[] = [
  {
    path: '/',
    lazyComponent: () => import('./pages/home'),
    handle: {
      i18n: ['home'],
    },
  },
  {
    path: '/page-a',
    lazyComponent: () => import('./pages/page-a'),
    handle: {
      i18n: ['page-a'],
      fn: () => {
        console.log('page a')
      },
    },
  },
  {
    path: '/page-c',
    redirect: '/page-b',
  },
  {
    path: '/page-b',
    lazyComponent: () => import('./pages/page-b'),
    handle: {
      i18n: ['page-b'],
    },
  },
  {
    path: '/nest',
    children: [
      {
        path: 'a',
        lazyComponent: () => import('./pages/nest/a'),
      },
    ],
  },
  {
    path: '*',
    element: <div>404</div>,
  },
]
```

## 第 2 步: 创建路由

你需要使用 `LegacyRouterProvider` 组件来渲染路由

```tsx
import { BrowserRouter } from 'react-router-dom'
import { LegacyRouterProvider } from 'vite-plugin-remix-flat-routes/client'
import { routes } from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <LegacyRouterProvider
        routes={routes}
      ></LegacyRouterProvider>
    </BrowserRouter>
  )
}
```

就这么简单！你已经成功配置了静态路由

你不需要在 `vite.config.ts` 中引入插件了

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes' // [!code --]

export default defineConfig({
  plugins: [
    remixFlatRoutes(), // [!code --]
  ],
})
```
