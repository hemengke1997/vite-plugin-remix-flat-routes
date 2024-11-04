# Plugin API

## appDirectory

- **Type**: `string`
- **Default**: `'app'`

Remix use `app` as the default directory for the routes, this plugin also use `app` as the default directory for the routes. If you want to change the directory name, you can set the `appDirectory` option.

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

export default defineConfig({
  plugins: [remixFlatRoutes({ appDirectory: 'src' })],
})
```

## flatRoutesOptions

- **Type**: `Pick<
    FlatRoutesOptions,
    'paramPrefixChar' | 'routeDir' | 'routeRegex' | 'visitFiles' | 'basePath' | 'ignoredRouteFiles' | 'defineRoutes'>`

`flatRoutesOptions` is same as `remix-flat-routes` options, you can pass the options to the plugin.

Learn more about the options in the [remix-flat-routes documentation](https://github.com/kiliman/remix-flat-routes)

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

export default defineConfig({
  plugins: [
    remixFlatRoutes({
      flatRoutesOptions: {
        ignoredRouteFiles: ['**/components/**'],
        // other options
      },
    }),
  ],
})
```

## routes

- **Type**: `(
    defineRoutes: DefineRoutesFunction,
    options: {
      ignoredRouteFiles: string[]
    },
  ) => ReturnType<DefineRoutesFunction> | Promise<ReturnType<DefineRoutesFunction>>`

You can define your own route convention by passing the `routes` option to the plugin.

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

export default defineConfig({
  plugins: [
    remixFlatRoutes({
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route('/somewhere/cool/*', 'catchall.tsx')
        })
      },
    }),
  ],
})
```

## legacy

- **Type**: `boolean`

This plugin also support non data-api route, you can set the `legacy` option to `true` to enable the legacy route.

Plugin will detect react-router-dom package version to decide the route type in default. If the version is less than or equal to 6.3, the plugin will use the legacy route.


## handleAsync

- **Type**: `boolean`
- **Default**: `false`

When the route is lazy-loaded but you want to get `handle` data before the route is loaded, you can set the `handleAsync` option to `true`, then the plugin will convert the `handle` into an asynchronous function. You can execute the async `handle` function to get `handle` data.

In `legacy` routing mode, this option is always `true`.

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

export default defineConfig({
  plugins: [
    remixFlatRoutes({
      handleAsync: true,
    }),
  ],
})
```

```tsx
export const handle = {
  i18n: ['home']
}
```

```ts
import { matchRoutes, type RouteObject } from 'react-router-dom'
import { routes } from 'virtual:remix-flat-routes'

export async function resolveNamespace(pathname = window.location.pathname) {
  const res = await Promise.all(
    matchRoutes(routes as RouteObject[], pathname)?.map(async (route) => {
      const { handle } = route.route
      if (typeof handle === 'function') {
        return await handle()
      }
      return handle
    }) || [],
  )
  return res
    .filter((t) => t?.i18n)
    .map((t) => t.i18n)
    .flat()
}
```

## reactRefresh

- **Type**: `boolean`
- **Default**: `true`

`@vitejs/plugin-react` hmr only support React components. Enable this option to hack the hmr to support react router data api

You should install `@vitejs/plugin-react>=4.3.2`  or `@vitejs/plugin-react-swc>=3.6.0`
