# vite-plugin-remix-flat-routes

> 集成 [Remix@2](https://remix.run/docs/en/main/file-conventions/routes) & [remix-flat-routes](https://github.com/kiliman/remix-flat-routes) 路由生成规则的 Vite 插件，支持 [react-router 数据路由/传统路由](https://reactrouter.com/en/main/routers/create-browser-router)

## 前提

- 如果你使用react-router数据路由，请安装 react-router-dom 版本 >= 6.4.0
- 如果你使用react-router传统路由，请安装 react-router-dom 版本 >= 6.0.0 & < 6.4.0

## 安装

```bash
npm i vite-plugin-remix-flat-routes -D
```

## 使用

### 配置typescript类型提示

在 tsconfig.json 中引入

```json
{
  "compilerOptions": {
    // ....
    "types": ["vite-plugin-remix-flat-routes/virtual"]
  }
  // ...
}
```

或者在文件中引入

```ts
/// <reference types="vite-plugin-remix-flat-routes/virtual" />
```

### 配置 vite 插件

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), remixFlatRoutes()],
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
    basePath?: string // 默认为 '/''
    paramPrefixChar?: string // 默认为 '$''
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

## [数据路由模式（react-router-dom>=6.4.0）](https://reactrouter.com/en/main/routers/picking-a-router)

### 配置 react-router-dom

```tsx
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
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

// 如果是具名导出 `Component`，则懒加载组件
// https://reactrouter.com/en/main/route/route#lazy
export function Component() {
  const matches = useMatches()
  useEffect(() => {
    console.log(matches, 'matches')
  })
  return <div>懒加载的组件</div>
}

// 如果是默认导出组件，则不会懒加载
// https://reactrouter.com/en/main/route/route#elementcomponent
// export default function() {
//   return <div>非懒加载的组件</div>
// }

// loader 函数，一般用于数据预取
// https://reactrouter.com/en/main/route/route#loader
export const loader: LoaderFunction = (args) => {
  console.log('this is loader', args)
  return null
}

// 更多导出请参考 [react-router 文档](https://reactrouter.com/en/main/route/route)
```

## [传统路由模式（react-router-dom<6.4.0）](https://reactrouter.com/en/v6.3.0/getting-started/overview)

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
      // 开启传统路由模式
      // 默认插件会自动探测 react-router-dom 版本，如果大于等于 6.4.0 则默认开启数据路由模式
      // 否则开启传统路由模式
      legacy: true,
    }),
  ],
})
```

### 配置 react-router-dom

```tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { routes } from 'virtual:remix-flat-routes'
import { LegacyRouterProvider } from 'vite-plugin-remix-flat-routes/client'

const root = createRoot(document.getElementById('root'))

// **使用传统路由**
root.render(
  <BrowserRouter>
    <LegacyRouterProvider routes={routes} />
  </BrowserRouter>,
)
```

### 从文件中导出路由组件

> 请注意，传统路由模式下，懒加载是默认导出，非懒加载是具名导出 `Component`，与数据路由模式相反

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

### meta 原数据

在与路由组件同级目录下创建 `meta.ts` 文件，导出任意对象，即可在路由组件中通过 `useMetas` 获取到

```tsx
// meta.ts

export const up_to_you = 'what ever you want'
export const more_info = {
  title: 'title',
  description: 'description',
}
```

### 获取 meta 数据路由

```tsx
import { useMetas } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  const { metas } = useMetas()
}
```

### 注意事项

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
