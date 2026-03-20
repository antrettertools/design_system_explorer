import { useMemo } from 'react'
import { useColor, useSemanticOverrides } from '@/store'
import { deriveSemanticTokens } from '@/core/color/semantic-roles'
import type { SemanticTokens } from '@/core/tokens/types'

export function useSemanticTokens(): SemanticTokens {
  const color = useColor()
  const overrides = useSemanticOverrides()
  return useMemo<SemanticTokens>(() => {
    const derived = deriveSemanticTokens(
      color.primaryHex, color.secondaryHex, color.accentHexes, color.harmonyModel,
    )
    // Apply overrides
    const result = { ...derived }
    for (const [role, hex] of Object.entries(overrides.light)) {
      if (hex) result[role as keyof SemanticTokens] = { ...result[role as keyof SemanticTokens], light: hex }
    }
    for (const [role, hex] of Object.entries(overrides.dark)) {
      if (hex) result[role as keyof SemanticTokens] = { ...result[role as keyof SemanticTokens], dark: hex }
    }
    return result
  }, [color, overrides])
}
