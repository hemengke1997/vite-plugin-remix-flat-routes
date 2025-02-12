# Using Data APIs

React Router 6.4 introduced a new set of APIs for working with data. These APIs allow you to load and mutate data while navigating between routes similar to what Remix does. This guide will walk you through how to use these APIs. If you're not familiar with these new APIs, check the [React Router's documentation](https://reactrouter.com/en/main/start/overview) to learn more.

## Loaders

Loaders allow you to load data before a route renders. To learn more about route
`loaders`, check out the [Route Loaders](https://reactrouter.com/en/main/route/loader) guide.

To define a route `loader`, you can export a `loader` function from your route's module.

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

## Actions

Actions allow you to submit data to the server. To learn more about route
`actions`, check out the [Route Actions](https://reactrouter.com/en/main/route/action) guide.

To define a route `action`, you can export an `action` function from your route's module.

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
  // this will be the response from the action
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

## Error Elements

Error Elements allow you to render a custom error element when an error occurs while loading or submitting data. To learn more about route `errorElements`, check out the [Route Error Elements](https://reactrouter.com/en/main/route/error-element) guide.

To define a route `errorElement`, you can export an `ErrorBoundary` component from your route's module.

```tsx
export function ErrorBoundary() {
  const error = useRouteError()
  return <div>Oops! Something went wrong.</div>
}
```

## Handle

A route handle is useful for adding any application-specific data to routes. To learn more about route `handle`s, check out the react-router docs on the [Route Handle](https://reactrouter.com/en/main/route/route#handle).

To define a route `handle`, you can export a `handle` object from your route's module.

```tsx
export const handle = {
  i18n: ['home']
}
```
