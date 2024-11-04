# 插件API

## appDirectory

- **类型**: `string`
- **默认值**: `'app'`

Remix 使用 `app` 作为默认的路由目录，这个插件也使用 `app` 作为默认的路由目录。如果你想要更改目录名称，你可以设置 `appDirectory` 选项。

```ts
import { defineConfig } from 'vite'
import { remixFlatRoutes } from 'vite-plugin-remix-flat-routes'

export default defineConfig({
  plugins: [remixFlatRoutes({ appDirectory: 'src' })],
})
```

## flatRoutesOptions

- **类型**: `Pick<
    FlatRoutesOptions,
    'paramPrefixChar' | 'routeDir' | 'routeRegex' | 'visitFiles' | 'basePath' | 'ignoredRouteFiles' | 'defineRoutes'>`

`flatRoutesOptions` 与 `remix-flat-routes` 的选项相同，你可以将选项传递给插件。

了解有关选项的更多信息，请参阅 [remix-flat-routes 文档](ttps://github.com/kiliman/remix-flat-routes)

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

- **类型**: `(
    defineRoutes: DefineRoutesFunction,
    options: {
      ignoredRouteFiles: string[]
    },
  ) => ReturnType<DefineRoutesFunction> | Promise<ReturnType<DefineRoutesFunction>>`

你可以通过配置 `routes` 选项来定义自己的路由约定。

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

- **类型**: `boolean`

此插件也支持非data-api的路由，你可以设置 `legacy` 选项来开启传统路由模式。

默认情况下，插件会自动检测你的 `react-router-dom` 版本，如果版本小于等于 6.3.0，插件会自动开启传统路由模式。

## handleAsync

- **类型**: `boolean`
- **默认值**: `false`

当路由是懒加载，但你需要路由中的handle数据时，可以把 `handleAsync` 设置为 `true`。
插件会将 `handle` 对象转化为异步函数，你可以手动直行函数来获取 `handle` 数据

在 Legacy 传统路由模式下，此选项始终为 `true`

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

- **类型**: `boolean`
- **默认值**: `true`

`@vitejs/plugin-react` 的 hmr 只支持 React 组件。启用此选项以支持 react router 数据 api

你需要安装 `@vitejs/plugin-react>=4.3.2` 或 `@vitejs/plugin-react-swc>=3.6.0`
