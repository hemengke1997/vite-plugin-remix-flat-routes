# vite-plugin-remix-flat-routes

> 集成 [Remix](https://remix.run/docs/en/main/file-conventions/routes) & [remix-flat-routes](https://github.com/kiliman/remix-flat-routes) 约定式路由，支持 [react-router 数据路由/传统路由](https://reactrouter.com/en/main/routers/create-browser-router)

## 注意

为了支持 react-refresh hmr，请安装 `@vitejs/plugin-react >= 4.3.2` 或 `@vitejs/plugin-react-swc >= 3.6.0`

[中文文档](./README.zh.md)

[English Docs](./README.md)

## 安装

```bash
npm i vite-plugin-remix-flat-routes
```

## 使用

### 配置typescript类型提示

在 tsconfig.json 中引入

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-remix-flat-routes/virtual"]
  }
}
```

或者在文件中引入

```ts
/// <reference types="vite-plugin-remix-flat-routes/virtual" />
```

### 配置 vite 插件

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [remixFlatRoutes()],
})
```

#### 插件配置项

```ts
type Options = {
  appDirectory?: string // 默认为 'app'
  // remix-flat-routes 配置
  flatRoutesOptions?: {
    routeDir?: string | string[] // 默认为 'routes'
    ignoreRouteFiles?: string[] // 默认为 []
    basePath?: string // 默认为 '/'
    paramPrefixChar?: string // 默认为 '$'
    routeRegex?: RegExp
    visitFiles?: VisitFilesFunction
  }
  legacy?: boolean // 是否开启传统路由模式，默认自动探测
  handleAsync?: boolean // 是否将 handle 转为异步函数，默认为 false
}
```

### 按照[remix-flat-routes文档](https://github.com/kiliman/remix-flat-routes)组织路由

例如

```
app
├── main.tsx            // 入口文件，放在index.html中
├── root.tsx            // 根路由 (https://remix.run/docs/en/main/file-conventions/root)
└── routes              // 路由目录
    ├── $.tsx           // 404 页面
    ├── _index          // 首页
    │   └── _index.tsx
    └── _sign+
        ├── _layout.tsx
        ├── signin
        │   └── _index.tsx
        └── signup
            └── _index.ts
```

## 示例

- [约定式数据路由](./playground/data-api/)
- [约定式传统路由](./playground/legacy/)
- [配置式路由](./playground/config-route/)

## 约定

> 为了更好的支持 Remix 的路由规范，插件做了一些约定，具体如下

1. 路由文件默认导出(`export default`)为**懒加载**路由
2. 路由组件具名导出(`export function Component`)为**非懒加载**路由


## [数据路由模式（react-router-dom>=6.4.0）](https://reactrouter.com/en/main/routers/picking-a-router)

### 配置 react-router-dom

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'

// https://reactrouter.com/en/main/routers/create-browser-router
const router = createBrowserRouter(routes)

const root = createRoot(document.getElementById('root'))

// **使用数据路由**
// https://reactrouter.com/en/main/router-components/browser-router
root.render(<RouterProvider router={router} />)
```

### 从文件中导出路由组件和配置

```tsx
import { useEffect } from 'react'
import { type LoaderFunction, useMatches } from 'react-router-dom'

// https://reactrouter.com/en/main/route/route#handle
export const handle = {
  test: '这是handle',
}

export default function Page() {
  return <div>懒加载的路由</div>
}

// 也可以导出 lazy 函数懒加载组件
export const lazy = async () => ({
  Component: (await import('./_index.lazy')).default,
})

export function Component() {
  return <div>非懒加载的路由</div>
}

// https://reactrouter.com/en/main/route/route#loader
export const loader: LoaderFunction = (args) => {
  console.log('this is loader', args)
  return null
}

// 更多Data-API导出请参考 [react-router 文档](https://reactrouter.com/en/main/route/route)
```


## [传统路由模式（react-router-dom<=6.3.0）](https://reactrouter.com/en/v6.3.0/getting-started/overview)

> 传统路由模式仅支持 Handle 约定

### 配置 vite 插件

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    remixFlatRoutes({
      // 默认插件会自动探测 react-router-dom 版本，如果大于等于 6.4.0 则默认开启数据路由模式
      // 否则开启传统路由模式
      // 也可以手动开启传统路由模式
      legacy: true,
    }),
  ],
})
```

### 配置 react-router-dom

```tsx
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'
import { LegacyRouterProvider } from 'vite-plugin-remix-flat-routes/client' // 导入 LegacyRouterProvider

const root = createRoot(document.getElementById('root'))

// **使用传统路由**
root.render(
  <BrowserRouter>
    <LegacyRouterProvider routes={routes} />
  </BrowserRouter>,
)
```

### 从文件中导出路由组件

#### 默认导出（懒加载）

```tsx
export default function Page() {
  return <div>懒加载的路由</div>
}

export const handle = {
  test: 'this is handle',
}
```

#### 具名导出Component（非懒加载）

```tsx
export function Component() {
  return <div>非懒加载的路由</div>
}
```

### 获取 handle

有以下方式获取 handle

#### 1. 从 `props` 中获取 handle

```tsx
import { type PropsWithMatchRoute } from 'vite-plugin-remix-flat-routes/client'

export default function (props: PropsWithMatchRoute) {
  const { handle } = props
}
```

#### 2. 使用 `useMatchRoutes` 获取 handle 信息

```tsx
import { useMatchRoutes } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  const matchRoutes = useMatchRoutes()
}
```


## 注意事项

1. routes目录下被 `flatRoutesOptions.routeRegex` 匹配的文件都被识别为路由组件，如果你不希望某些文件被视为路由组件，可以通过 `flatRoutesOptions.ignoreRouteFiles` 进行配置

例如

```ts
remixFlatRoutes({
  flatRoutesOptions: {
    ignoreRouteFiles: ['**/components/**', '**/hooks/**'],
  },
})
```

则 `components` 和 `hooks` 目录下的所有文件不会被识别为路由组件


2. 如果不使用内置的 remix-flat-routes，可以通过传入 `routes` 设置路由约定，参考 [remix routes](https://remix.run/docs/en/main/file-conventions/vite-config#routes)

3. 如果导出的 `handle` 有副作用，请在插件配置项中传入 `handleAsync:true`。插件会将 `handle` 转为异步函数，解决副作用导致的序列化问题

## 灵感来源

- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
- [vite-plugin-remix-routes](https://github.com/vjee/vite-plugin-remix-routes)
- [remix-flat-routes](https://github.com/kiliman/remix-flat-routes)
