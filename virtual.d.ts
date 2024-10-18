declare module 'virtual:remix-flat-routes' {
  import type { RouteObject } from 'react-router-dom'
  type Route<T> = {
    /**
     * 路由id (data-api mode)
     */
    id?: string
    /**
     * 路由组件 (legacy mode)
     */
    lazyComponent?: () => Promise<any>
    /**
     * 路由handle (legacy mode)
     */
    handle?: {
      [key: string]: any
    }
    /**
     * 子路由 (legacy mode)
     */
    children?: Route<T>[]
    /**
     * 重定向 (legacy mode)
     */
    redirect?: string
  } & T
  const routes: Route<RouteObject>[]
  export { routes }
}
