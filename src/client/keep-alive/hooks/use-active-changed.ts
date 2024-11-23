import { useLocation } from 'react-router-dom'
import { useEventListener } from './use-event-listener'

export function useActiveChanged(callback: (active: boolean) => void) {
  const { pathname: activePathname } = useLocation()

  useEventListener({
    on: {
      modeChange: ({ pathname, mode }) => {
        if (pathname === activePathname) {
          const active = mode === 'visible'
          callback(active)
        }
      },
    },
  })
}
