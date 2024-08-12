import type * as Vite from 'vite'

export const virtualModuleId = 'virtual:remix-flat-routes'
export const resolvedVirtualModuleId = `\0${virtualModuleId}`

export function invalidateVirtualModule(server: Vite.ViteDevServer, reload?: boolean) {
  const { moduleGraph, ws } = server
  const module = moduleGraph.getModuleById(resolvedVirtualModuleId)
  if (module) {
    moduleGraph.invalidateModule(module)
    if (reload) {
      ws.send({
        type: 'full-reload',
        path: '*',
      })
    }
    return module
  }
}
