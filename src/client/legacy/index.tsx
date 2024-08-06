import { memo } from 'react'
import { RouteContext } from './route-context'
import RouterComponent from './router-component'
import { type RouterPropsType } from './types'

function RouterProvider(props: RouterPropsType) {
  return (
    <RouteContext.Provider>
      <RouterComponent {...props} />
    </RouteContext.Provider>
  )
}

export default memo(RouterProvider)
