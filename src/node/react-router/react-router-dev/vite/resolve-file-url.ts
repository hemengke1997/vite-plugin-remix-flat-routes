import * as path from 'node:path'
import { importViteEsmSync } from './import-vite-esm-sync'

export const resolveFileUrl = ({ rootDirectory }: { rootDirectory: string }, filePath: string) => {
  const vite = importViteEsmSync()
  const relativePath = path.relative(rootDirectory, filePath)
  const isWithinRoot = !relativePath.startsWith('..') && !path.isAbsolute(relativePath)

  if (!isWithinRoot) {
    // Vite will prevent serving files outside of the workspace
    // unless user explictly opts in with `server.fs.allow`
    // https://vitejs.dev/config/server-options.html#server-fs-allow
    return path.posix.join('/@fs', vite.normalizePath(filePath))
  }

  return `/${vite.normalizePath(relativePath)}`
}
