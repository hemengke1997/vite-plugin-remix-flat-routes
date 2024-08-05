# vite-plugin-remix-flat-routes

> 集成 [Remix@2](<(https://remix.run/docs/en/main/file-conventions/routes)>) & [remix-flat-routes](https://github.com/kiliman/remix-flat-routes) 路由生成规则的 Vite 插件，支持 [react-router 数据路由](https://reactrouter.com/en/main/routers/create-browser-router)

## 前提

- react-router-dom 版本 >= 6.4.0，此版本新增了数据路由功能

## 安装

```bash
npm i vite-plugin-remix-flat-routes react-router-dom -D
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

### 配置 react-router-dom

```tsx
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
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
