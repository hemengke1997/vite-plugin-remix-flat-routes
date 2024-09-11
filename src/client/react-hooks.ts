import { useEffect, useLayoutEffect, useRef } from 'react'

export function useIsomorphicLayoutEffectOnce(cb: React.EffectCallback, deps?: React.DependencyList | undefined): void {
  const isomorphicLayoutEffect = typeof window === 'undefined' ? useEffectOnce : useLayoutEffectOnce
  isomorphicLayoutEffect(cb, deps)
}

export function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value

  return ref
}

type EffectHookType = typeof useEffect | typeof useLayoutEffect

const createUpdateEffect: (hook: EffectHookType) => EffectHookType = (hook) => (effect, deps) => {
  const isMounted = useRef(false)

  // for react-refresh
  hook(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  hook(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      return effect()
    }
  }, deps)
}

export const useUpdateEffect = createUpdateEffect(useEffect)

export function useEffectOnce(cb: React.EffectCallback, deps?: React.DependencyList | undefined): void {
  const mountRef = useRef(false)
  useEffect(() => {
    let returnValue
    if (mountRef.current === false) {
      returnValue = cb()
      mountRef.current = true
    }
    return returnValue
  }, [deps])
}

export function useLayoutEffectOnce(cb: React.EffectCallback, deps?: React.DependencyList | undefined): void {
  const mountRef = useRef(false)
  useLayoutEffect(() => {
    let returnValue
    if (mountRef.current === false) {
      returnValue = cb()
      mountRef.current = true
    }
    return returnValue
  }, [deps])
}
