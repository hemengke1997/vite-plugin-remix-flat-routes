# KeepAlive

:::warning WIP
此功能目前还不稳定，API 可能会有变动
:::

`KeepAlive` 是一个路由级别的缓存组件，可以缓存组件的状态，即使切换路由也不会销毁组件。

`Vue` 原生支持了 [`KeepAlive`](https://cn.vuejs.org/guide/built-ins/keep-alive)，而 `React` 中并没有类似的功能，`vite-plugin-remix-flat-routes` 提供了路由级的 `KeepAlive` 实现。

`KeepAlive` 使用非常简单！请往下看。

## 使用

首先，我们需要将 `KeepAlive` 组件写在 `root` 中

```tsx
// root.tsx

import { KeepAlive } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  return (
    <KeepAlive />
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

- **类型**: `boolean | TransitionProps`
- **默认值**: `false`

`KeepAlive` 内置了路由组件的切换动画能力。动画过渡由 `react-transition-preset` 提供，具体可见 [react-transition-preset](https://github.com/hemengke1997/react-transition-preset)

```tsx
// root.tsx

import { KeepAlive } from 'vite-plugin-remix-flat-routes/client'

export function Component() {
  return (
    <KeepAlive transiton={true} />
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

### getScrollRestoration

::: danger 注意
不支持 `handleAsync` 模式
:::

- **类型**: `GetScrollRestorationKeyFunction`

用于保持缓存路由的滚动状态。

具体可见 react-router 的 [ScrollRestoration](https://reactrouter.com/6.28.0/components/scroll-restoration#getkey)。

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
