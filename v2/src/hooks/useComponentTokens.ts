import { useMemo } from 'react'
import { useComponentTokens as useComponentTokensStore } from '@/store'
import { DEFAULT_COMPONENT_TOKENS } from '@/core/components/defaults'
import type { ComponentTokenMap } from '@/core/components/types'

export function useComponentTokens(): ComponentTokenMap {
  const store = useComponentTokensStore()
  return useMemo<ComponentTokenMap>(() => {
    const result: ComponentTokenMap = {}
    // Start with defaults
    for (const [key, tokens] of Object.entries(DEFAULT_COMPONENT_TOKENS)) {
      result[key] = { ...tokens }
    }
    // Apply store overrides
    for (const [key, overrides] of Object.entries(store.overrides)) {
      result[key] = { ...(result[key] ?? {}), ...overrides }
    }
    return result
  }, [store.overrides])
}
