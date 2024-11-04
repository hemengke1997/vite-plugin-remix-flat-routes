# Configuration route

Benifits from `Legacy` route, this plugin also supports static configuration route.

::: tip
Although configuration routing is supported, we strongly recommend using the file-system routing
:::


Follow the steps below to configure your routes

## Step 1: Define your routes

```tsx
import { type Route } from 'vite-plugin-remix-flat-routes/client'

export const routes: Route<{
  i18n: string[]
  fn?: () => void
}>[] = [
  {
    path: '/',
    lazyComponent: () => import('./pages/home'),
    handle: {
      i18n: ['home'],
    },
  },
  {
    path: '/page-a',
    lazyComponent: () => import('./pages/page-a'),
    handle: {
      i18n: ['page-a'],
      fn: () => {
        console.log('page a')
      },
    },
  },
  {
    path: '/page-c',
    redirect: '/page-b',
  },
  {
    path: '/page-b',
    lazyComponent: () => import('./pages/page-b'),
    handle: {
      i18n: ['page-b'],
    },
  },
  {
    path: '/nest',
    children: [
      {
        path: 'a',
        lazyComponent: () => import('./pages/nest/a'),
      },
    ],
  },
  {
    path: '*',
    element: <div>404</div>,
  },
]
```

## Step 2: Create Router

You should use the `LegacyRouterProvider` component to render the routes

```tsx
import { BrowserRouter } from 'react-router-dom'
import { LegacyRouterProvider } from 'vite-plugin-remix-flat-routes/client'
import { routes } from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <LegacyRouterProvider
        routes={routes}
      ></LegacyRouterProvider>
    </BrowserRouter>
  )
}
```

That's it! You have successfully configured your routes using the static configuration.

You don't need import vite plugin in your `vite.config.ts`


```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes' // [!code --]

export default defineConfig({
  plugins: [
    remixFlatRoutes(), // [!code --]
  ],
})
```
