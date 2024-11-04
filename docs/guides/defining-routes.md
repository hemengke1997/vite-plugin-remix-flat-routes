# Defining Routes

Now that we installed the plugin and defined our first route, let's take a look at how we can define different types of routes in our application. If you are
familiar with [Remix-flat-routes conventions](https://github.com/kiliman/remix-flat-routes),
you can skip this page and go to the next one.

Since `vite-plugin-remix-routes` is built on top of `react-router`, you need to
be familiar with the basic concepts of `react-router` to fully understand how to
use this plugin. You can find more information about `react-router` in their
[official documentation](https://reactrouter.com/en/main/start/concepts)

## Basic Routes

As we've seen in the [Define you first route](/guides/getting-started.html#step-2-define-your-first-route), to define a basic route, we simply create a file in the `routes` directory. The file name will be used as the route path. Each route file should export a React component that will be rendered when the route is matched.

Let's create a new route called `about`:

```bash
$ touch app/routes/about.tsx
```

Now let's define the route component:

```tsx
// app/routes/about.tsx

export default function About() {
  return <h1>About</h1>
}
```

Now if we visit `/about` in our browser, we should see the `About` component.

## Nested Routes

To define nested routes, we can create a directory in the `routes` directory
with the name of the route. Let's create a new route for `/users/profile`:

```tsx
// app/routes/users+/profile.tsx

export default function Profile() {
  return <h1>Profile</h1>
}
```

Now if we navigate to `/users/profile` in our browser, and we will see the
`Profile` page.

## Dynamic Routes

For creating a dynamic route, we need to create a file in the `routes` directory
with a name that starts with a `$`. Let's say we need a route that will match
`/users/:id`, we can create a file called `$id.tsx` in the `routes/users`
directory:

```tsx
// app/routes/users+/$id.tsx
import { useParams } from 'react-router-dom'

export function Component() {
  const { id } = useParams()

  return <h1>User {id}</h1>
}
```

We can see `User 1` on the page by visiting `/users/1` in the browser.

## Index Routes

To define an index route, we can create a file named `index`. Let's create an
index route for the `routes/users` directory:

```tsx
// app/routes/users+/index.tsx

export default function Users() {
  return <h1>Users</h1>
}
```

Now if we visit `/users` in the browser, we should see the `Users` page.

## Layout Routes

Each sub-directory in the `routes` directory can have a custom layout. To define a layout for a directory, we should create a `_layout` file in the directory. For example, to define a layout for the `routes/users+` directory, we create a file called `_layout` in the `users+` directory:

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

Keep in mind that the layout component should render the `Outlet` component or `useOutlet` to be able to render children routes.

## Lazy Routes

In order to keep your application bundles small and support code-splitting of your routes, you can define lazy routes. `default export` of the route file is a lazy-loaded route

```tsx
export default function LazyRoute() {
  return <h1>Lazy Route</h1>
}
```

If you want to define a non-lazy-loaded route, you can use named `Component` exports:

```tsx
export function Component() {
  return <h1>Non Lazy Route</h1>
}
```


## Splat Routes

Finally to define a splat route (aka catch-all route), we can create a file
named `$.tsx`.

```tsx
// routes/$.tsx

export function Component() {
  return <h1>Not Found</h1>
}
```

Now if we visit a route that doesn't exist, we should see the `NotFound` page.
