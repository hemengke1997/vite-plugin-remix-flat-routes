import { useEffect, useLayoutEffect, useRef } from 'react'

export function useEffectOnce(cb: React.EffectCallback, deps?: React.DependencyList | undefined): void {
  const mountRef = useRef(false)
  useIsomorphicLayoutEffect(() => {
    if (mountRef.current === false) {
      cb()
      mountRef.current = true
    }
  }, [deps])
}

export function useOnce(cb: () => void): void {
  const mountRef = useRef(false)
  if (mountRef.current === false) {
    cb()
    mountRef.current = true
  }
}

export function useIsomorphicLayoutEffect(cb: React.EffectCallback, deps?: React.DependencyList | undefined): void {
  const isomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
  isomorphicLayoutEffect(cb, deps)
}
