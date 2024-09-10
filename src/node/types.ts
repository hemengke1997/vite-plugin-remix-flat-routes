import { type RouteObject } from 'react-router-dom'
import { type ValueOf } from 'type-fest'
import { type ConfigRoute } from './remix'
import { type FlatRoutesOptions } from './remix-flat-routes'
import { type LegacyRouteManifest } from './types-legacy'

export type RouteExports<T> = AddHasPrefix<T>

type AddHasPrefix<T> = {
  [K in keyof T as `has${Capitalize<string & K>}`]?: boolean
}

export type RouteManifest = {
  [routeId: string]: ConfigRoute & RouteExports<RouteObject>
}

export type Route = ValueOf<RouteManifest> & {
  children: Route[]
}

export type PluginContext = {
  rootDirectory: string
  routeManifest: RouteManifest | LegacyRouteManifest
  remixOptions: RemixOptions
  isLegacyMode: boolean
}

export type RemixOptions = {
  appDirectory: string
  flatRoutesOptions?: Pick<
    FlatRoutesOptions,
    'paramPrefixChar' | 'routeDir' | 'routeRegex' | 'visitFiles' | 'basePath' | 'ignoredRouteFiles'
  >
}
