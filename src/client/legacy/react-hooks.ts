import { useEffect, useLayoutEffect } from 'react'

export function useIsomorphicLayoutEffect(cb: React.EffectCallback, deps?: React.DependencyList | undefined): void {
  const isomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
  isomorphicLayoutEffect(cb, deps)
}
