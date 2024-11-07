# 快速上手

本指南将引导你完成在 Vite 项目中设置 `vite-plugin-remix-routes` 插件的过程。你可以[从一个新项目开始](https://vitejs.dev/guide/#scaffolding-your-first-vite-project)，或者将插件添加到现有项目中。

## 第 1 步：安装

首先，安装 `vite-plugin-remix-routes` 和 `react-router-dom` 包：

```bash
npm install --save-dev vite-plugin-remix-routes react-router-dom
```

然后，将插件添加到您的 `vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [remixFlatRoutes(
    // plugin 配置项
  )],
})
```

## 第 2 步：定义你的第一个路由

在 `app/routes` 目录中创建一个 `hello.tsx` 文件，并添加以下内容。该目录包含所有应用程序路由，你可以在[插件的配置选项](/zh/reference/plugin-api)中设置路由目录

```bash
mkdir app/routes && touch app/routes/hello.tsx
```

### 选择路由加载策略

为了保持应用程序包的小巧并支持路由的代码拆分，你可以定义懒加载路由。路由文件 `default export` 是一个懒加载的路由

```tsx
// app/routes/hello.tsx
export default function Hello() {
  return (
    <div>
      <h1>Hello World!</h1>
      <p>Powered by Vite, React, and vite-plugin-remix-flat-routes</p>
    </div>
  )
}
```

如果你想定义一个非懒加载的路由，你可以使用命名的 `Component` 导出：

```tsx
// app/routes/hello.tsx
export function Component() {
  // return ...
}
```

## 第 3 步：创建路由

使用 react-router-dom Router组件创建路由

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'

createRoot(document.querySelector('#root')!).render(
  <RouterProvider router={createBrowserRouter(routes)} />,
)
```

`virtual:remix-flat-routes` 导出是由 `vite-plugin-remix-routes` 生成的，包含了在 `app/routes` 中定义的所有路由

要在 `react-router^6.4.0` 中使用数据 API，您应该使用 `createBrowserRouter` 来创建路由实例。请查看 [React Router 文档中的选择路由器指南](https://reactrouter.com/en/main/routers/picking-a-router) 以了解更多信息。

如果您使用 TypeScript，请在 `tsconfig.json` 中添加以下内容：

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-remix-flat-routes/virtual"]
  }
}
```

## 第 4 步：添加 React-fast-refresh 支持

安装 `@vitejs/plugin-react>=4.3.2` 或 `@vitejs/plugin-react-swc >= 3.6.0`

然后将插件添加到您的 `vite.config.ts`：

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

export default defineConfig({
  plugins: [
    react(),
    remixFlatRoutes()
  ],
})
```

## 接下来

到现在为止，您应该已经能够安装 `vite-plugin-remix-routes` 插件并创建一个新路由了。接下来，我们将学习如何[定义应用程序路由](/zh/guides/defining-routes)。

您还可以查看[配置参考](/zh/reference/plugin-api)自定义插件的行为
