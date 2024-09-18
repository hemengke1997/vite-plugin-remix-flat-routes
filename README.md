# vite-plugin-remix-flat-routes

> 集成 [Remix](https://remix.run/docs/en/main/file-conventions/routes) & [remix-flat-routes](https://github.com/kiliman/remix-flat-routes) 约定式路由，支持 [react-router 数据路由/传统路由](https://reactrouter.com/en/main/routers/create-browser-router)

## 前提

- 如果你使用react-router数据路由，请安装 react-router-dom 版本 >= 6.4.0
- 如果你使用react-router传统路由，请安装 react-router-dom 版本 >= 6.0.0 & <= 6.3.0

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

## 约定

> 为了更好的支持 Remix 的路由规范，插件做了一些约定，具体如下

1. 路由文件默认导出(`export default`)为**懒加载**组件
2. 路由组件具名导出(`export function Component`)为**非懒加载**组件

### Meta 约定

如果路由文件同级存在 meta.ts(x) 文件，则会被识别为路由元数据，此时文件约定规范如下：

1. meta 文件中，导出的字段为 [`react-router` Route](https://reactrouter.com/en/main/route/route) 组件支持的 Data-API，如 `handle` / `loader` 等

### React-Router 约定

如果路由文件同级不存在 meta.ts(x) 文件，则遵循 [react-router Route](https://reactrouter.com/en/main/route/route) 规范

1. 所有 react-router 支持的 Data-API，都可以从路由文件中导出，如 `handle` / `loader` 等

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

### Meta 约定

#### 从路由文件中导出路由组件
```tsx
// 路由文件
export default function () {
  return <div>懒加载的组件</div>
}
```

#### 从 meta 文件中导出 Data-API
```tsx
// meta 文件
import { type LoaderFunction } from 'react-router-dom'

export const handle = {
  title: 'title',
  description: 'description',
}

export const loader: LoaderFunction = (args) => {
  console.log('this is loader', args)
  return null
}
```

### React-router 约定

#### 从文件中导出路由组件和配置

```tsx
import { useEffect } from 'react'
import { type LoaderFunction, useMatches } from 'react-router-dom'

// https://reactrouter.com/en/main/route/route#handle
export const handle = {
  test: '这是handle',
}

export default function () {
  return <div>懒加载的组件</div>
}

export function Component() {
  return <div>非懒加载的组件</div>
}

// 也可以导出 lazy 函数懒加载组件
export const lazy = async () => ({
  Component: (await import('./_index.lazy')).default,
})

// loader 函数，一般用于数据预取
// https://reactrouter.com/en/main/route/route#loader
export const loader: LoaderFunction = (args) => {
  console.log('this is loader', args)
  return null
}

// 更多导出请参考 [react-router 文档](https://reactrouter.com/en/main/route/route)
```


## [传统路由模式（react-router-dom<=6.3.0）](https://reactrouter.com/en/v6.3.0/getting-started/overview)

> 传统路由模式仅支持 Meta 约定

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

> 请注意，传统路由仅支持 Meta 约定

#### 默认导出（懒加载）

```tsx
export default function () {
  return <div>懒加载的组件</div>
}
```

#### 具名导出Component（非懒加载）

```tsx
export function Component() {
  return <div>非懒加载的组件</div>
}
```

### meta 元数据

在与路由组件同级目录下创建 `meta.ts(x)` 文件，导出任意值，即可在路由组件获取到 `meta` 数据

> 注意：meta 中内置了 `route` 字段，请勿使用 `route` 命名

```tsx
// meta.ts

export const up_to_you = 'whatever you want'
export const more_info = {
  title: 'title',
  description: 'description',
}
```

### 获取 meta 数据

有以下方式获取 meta 数据

#### 1. 从 `props` 中获取 meta 元信息

```tsx
import { type PropsWithMeta } from 'vite-plugin-remix-flat-routes/client'

export default function (props: PropsWithMeta) {
  const { meta } = props
}
```

#### 2. 使用 `useMetas` 获取 meta 元信息

```tsx
import { useMetas } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  const { metas } = useMetas()
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

## Inspiration

- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
- [vite-plugin-remix-routes](https://github.com/vjee/vite-plugin-remix-routes)
- [remix-flat-routes](https://github.com/kiliman/remix-flat-routes)
