# 客户端 API

## LegacyRouterProvider

`LegacyRouterProvider` 是传统路由渲染组件

### Props

- **routes**: `Route[]` - 路由数组。
- **onRouteWillMount**: `(payload: RouteWillMountPayload) => void` - 在路由挂载之前调用的回调函数。
- **onRouteMount**: `(payload: RouteMountPayload) => void` - 在路由挂载时调用的回调函数。
- **onRouteUnmount**: `(payload: RouteUnmountPayload) => void` - 在路由卸载时调用的回调函数。
- **render**: `(children: ReactNode | null) => ReactNode` - 渲染路由组件，可用于增强渲染。
- **suspense**: `ReactNode` - 路由加载时渲染的suspense组件。
- **basename**: `string` - 路由 baseUrl
