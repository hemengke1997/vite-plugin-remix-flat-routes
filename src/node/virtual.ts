import type * as Vite from 'vite'

export const routesId = 'virtual:remix-flat-routes'

export const vmods = [routesId]

export const resolvedVirtualModuleId = (virtualModuleId: string) => `\0${virtualModuleId}`

export function invalidateVirtualModule(server: Vite.ViteDevServer, reload?: boolean) {
  const { moduleGraph, ws } = server

  vmods.forEach((vmod) => {
    const module = moduleGraph.getModuleById(resolvedVirtualModuleId(vmod))
    if (module) {
      moduleGraph.invalidateModule(module)
    }

    if (reload) {
      ws.send({
        type: 'full-reload',
        path: '*',
      })
    }
  })
}
