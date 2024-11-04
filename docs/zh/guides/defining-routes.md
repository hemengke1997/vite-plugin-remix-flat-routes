# 定义路由

上一章节中，我们已经安装了插件并定义了我们的第一个路由，让我们看看如何在应用程序中定义不同类型的路由。如果你熟悉 [Remix-flat-routes 约定](https://github.com/kiliman/remix-flat-routes)，可以跳过此页面并进入下一章节。

由于 `vite-plugin-remix-routes` 是基于 `react-router` 构建的，你需要熟悉 `react-router` 的基本概念才能完全理解如何使用此插件。你可以在他们的[官方文档](https://reactrouter.com/en/main/start/concepts)中找到更多关于 `react-router` 的信息。

## 基础路由

正如我们在[定义你的第一个路由](/zh/guides/getting-started.html#step-2-define-your-first-route)中看到的那样，要定义一个基本路由，我们只需在 `routes` 目录中创建一个文件。文件名将用作路由路径。每个路由文件都应该导出一个 React 组件，当路由匹配时将渲染该组件。

让我们创建一个名为 `about` 的新路由：

```bash
$ touch app/routes/about.tsx
```

现在让我们定义路由组件：

```tsx
// app/routes/about.tsx

export default function About() {
  return <h1>About</h1>
}
```

现在，如果我们在浏览器中访问 `/about`，我们应该看到 `About` 组件。

## 嵌套路由

要定义嵌套路由，我们可以在 `routes` 目录中创建一个带有路由名称的目录。让我们为 `/users/profile` 创建一个新路由：

```tsx
// app/routes/users+/profile.tsx

export default function Profile() {
  return <h1>Profile</h1>
}
```

现在，如果我们在浏览器中导航到 `/users/profile`，我们将看到 `Profile` 页面。

## 动态路由

要创建动态路由，我们需要在 `routes` 目录中创建一个以 `$` 开头的文件名。假设我们需要一个匹配 `/users/:id` 的路由，我们可以在 `routes/users` 目录中创建一个名为 `$id.tsx` 的文件：

```tsx
// app/routes/users+/$id.tsx
import { useParams } from 'react-router-dom'

export function Component() {
  const { id } = useParams()

  return <h1>User ID: {id}</h1>
}
```

现在，如果我们在浏览器中导航到 `/users/1`，我们将看到 `User ID: 1` 页面。

## 索引路由

索引路由是一个特殊的路由，它是一个目录的默认路由。例如，`/users` 路由是 `routes/users/index.tsx` 的默认路由。你可以在 `routes` 目录中创建一个名为 `index.tsx` 的文件来定义索引路由。

```tsx
// app/routes/users+/index.tsx

export default function Users() {
  return <h1>Users</h1>
}
```

现在，如果我们在浏览器中导航到 `/users`，我们将看到 `Users` 页面。

## 路由Layout

`routes` 目录中的每个子目录都可以有一个Layout。要为一个目录定义Layout，我们可以在该目录中创建一个 `_layout` 文件。例如，要为 `routes/users+` 目录定义Layout，我们在 `users+` 目录中创建一个名为 `_layout` 的文件：

```tsx
// app/routes/users+/_layout.tsx
import { Outlet } from 'react-router-dom'

export function Component() {
  return (
    <div>
      <h1>Users Layout</h1>
      <Outlet />
    </div>
  )
}
```

请记住，Layout组件中需要使用 `Outlet` 或者 `useOuelet` 组件来渲染子路由。

## 懒加载路由

为了保持应用程序包的小巧并支持路由的代码拆分，你可以定义懒加载路由。路由文件的 `default export` 是一个懒加载的路由。

```tsx
export default function LazyRoute() {
  return <h1>Lazy Route</h1>
}
```

如果你想定义一个非懒加载的路由，你可以使用命名的 `Component` 导出：

```tsx
export function Component() {
  return <h1>Non Lazy Route</h1>
}
```

## Splat 路由

最后，要定义一个 splat 路由（也称为 catch-all 路由），我们可以创建一个名为 `$.tsx` 的文件。

```tsx
// routes/$.tsx

export function Component() {
  return <h1>404</h1>
}
```

现在如果我们访问一个不存在的路由，我们将看到 `404` 页面。
