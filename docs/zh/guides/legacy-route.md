# 传统路由

即使你使用的是 react-router-dom<=6.3.0，你也可以享受到`vite-plugin-remix-flat-routes` 提供的文件系统路由

按照以下步骤即可：

## 第 1 步: 开启传统路由模式

**如果 react-rouer-dom 版本小于等于 6.3.0，你可以跳过此步骤**

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

export default defineConfig({
  plugins: [
    remixFlatRoutes({
      legacy: true,
    }),
  ],
})
```

## 第 2 步: 像之前一样定义路由

```tsx
export default function Hello() {
  return (
    <div>
      <h1>Hello World!</h1>
      <p>This is legacy routing</p>
    </div>
  )
}
```

## 第 3 步: 创建路由

你需要使用 `LegacyRouterProvider` 组件来渲染路由

```tsx
import { BrowserRouter } from 'react-router-dom'
import { routes } from 'virtual:remix-flat-routes'
import { LegacyRouterProvider } from 'vite-plugin-remix-flat-routes/client'


export default function App() {
  return (
      <BrowserRouter>
        <LegacyRouterProvider
            routes={routes}
            onRouteMount={(_payload) => {
              // console.log(payload, 'onRouteMount')
            }}
            onRouteUnmount={(_payload) => {
              // console.log(payload, 'onRouteUnmount')
            }}
            onRouteWillMount={(_payload) => {
              // console.log(payload, 'onRouteWillMount')
            }}
          />
      </BrowserRouter>
    )
}
```

## 第 4 步: 使用 `handle`

此插件实现了类似 react router 6.4.0 的 `handle`。你可以像下面这样使用：

```tsx
import { useEffect } from 'react'
import { type PropsWithMatchRoute, useMatchRoutes } from 'vite-plugin-remix-flat-routes/client'

export const handle = {
  i18n: ['home']
}

export default function Home(props: PropsWithMatchRoute) {
  const matchRoutes = useMatchRoutes<
    () => Promise<{
      i18n: string[]
    }>
  >()

  useEffect(() => {
    console.log(props, 'props')
    console.log(matchRoutes, 'matchRoutes')
  }, [props, matchRoutes])
}
```

就是这样！现在你可以使用传统路由，但是仍然可以享受到 `vite-plugin-remix-flat-routes` 提供的所有功能。

你可以查看[参考文档](/zh/reference/client-api)以了解更多关于传统路由的信息。
