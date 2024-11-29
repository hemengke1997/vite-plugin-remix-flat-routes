# KeepAlive

我们可以使用 `keepalive-react-router` 轻松实现路由级别的 KeepAlive 缓存。

## 安装依赖

```bash
npm install keepalive-react-router
```

## Usage

只需两个简单的步骤！

首先，在 `root` 路由组件中，替换 `Outlet`：

```tsx
// root.tsx
import { KeepAlive, KeepAliveProvider } from 'keepalive-react-router'

export function Root() {
  return (
    <>
      <Outlet /> // [!code --]
      <KeepAliveProvider> // [!code ++]
        <KeepAlive /> // [!code ++]
      </KeepAliveProvider> // [!code ++]
    </>
  )
}
```

然后，在路由组件中，导出 `keepAlive` 以启用路由缓存。

```tsx
// Route component

export const handle = { keepAlive: true }

export default function Page() {
  return <div>Page</div>
}
```

就是这么简单！路由组件现在具有缓存功能了。

有关更多配置，请参阅 [keepalive-react-router](https://hemengke1997.github.io/keepalive-react-router/) 文档。
