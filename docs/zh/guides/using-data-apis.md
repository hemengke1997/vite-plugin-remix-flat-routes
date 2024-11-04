# 使用 Data API

React Router 6.4 引入了一组新的 API 用于处理数据。这些 API 允许你在路由之间导航时加载和操作数据，类似于 Remix。本指南将指导您如何使用这些 API。如果你对这些新的 API 不熟悉，请查看 [React Router 文档](https://reactrouter.com/en/main/start/overview) 以了解更多。


## Loader

Loader 允许你在路由渲染之前加载数据。要了解有关路由 `loader` 的更多信息，请查看 [Route Loaders](https://reactrouter.com/en/main/route/loader) 指南。

要定义路由 `loader`，你可以从路由模块中导出一个 `loader` 函数。

```tsx
// src/routes/posts/index.tsx
import { LoaderFunction, useLoaderData } from 'react-router-dom'

export const loader: LoaderFunction = async () => {
  return fetch('/api/posts').then((res) => res.json())
}

export default function Posts() {
  const posts = useLoaderData<typeof loader>()
}
```

## Action

Action 允许你向服务器提交数据。要了解有关路由 `action` 的更多信息，请查看 [Route Actions](https://reactrouter.com/en/main/route/action) 指南。

要定义路由 `action`，你可以从路由模块中导出一个 `action` 函数。

```tsx
// src/routes/posts/create.tsx
import { ActionFunction, Form, useActionData } from 'react-router-dom'

export const action: ActionFunction = async ({ request }) => {
  const data = Object.fromEntries(await request.formData())

  return await fetch('/api/posts', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((response) => response.json())
}

export function Component() {
  // 这会是 action 的响应
  const data = useActionData()

  return (
    <Form method="post">
      <label htmlFor="title">Title</label>
      <input id="title" name="title" type="text" />

      <label htmlFor="content">Content</label>
      <textarea id="content" name="content"></textarea>

      <button type="submit">Create new post</button>
    </Form>
  )
}
```

## Error Element

Error Element 允许你在加载数据时发生错误时显示一个错误消息。要了解有关路由 `errorElement` 的更多信息，请查看 [Route Error Elements](https://reactrouter.com/en/main/route/error-element) 指南。

要定义路由 `errorElement`，你可以从路由模块中导出一个 `errorElement` 组件。

```tsx
export function ErrorBoundary() {
  const error = useRouteError()
  return <div>Oops! Something went wrong.</div>
}
```

## Handle

Handle 允许你在路由渲染时处理数据。要了解有关路由 `handle` 的更多信息，请查看 [Route Handles](https://reactrouter.com/en/main/route/handle) 指南。

要定义路由 `handle`，你可以从路由模块中导出一个 `handle` 函数。

```tsx
export const handle = {
  i18n: ['home']
}
```
