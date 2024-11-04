# Client API

## LegacyRouterProvider

`LegacyRouterProvider` is a component that provides the legacy router context to the application.

### Props

- **routes**: `Route[]` - The routes to be used by the router.
- **onRouteWillMount**: `(payload: RouteWillMountPayload) => void` - A callback that is called before a route is mounted.
- **onRouteMount**: `(payload: RouteMountPayload) => void` - A callback that is called when a route is mounted.
- **onRouteUnmount**: `(payload: RouteUnmountPayload) => void` - A callback that is called when a route is unmounted.
- **render**: `children: ReactNode | null) => ReactNode` - A function that renders the children of the router.
- **suspense**: `ReactNode` - A fallback component to be rendered while the router is loading.
- **basename**: `string` - The base URL for all routes.
