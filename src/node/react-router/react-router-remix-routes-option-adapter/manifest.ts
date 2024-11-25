import { type RouteConfigEntry } from '../react-router-dev/config/routes'

/**
 * @see `RouteManifest` in react-router/packages/react-router-remix-routes-option-adapter/manifest.ts
 */
export type RouteManifestEntry = Omit<RouteConfigEntry, 'children'> & {
  /**
   * The unique id for this route, named like its `file` but without the
   * extension. So `app/routes/gists/$username.tsx` will have an `id` of
   * `routes/gists/$username`.
   */
  id: string

  /**
   * The unique `id` for this route's parent route, if there is one.
   */
  parentId?: string
}

export interface RouteManifest {
  [routeId: string]: RouteManifestEntry
}
