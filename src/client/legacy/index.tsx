import { memo } from 'react'
import { RouteContext } from './route-context'
import RouterComponent from './router-component'
import { type RouterProps } from './types'

function RouterProvider(props: RouterProps) {
  return (
    <RouteContext.Provider>
      <RouterComponent {...props} />
    </RouteContext.Provider>
  )
}

export default memo(RouterProvider)
