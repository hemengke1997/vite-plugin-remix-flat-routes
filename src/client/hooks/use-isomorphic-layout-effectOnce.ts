import { useEffect, useLayoutEffect, useRef } from 'react'

export type EffectHookType = typeof useEffect | typeof useLayoutEffect

function creatEffectOnce(hook: EffectHookType) {
  return (cb: React.EffectCallback, deps?: React.DependencyList | undefined): void => {
    const mountRef = useRef(false)
    hook(() => {
      let returnValue: any
      if (mountRef.current === false) {
        returnValue = cb()
        mountRef.current = true
      }
      return returnValue
    }, [deps])
  }
}

export function useIsomorphicLayoutEffectOnce(cb: React.EffectCallback, deps?: React.DependencyList | undefined): void {
  const isomorphicLayoutEffect =
    typeof window === 'undefined' ? creatEffectOnce(useEffect) : creatEffectOnce(useLayoutEffect)
  isomorphicLayoutEffect(cb, deps)
}
