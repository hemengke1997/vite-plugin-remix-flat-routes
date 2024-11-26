import { createContainer } from 'context-state'
import { useKeepAlive } from 'vite-plugin-remix-flat-routes/client'

function useGlobalContext() {
  const { destroyAll } = useKeepAlive()

  return {
    destroyAll,
  }
}

export const GlobalContext = createContainer(useGlobalContext)
