import { type PluginContext } from '@node/types'
import { parse as esModuleLexer } from 'es-module-lexer'
import fs from 'node:fs'
import path from 'node:path'
import { resolveFileUrl } from './resolve-file-url'

export const getRouteModuleExports = async (
  ctx: PluginContext,
  routeFile: string,
  readRouteFile?: () => string | Promise<string>,
): Promise<string[]> => {
  const { viteChildCompiler } = ctx
  if (!viteChildCompiler) {
    throw new Error('Vite child compiler not found')
  }

  // We transform the route module code with the Vite child compiler so that we
  // can parse the exports from non-JS files like MDX. This ensures that we can
  // understand the exports from anything that Vite can compile to JS, not just
  // the route file formats that the Remix compiler historically supported.

  const ssr = true
  const { pluginContainer, moduleGraph } = viteChildCompiler

  const routePath = path.resolve(ctx.remixOptions.appDirectory, routeFile)
  const url = resolveFileUrl(ctx, routePath)

  const resolveId = async () => {
    const result = await pluginContainer.resolveId(url, undefined, { ssr })
    if (!result) throw new Error(`Could not resolve module ID for ${url}`)
    return result.id
  }

  const [id, code] = await Promise.all([
    resolveId(),
    readRouteFile?.() ?? fs.promises.readFile(routePath, 'utf-8'),
    // pluginContainer.transform(...) fails if we don't do this first:
    moduleGraph.ensureEntryFromUrl(url, ssr),
  ])

  const transformed = await pluginContainer.transform(code, id, { ssr })
  const [, exports] = esModuleLexer(transformed.code)
  const exportNames = exports.map((e) => e.n)

  return exportNames
}

export const getRouteManifestModuleExports = async (ctx: PluginContext): Promise<Record<string, string[]>> => {
  const entries = await Promise.all(
    Object.entries(ctx.routeManifest).map(async ([key, route]) => {
      const sourceExports = await getRouteModuleExports(ctx, route.file)
      return [key, sourceExports] as const
    }),
  )
  return Object.fromEntries(entries)
}
