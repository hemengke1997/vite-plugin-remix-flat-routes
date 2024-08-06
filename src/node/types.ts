import { type AppConfig } from '@remix-run/dev/dist/config'
import { type ConfigRoute } from '@remix-run/dev/dist/config/routes'
import { type RouteObject } from 'react-router-dom'
import { type FlatRoutesOptions } from 'remix-flat-routes'
import { type SetRequired, type ValueOf } from 'type-fest'
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

export type RemixOptions = SetRequired<Pick<AppConfig, 'appDirectory'>, 'appDirectory'> & {
  flatRoutesOptions?: Pick<
    FlatRoutesOptions,
    'paramPrefixChar' | 'routeDir' | 'routeRegex' | 'visitFiles' | 'basePath' | 'ignoredRouteFiles'
  >
}
