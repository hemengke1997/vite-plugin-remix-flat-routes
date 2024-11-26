# KeepAlive

:::warning WIP
此功能目前还不稳定，API 可能会有变动

仅支持 `data-api` 模式
:::

`KeepAlive` 是一个路由级别的缓存组件，可以缓存组件的状态，即使切换路由也不会销毁组件。

`Vue` 原生支持了 [`KeepAlive`](https://cn.vuejs.org/guide/built-ins/keep-alive)，而 `React` 中并没有类似的功能，`vite-plugin-remix-flat-routes` 提供了路由级的 `KeepAlive` 实现。

`KeepAlive` 使用非常简单！请往下看。

## 使用

首先，我们需要将 `root` 中的 `outlet` 替换为 `KeepAlive` 组件。

```jsx
// root.tsx

import { Outlet } from 'react-router-dom' // [!code --]
import { KeepAlive } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  return (
   <>
      <Outlet /> // [!code --]
      <KeepAlive /> // [!code ++]
   </>
  )
}
```

然后我们可以在每个路由文件中，通过 `handle` 来控制是否缓存路由组件。

如果你想要缓存组件，只需要在 `handle` 中添加 `keepAlive: true` 即可
```tsx
// app/index/index.tsx
export const handle = {
  keepAlive: true
}
```


就是这样！现在组件就会被缓存了！

## 进阶使用

### transition

- **类型**: `TransitionProps | boolean`
- **默认值**: `false`

`KeepAlive` 内置了路由组件的切换动画支持。动画过渡能力由 `react-transition-preset` 驱动，具体可见 [react-transition-preset](https://github.com/hemengke1997/react-transition-preset)

如需使用此功能，请自行安装 `react-transition-preset`。

```tsx
// root.tsx

import { KeepAlive } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  return (
    <KeepAlive transiton={true} />
  )
}
```

### scrollRestoration

- **类型**: `ScrollRestorationProps | false`

默认开启。

缓存 `KeepAlive` 路由的滚动位置，当再次进入缓存的路由时，会自动恢复滚动位置。非 `KeepAlive` 路由不会缓存滚动位置。

如果使用了 `scrollRestoration`，请勿再引入 `react-router-dom` 的 `ScrollRestoration`

```tsx
// root.tsx

import { KeepAlive } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  return (
    <KeepAlive scrollRestoration={} />
  )
}
```

### useKeepAlive

`useKeepAlive` 获取路由缓存和控制缓存。

```tsx
import { useKeepAlive } from 'vite-plugin-remix-flat-routes/client'

export default function Page() {
  const { destory, destroyAll, getAliveRoutes } = useKeepAlive()
}
```

#### destory

- **类型**: `(pathname: string) => void`

销毁指定路由缓存。

#### destroyAll

- **类型**: `() => void`

销毁所有路由缓存。

#### getAliveRoutes

- **类型**: `() => string[]`

获取所有缓存的路由。

### useActiveChanged

监听路由是否被激活。可以简单理解成 `Vue` 中的 `onActivated` 和 `onDeactivated`。

```tsx
import { useActiveChanged } from 'vite-plugin-remix-flat-routes/client'

export default function Page() {
  useActiveChanged((active) => {
    console.log(active)
  })
}
```
