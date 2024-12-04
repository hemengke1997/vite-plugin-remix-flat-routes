# KeepAlive

We can easily integrate `keepalive-react-router` to achieve route-level KeepAlive caching.

## Install Dependencies

```bash
npm install keepalive-react-router
```

## Usage

Just two simple steps!

First, in the `root` route component, replace `Outlet`:

```tsx
// root.tsx
import { KeepAliveOutlet, KeepAliveProvider } from 'keepalive-react-router'

export function Root() {
  return (
    <>
      <Outlet /> // [!code --]
      <KeepAliveProvider> // [!code ++]
        <KeepAliveOutlet /> // [!code ++]
      </KeepAliveProvider> // [!code ++]
    </>
  )
}
```

Then, in the route component, export `keepAlive` to enable route caching.

```tsx
// Route component

export const handle = { keepAlive: true }

export default function Page() {
  return <div>Page</div>
}
```

It's that simple! The route component now has caching capability.

For more configurations, please refer to the [keepalive-react-router](https://hemengke1997.github.io/keepalive-react-router/) documentation.
