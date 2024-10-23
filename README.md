# vite-plugin-remix-flat-routes

> Integrate [Remix](https://remix.run/docs/en/main/file-conventions/routes) & [remix-flat-routes](https://github.com/kiliman/remix-flat-routes) convention-based routing, supporting [react-router data routing/traditional routing](https://reactrouter.com/en/main/routers/create-browser-router)

## Note

For react-refresh HMR support, please install `@vitejs/plugin-react >= 4.3.2` or `@vitejs/plugin-react-swc >= 3.6.0`


[中文文档](./README.zh.md)

## Installation

```bash
npm i vite-plugin-remix-flat-routes
```

## Usage

### Configure TypeScript type hints

Import in tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-remix-flat-routes/virtual"]
  }
}
```

Or import in file

```ts
/// <reference types="vite-plugin-remix-flat-routes/virtual" />
```

### Configure vite plugin

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [remixFlatRoutes()],
})
```

#### Plugin configuration

```ts
type Options = {
  appDirectory?: string // Default is 'app'
  // remix-flat-routes configuration
  flatRoutesOptions?: {
    routeDir?: string | string[] // Default is 'routes'
    ignoreRouteFiles?: string[] // Default is []
    basePath?: string // Default is '/'
    paramPrefixChar?: string // Default is '$'
    routeRegex?: RegExp
    visitFiles?: VisitFilesFunction
  }
  legacy?: boolean // Whether to enable traditional routing mode, automatically detected by default
  handleAsync?: boolean // Whether to convert handle to an asynchronous function, default is false
}
```

### Organize routes according to [remix-flat-routes documentation](https://github.com/kiliman/remix-flat-routes)

For example
```
app
├── main.tsx            // Entry file, included in index.html
├── root.tsx            // Root route (https://remix.run/docs/en/main/file-conventions/root)
└── routes              // Routes directory
    ├── $.tsx           // 404 page
    ├── _index          // Home page
    │   └── _index.tsx
    └── _sign+
        ├── _layout.tsx
        ├── signin
        │   └── _index.tsx
        └── signup
            └── _index.ts
```

## Examples

- [Convention-based data routing](./playground/data-api/)
- [Convention-based traditional routing](./playground/legacy/)
- [Configuration-based routing](./playground/config-route/)

## Conventions

> To better support Remix's routing conventions, the plugin makes some assumptions as follows

1. The default export `(export default)` of the route file is a **lazy-loaded** route
2. Named exports `(export function Component)` of the route component are **non-lazy-loaded** routes

## [Data routing mode (react-router-dom>=6.4.0)](https://reactrouter.com/en/main/routers/picking-a-router)

### Configure react-router-dom

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'

// https://reactrouter.com/en/main/routers/create-browser-router
const router = createBrowserRouter(routes)

const root = createRoot(document.getElementById('root'))

// **Use data routing**
// https://reactrouter.com/en/main/router-components/browser-router
root.render(<RouterProvider router={router} />)
```

### Export route component and configuration from the file

```tsx
import { useEffect } from 'react'
import { type LoaderFunction, useMatches } from 'react-router-dom'

// https://reactrouter.com/en/main/route/route#handle
export const handle = {
  test: 'this is handle',
}

export default function Page() {
  return <div>Lazy-loaded route</div>
}

// You can also export a lazy function to lazy load the component
export const lazy = async () => ({
  Component: (await import('./_index.lazy')).default,
})

export function Component() {
  return <div>Non-lazy-loaded route</div>
}

// https://reactrouter.com/en/main/route/route#loader
export const loader: LoaderFunction = (args) => {
  console.log('this is loader', args)
  return null
}

// For more Data-API exports, refer to [react-router documentation](https://reactrouter.com/en/main/route/route)
```

## [Traditional routing mode (react-router-dom<=6.3.0)](https://reactrouter.com/en/main/routers/create-browser-router)

> Traditional routing mode only supports Handle conventions

### Configure the Vite plugin

```tsx
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    remixFlatRoutes({
      // By default, the plugin will auto-detect the version of react-router-dom. If it is >= 6.4.0, data routing mode is enabled
      // Otherwise, traditional routing mode is enabled
      // You can also manually enable traditional routing mode
      legacy: true,
    }),
  ],
})
```

### Configure react-router-dom

```tsx
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { routes } from 'virtual:remix-flat-routes'
import { LegacyRouterProvider } from 'vite-plugin-remix-flat-routes/client' // Import LegacyRouterProvider

const root = createRoot(document.getElementById('root'))

// **Use traditional routing**
root.render(
  <BrowserRouter>
    <LegacyRouterProvider routes={routes} />
  </BrowserRouter>,
)
```

### Export route component from the file

> Note that traditional routing only supports Handle conventions

#### Default export (lazy-loaded)
```tsx
export default function Page() {
  return <div>Lazy-loaded route</div>
}

export const handle = {
  test: 'this is handle',
}
```

#### Named export Component (non-lazy-loaded)
```tsx
export function Component() {
  return <div>Non-lazy-loaded route</div>
}
```

### Get handle

There are the following ways to get handle

#### 1. Get handle from `props`

```tsx
import { type PropsWithMatchRoute } from 'vite-plugin-remix-flat-routes/client'

export default function (props: PropsWithMatchRoute) {
  const { handle } = props
}
```

#### 2. Use `useMatchRoutes` to get handle

```tsx
import { useMatchRoutes } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  const matchRoutes = useMatchRoutes()
}
```

## Note

1. Files in the routes directory that match `flatRoutesOptions.routeRegex` are recognized as route components. If you do not want certain files to be considered as route components, you can configure it through `flatRoutesOptions.ignoreRouteFiles`

For example

```ts
remixFlatRoutes({
  flatRoutesOptions: {
    ignoreRouteFiles: ['**/components/**', '**/hooks/**'],
  },
})
```

Then all files in the `components` and `hooks` directories will not be recognized as route components

2. If you do not use the built-in remix-flat-routes, you can set the routing convention by passing in `routes`, refer to [remix routes](https://remix.run/docs/en/main/file-conventions/vite-config#routes)

3. If the exported `handle` has side effects, please pass `handleAsync: true` in the plugin configuration. The plugin will convert `handle` to an asynchronous function to resolve serialization issues caused by side effects.

## Inspiration

- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
- [vite-plugin-remix-routes](https://github.com/vjee/vite-plugin-remix-routes)
- [remix-flat-routes](https://github.com/kiliman/remix-flat-routes)
