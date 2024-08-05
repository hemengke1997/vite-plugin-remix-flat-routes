type Vite = typeof import('vite')
let vite: Vite | undefined

export async function preloadViteEsm(): Promise<void> {
  vite = await import('vite')
}

export function importViteEsmSync(): Vite {
  return vite as Vite
}
