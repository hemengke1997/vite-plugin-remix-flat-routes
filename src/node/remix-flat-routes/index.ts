/**
 * @see remix-flat-routes
 */
import minimatch from 'minimatch'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
  createRouteId,
  type DefineRouteFunction,
} from '../react-router/react-router-remix-routes-option-adapter/defineRoutes'
import { type RouteManifest } from '../react-router/react-router-remix-routes-option-adapter/manifest'
import { normalizeSlashes } from '../react-router/react-router-remix-routes-option-adapter/normalizeSlashes'

type MatchRoute = {
  id: string
  path: string
  file: string
  name: string
  segments: string[]
  parentId?: string // first pass parent is undefined
  index?: boolean
  caseSensitive?: boolean
}

type DefineRouteOptions = {
  caseSensitive?: boolean
  index?: boolean
}

type DefineRouteChildren = {
  (): void
}

export type VisitFilesFunction = (dir: string, visitor: (file: string) => void, baseDir?: string) => void

export type FlatRoutesOptions = {
  appDir?: string
  routeDir?: string | string[]
  defineRoutes?: DefineRoutesFunction
  basePath?: string
  visitFiles?: VisitFilesFunction
  paramPrefixChar?: string
  nestedDirectoryChar?: string
  ignoredRouteFiles?: string[]
  routeRegex?: RegExp
}

export type DefineRoutesFunction = (
  callback: (route: DefineRouteFunction) => void,
) => RouteManifest | Promise<RouteManifest>

export type { DefineRouteOptions, DefineRouteChildren, MatchRoute }
export { flatRoutes }

const defaultOptions: FlatRoutesOptions = {
  appDir: 'app',
  routeDir: 'routes',
  basePath: '/',
  paramPrefixChar: '$',
  nestedDirectoryChar: '+',
  routeRegex:
    /((\${nestedDirectoryChar}[\/\\][^\/\\:?*]+)|[\/\\]((index|route|layout|page)|(_[^\/\\:?*]+)|([^\/\\:?*]+\.route)))\.(ts|tsx|js|jsx|md|mdx)$$/,
}
const defaultDefineRoutes = undefined

export default function flatRoutes(
  routeDir: string | string[],
  defineRoutes: DefineRoutesFunction,
  options: FlatRoutesOptions = {},
): RouteManifest {
  const routes = _flatRoutes(options.appDir ?? defaultOptions.appDir!, options.ignoredRouteFiles ?? [], {
    ...defaultOptions,
    ...options,
    routeDir,
    defineRoutes,
  })
  // update undefined parentIds to 'root'
  Object.values(routes).forEach((route) => {
    if (route.parentId === undefined) {
      route.parentId = 'root'
    }
  })

  return routes
}

// this function uses the same signature as the one used in core remix
// this way we can continue to enhance this package and still maintain
// compatibility with remix
function _flatRoutes(
  appDir: string,
  ignoredFilePatternsOrOptions?: string[] | FlatRoutesOptions,
  options?: FlatRoutesOptions,
) {
  // get options
  let ignoredFilePatterns: string[] = []
  if (ignoredFilePatternsOrOptions && !Array.isArray(ignoredFilePatternsOrOptions)) {
    options = ignoredFilePatternsOrOptions
  } else {
    ignoredFilePatterns = ignoredFilePatternsOrOptions ?? []
  }
  if (!options) {
    options = defaultOptions
  }

  const routeMap: Map<string, MatchRoute> = new Map()
  const nameMap: Map<string, MatchRoute> = new Map()

  const routeDirs = Array.isArray(options.routeDir) ? options.routeDir : [options.routeDir ?? 'routes']
  const defineRoutes = options.defineRoutes ?? defaultDefineRoutes
  if (!defineRoutes) {
    throw new Error('You must provide a defineRoutes function')
  }
  const visitFiles = options.visitFiles ?? defaultVisitFiles
  const routeRegex = getRouteRegex(
    options.routeRegex ?? defaultOptions.routeRegex!,
    options.nestedDirectoryChar ?? defaultOptions.nestedDirectoryChar!,
  )

  for (const routeDir of routeDirs) {
    visitFiles(path.join(appDir, routeDir), (file) => {
      if (ignoredFilePatterns && ignoredFilePatterns.some((pattern) => minimatch(file, pattern, { dot: true }))) {
        return
      }

      if (isRouteModuleFile(file, routeRegex)) {
        const matchRoute = getRouteInfo(routeDir, file, options!)
        routeMap.set(matchRoute.id, matchRoute)
        nameMap.set(matchRoute.name, matchRoute)
        return
      }
    })
  }
  // update parentIds for all routes
  Array.from(routeMap.values()).forEach((matchRoute) => {
    const parentId = findParentRouteId(matchRoute, nameMap)
    matchRoute.parentId = parentId
  })

  // Then, recurse through all routes using the public defineRoutes() API
  function defineNestedRoutes(defineRoute: DefineRouteFunction, parentId?: string): void {
    const childRoutes = Array.from(routeMap.values()).filter((matchRoute) => matchRoute.parentId === parentId)
    const parentRoute = parentId ? routeMap.get(parentId) : undefined
    const parentRoutePath = parentRoute?.path ?? '/'
    for (const childRoute of childRoutes) {
      let routePath = childRoute?.path?.slice(parentRoutePath.length) ?? ''
      // remove leading slash
      if (routePath.startsWith('/')) {
        routePath = routePath.slice(1)
      }
      const index = childRoute.index

      if (index) {
        const invalidChildRoutes = Object.values(routeMap).filter((matchRoute) => matchRoute.parentId === childRoute.id)

        if (invalidChildRoutes.length > 0) {
          throw new Error(
            `Child routes are not allowed in index routes. Please remove child routes of ${childRoute.id}`,
          )
        }

        defineRoute(routePath, routeMap.get(childRoute.id!)!.file, {
          index: true,
        })
      } else {
        defineRoute(routePath, routeMap.get(childRoute.id!)!.file, () => {
          defineNestedRoutes(defineRoute, childRoute.id)
        })
      }
    }
  }
  const routes = defineRoutes(defineNestedRoutes)
  return routes as RouteManifest
}

const routeModuleExts = ['.js', '.jsx', '.ts', '.tsx', '.md', '.mdx']
const serverRegex = /\.server\.(ts|tsx|js|jsx|md|mdx)$/

export function isRouteModuleFile(filename: string, routeRegex: RegExp): boolean {
  // flat files only need correct extension
  const isFlatFile = !filename.includes(path.sep)
  if (isFlatFile) {
    return routeModuleExts.includes(path.extname(filename))
  }
  const isRoute = routeRegex.test(filename)
  if (isRoute) {
    // check to see if it ends in .server.tsx because you may have
    // a _route.tsx and and _route.server.tsx and only the _route.tsx
    // file should be considered a route
    const isServer = serverRegex.test(filename)
    return !isServer
  }
  return false
}

const memoizedRegex = (() => {
  const cache: { [key: string]: RegExp } = {}

  return (input: string): RegExp => {
    if (input in cache) {
      return cache[input]
    }

    const newRegex = new RegExp(input)
    cache[input] = newRegex

    return newRegex
  }
})()

export function isIndexRoute(routeId: string, options: FlatRoutesOptions): boolean {
  const nestedDirectoryChar = (options.nestedDirectoryChar as string).replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
  const indexRouteRegex = memoizedRegex(
    `((^|[.]|[${nestedDirectoryChar}]\\/)(index|_index))(\\/[^\\/]+)?$|(\\/_?index\\/)`,
  )
  return indexRouteRegex.test(routeId)
}

export function getRouteInfo(routeDir: string, file: string, options: FlatRoutesOptions) {
  const filePath = normalizeSlashes(path.join(routeDir, file))
  const routeId = createRouteId(filePath)
  const routeIdWithoutRoutes = routeId.slice(routeDir.length + 1)
  const index = isIndexRoute(routeIdWithoutRoutes, options)
  const routeSegments = getRouteSegments(
    routeIdWithoutRoutes,
    index,
    options.paramPrefixChar,
    options.nestedDirectoryChar,
  )
  const routePath = createRoutePath(routeSegments, index, options)
  const matchRoute = {
    id: routeId,
    path: routePath!,
    file: filePath,
    name: routeSegments.join('/'),
    segments: routeSegments,
    index,
  }

  return matchRoute
}

// create full path starting with /
export function createRoutePath(
  routeSegments: string[],
  index: boolean,
  options: FlatRoutesOptions,
): string | undefined {
  let result = ''
  const basePath = options.basePath ?? '/'
  const paramPrefixChar = options.paramPrefixChar ?? '$'

  if (index) {
    // replace index with blank
    routeSegments[routeSegments.length - 1] = ''
  }
  for (let i = 0; i < routeSegments.length; i++) {
    let segment = routeSegments[i]
    // skip pathless layout segments
    if (segment.startsWith('_')) {
      continue
    }
    // remove trailing slash
    if (segment.endsWith('_')) {
      segment = segment.slice(0, -1)
    }

    // remove outer square brackets
    if (segment.includes('[') && segment.includes(']')) {
      let output = ''
      let depth = 0

      for (const char of segment) {
        if (char === '[' && depth === 0) {
          depth++
        } else if (char === ']' && depth > 0) {
          depth--
        } else {
          output += char
        }
      }

      segment = output
    }

    // handle param segments: $ => *, $id => :id
    if (segment.startsWith(paramPrefixChar)) {
      if (segment === paramPrefixChar) {
        result += `/*`
      } else {
        result += `/:${segment.slice(1)}`
      }
      // handle optional segments with param: ($segment) => :segment?
    } else if (segment.startsWith(`(${paramPrefixChar}`)) {
      result += `/:${segment.slice(2, segment.length - 1)}?`
      // handle optional segments: (segment) => segment?
    } else if (segment.startsWith('(')) {
      result += `/${segment.slice(1, segment.length - 1)}?`
    } else {
      result += `/${segment}`
    }
  }
  if (basePath !== '/') {
    result = basePath + result
  }

  if (result.endsWith('/')) {
    result = result.slice(0, -1)
  }

  return result || undefined
}

function findParentRouteId(matchRoute: MatchRoute, nameMap: Map<string, MatchRoute>): string | undefined {
  let parentName = matchRoute.segments.slice(0, -1).join('/')
  while (parentName) {
    if (nameMap.has(parentName)) {
      return nameMap.get(parentName)!.id
    }
    parentName = parentName.substring(0, parentName.lastIndexOf('/'))
  }
  return undefined
}

export function getRouteSegments(
  name: string,
  index: boolean,
  paramPrefixChar: string = '$',
  nestedDirectoryChar: string = '+',
) {
  let routeSegments: string[] = []
  let i = 0
  let routeSegment = ''
  let state = 'START'
  let subState = 'NORMAL'
  let hasPlus = false

  // name has already been normalized to use / as path separator

  const escapedNestedDirectoryChar = nestedDirectoryChar.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')

  const combinedRegex = new RegExp(`${escapedNestedDirectoryChar}[/\\\\]`, 'g')
  const testRegex = new RegExp(`${escapedNestedDirectoryChar}[/\\\\]`)
  const replacePattern = `${escapedNestedDirectoryChar}/_\\.`
  const replaceRegex = new RegExp(replacePattern)

  // replace `+/_.` with `_+/`
  // this supports ability to specify parent folder will not be a layout
  // _public+/_.about.tsx => _public_.about.tsx

  if (replaceRegex.test(name)) {
    const replaceRegexGlobal = new RegExp(replacePattern, 'g')
    name = name.replace(replaceRegexGlobal, `_${nestedDirectoryChar}/`)
  }

  // replace `+/` with `.`
  // this supports folders for organizing flat-files convention
  // _public+/about.tsx => _public.about.tsx
  //
  if (testRegex.test(name)) {
    name = name.replace(combinedRegex, '.')

    hasPlus = true
  }

  const hasFolder = /\//.test(name)
  // if name has plus folder, but we still have regular folders
  // then treat ending route as flat-folders
  if (((hasPlus && hasFolder) || !hasPlus) && !name.endsWith('.route')) {
    // do not remove segments ending in .route
    // since these would be part of the route directory name
    // docs/readme.route.tsx => docs/readme
    // remove last segment since this should just be the
    // route filename and we only want the directory name
    // docs/_layout.tsx => docs
    const last = name.lastIndexOf('/')
    if (last >= 0) {
      name = name.substring(0, last)
    }
  }

  const pushRouteSegment = (routeSegment: string) => {
    if (routeSegment) {
      routeSegments.push(routeSegment)
    }
  }

  while (i < name.length) {
    const char = name[i]
    switch (state) {
      case 'START':
        // process existing segment
        if (
          routeSegment.includes(paramPrefixChar) &&
          !(routeSegment.startsWith(paramPrefixChar) || routeSegment.startsWith(`(${paramPrefixChar}`))
        ) {
          throw new Error(`Route params must start with prefix char ${paramPrefixChar}: ${routeSegment}`)
        }
        if (routeSegment.includes('(') && !routeSegment.startsWith('(') && !routeSegment.endsWith(')')) {
          throw new Error(`Optional routes must start and end with parentheses: ${routeSegment}`)
        }
        pushRouteSegment(routeSegment)
        routeSegment = ''
        state = 'PATH'
        continue // restart without advancing index
      case 'PATH':
        if (isPathSeparator(char) && subState === 'NORMAL') {
          state = 'START'
          break
        } else if (char === '[') {
          subState = 'ESCAPE'
        } else if (char === ']') {
          subState = 'NORMAL'
        }
        routeSegment += char
        break
    }
    i++ // advance to next character
  }
  // process remaining segment
  pushRouteSegment(routeSegment)
  // strip trailing .route segment
  if (routeSegments.at(-1) === 'route') {
    routeSegments = routeSegments.slice(0, -1)
  }
  // if hasPlus, we need to strip the trailing segment if it starts with _
  // and route is not an index route
  // this is to handle layouts in flat-files
  // _public+/_layout.tsx => _public.tsx
  // _public+/index.tsx => _public.index.tsx
  if (!index && hasPlus && routeSegments.at(-1)?.startsWith('_')) {
    routeSegments = routeSegments.slice(0, -1)
  }
  return routeSegments
}

const pathSeparatorRegex = /[\/\\.]/
function isPathSeparator(char: string) {
  return pathSeparatorRegex.test(char)
}

function defaultVisitFiles(dir: string, visitor: (file: string) => void, baseDir = dir) {
  for (const filename of fs.readdirSync(dir)) {
    const file = path.resolve(dir, filename)
    const stat = fs.statSync(file)

    if (stat.isDirectory()) {
      defaultVisitFiles(file, visitor, baseDir)
    } else if (stat.isFile()) {
      visitor(path.relative(baseDir, file))
    }
  }
}

const getRouteRegex = (RegexRequiresNestedDirReplacement: RegExp, nestedDirectoryChar: string): RegExp => {
  nestedDirectoryChar = nestedDirectoryChar.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')

  return new RegExp(
    RegexRequiresNestedDirReplacement.source.replace('\\${nestedDirectoryChar}', `[${nestedDirectoryChar}]`),
  )
}
