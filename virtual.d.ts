declare module 'virtual:remix-flat-routes' {
  import type { RouteObject } from 'react-router-dom'
  type Route<T> = {
    lazy?: () => Promise<any>
    meta?: any
    children?: Route<T>[]
  } & T
  const routes: Route<RouteObject>[]
  export { routes }
}
