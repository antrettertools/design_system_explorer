import { usePrimitiveTokens } from './usePrimitiveTokens'
import { useSemanticTokens } from './useSemanticTokens'
import { useComponentTokens } from './useComponentTokens'
import { usePersonality, useTypography, useExport } from '@/store'
import type { ExportInput } from '@/core/export/plugin'

export function useAllTokens(): ExportInput {
  const primitive = usePrimitiveTokens()
  const semantic = useSemanticTokens()
  const component = useComponentTokens()
  const personality = usePersonality()
  const typography = useTypography()
  const exportStore = useExport()

  const headingFont = typography.headingFamily ?? 'Inter'
  const bodyFont = typography.bodyFamily ?? 'Inter'

  return {
    primitive,
    semantic,
    component,
    meta: {
      archetype: personality.archetype ?? 'professional',
      lockedColors: personality.locked.filter(Boolean) as string[],
      fontPairing: { heading: headingFont, body: bodyFont },
    },
    config: exportStore.config,
  }
}
