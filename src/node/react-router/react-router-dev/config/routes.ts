export interface RouteConfigEntry {
  /**
   * The unique id for this route.
   */
  id?: string

  /**
   * The path this route uses to match on the URL pathname.
   */
  path?: string

  /**
   * Should be `true` if it is an index route. This disallows child routes.
   */
  index?: boolean

  /**
   * Should be `true` if the `path` is case-sensitive. Defaults to `false`.
   */
  caseSensitive?: boolean

  /**
   * The path to the entry point for this route, relative to
   * `config.appDirectory`.
   */
  file: string

  /**
   * The child routes.
   */
  children?: RouteConfigEntry[]
}
