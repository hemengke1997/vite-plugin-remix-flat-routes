```markdown
# KeepAlive

:::warning WIP
This feature is currently unstable, and the API may change.
:::

`KeepAlive` is a route-level caching component that can cache the state of components, so they are not destroyed even when switching routes.

`Vue` natively supports [`KeepAlive`](https://vuejs.org/guide/built-ins/keep-alive.html), but `React` does not have a similar feature. `vite-plugin-remix-flat-routes` provides a route-level `KeepAlive` implementation.

`KeepAlive` is very easy to use! Please read on.

## Usage

First, we need to place the `KeepAlive` component in the `root`.

```tsx
// root.tsx

import { KeepAlive } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  return (
    <KeepAlive />
  )
}
```

Then, in each route file, we can control whether to cache the route component through the `handle`.

If you want to cache the component, just add `keepAlive: true` in the `handle`.

```tsx
// app/index/index.tsx
export const handle = {
  keepAlive: true
}
```

That's it! Now the component will be cached!

## Advanced Usage

### transition

- **Type**: `boolean | TransitionProps`
- **Default**: `false`

`KeepAlive` has built-in support for route component transition animations. The transition is provided by `react-transition-preset`. For more details, see [react-transition-preset](https://github.com/hemengke1997/react-transition-preset).

```tsx
// root.tsx

import { KeepAlive } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  return (
    <KeepAlive transition={true} />
  )
}
```

### useKeepAlive

`useKeepAlive` is used to get and control route caches.

```tsx
import { useKeepAlive } from 'vite-plugin-remix-flat-routes/client'

export default function Page() {
  const { destroy, destroyAll, getAliveRoutes } = useKeepAlive()
}
```

#### destroy

- **Type**: `(pathname: string) => void`

Destroy the cache of a specified route.

#### destroyAll

- **Type**: `() => void`

Destroy all route caches.

#### getAliveRoutes

- **Type**: `() => string[]`

Get all cached routes.

### useActiveChanged

Listen for whether a route is activated. This can be simply understood as `onActivated` and `onDeactivated` in `Vue`.

```tsx
import { useActiveChanged } from 'vite-plugin-remix-flat-routes/client'

export default function Page() {
  useActiveChanged((active) => {
    console.log(active)
  })
}
```

### getScrollRestoration

::: danger Note
Not supported in `handleAsync` mode.
:::

- **Type**: `GetScrollRestorationKeyFunction`

Used to maintain the scroll state of cached routes.

For more details, see the [ScrollRestoration](https://reactrouter.com/6.28.0/components/scroll-restoration#getkey) in react-router.

```tsx
// root.tsx

import { ScrollRestoration } from 'react-router-dom'
import { getScrollRestoration, KeepAlive } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  return (
    <>
      <KeepAlive />
      <ScrollRestoration getKey={getScrollRestoration} />
    </>
  )
}
```
```
