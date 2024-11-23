# Legacy Route

Even if you use react-router<=6.3.0, you can still enjoy the file-system routing provided by remix-flat-routes

Just follow the steps below:

## Step 1: Enable legacy routing mode

**If react-router-dom version is less than or equal to 6.3.0, you can skip this step.**

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

export default defineConfig({
  plugins: [
    remixFlatRoutes({
      legacy: true,
    }),
  ],
})
```

## Step2: Define your route as usual

```tsx
export default function Hello() {
  return (
    <div>
      <h1>Hello World!</h1>
      <p>This is legacy routing</p>
    </div>
  )
}
```

## Step 3: Create Router

You should use the `LegacyRouterProvider` component to render the routes

```tsx
import { BrowserRouter } from 'react-router-dom'
import { routes } from 'virtual:remix-flat-routes'
import { LegacyRouterProvider } from 'vite-plugin-remix-flat-routes/client'


export default function App() {
  return (
      <BrowserRouter>
        <LegacyRouterProvider
            routes={routes}
            onRouteMount={(_payload) => {
              // console.log(payload, 'onRouteMount')
            }}
            onRouteUnmount={(_payload) => {
              // console.log(payload, 'onRouteUnmount')
            }}
            onRouteWillMount={(_payload) => {
              // console.log(payload, 'onRouteWillMount')
            }}
          />
      </BrowserRouter>
    )
}
```

## Step4: Use `handle`

This Plugin implements `handle` like react router 6.4.0. You can use it as follows:

```tsx
import { useEffect } from 'react'
import { type PropsWithMatchRoute, useMatchRoutes } from 'vite-plugin-remix-flat-routes/client'

export const handle = {
  i18n: ['home']
}

export default function Home(props: PropsWithMatchRoute) {
  const matchRoutes = useMatchRoutes<
    () => Promise<{
      i18n: string[]
    }>
  >()

  useEffect(() => {
    console.log(props, 'props')
    console.log(matchRoutes, 'matchRoutes')
  }, [props, matchRoutes])
}
```



That's it! You can now enjoy the file-system routing with react-router<=6.3.0.



## Advanced Usage

### LegacyRouterProvider

`LegacyRouterProvider` is a component that provides the legacy router context to the application.

#### Props

- **routes**: `Route[]` - The routes to be used by the router.
- **onRouteWillMount**: `(payload: RouteWillMountPayload) => void` - A callback that is called before a route is mounted.
- **onRouteMount**: `(payload: RouteMountPayload) => void` - A callback that is called when a route is mounted.
- **onRouteUnmount**: `(payload: RouteUnmountPayload) => void` - A callback that is called when a route is unmounted.
- **render**: `children: ReactNode | null) => ReactNode` - A function that renders the children of the router.
- **suspense**: `ReactNode` - A fallback component to be rendered while the router is loading.
- **basename**: `string` - The base URL for all routes.
