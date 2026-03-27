import { useMemo } from 'react'
import { useColor } from '@/store'
import { makeShadeScale } from '@/core/color/scales'
import { makeNeutralScale } from '@/core/color/neutral'
import { generateDataVizPalette } from '@/core/color/dataViz'
import { hexToOklch } from '@/core/color/semantic-roles'
import type { PrimitiveTokens } from '@/core/tokens/types'

export function usePrimitiveTokens(): PrimitiveTokens {
  const color = useColor()
  return useMemo<PrimitiveTokens>(() => {
    const primaryOklch = hexToOklch(color.primaryHex)
    const primary = { color: { hex: color.primaryHex, name: 'Primary', oklch: primaryOklch }, scale: makeShadeScale(color.primaryHex) }
    const secondary = color.secondaryHex
      ? { color: { hex: color.secondaryHex, name: 'Secondary', oklch: hexToOklch(color.secondaryHex) }, scale: makeShadeScale(color.secondaryHex) }
      : null
    const accents = color.accentHexes.map((hex, i) => ({
      color: { hex, name: `Accent ${i + 1}`, oklch: hexToOklch(hex) },
      scale: makeShadeScale(hex),
    }))
    const neutral = makeNeutralScale(color.primaryHex, color.neutralTint)
    const reservedHexes = [color.primaryHex, ...(color.secondaryHex ? [color.secondaryHex] : []), ...color.accentHexes]
    const dataViz = generateDataVizPalette({ count: color.dataVizCount, primaryHex: color.primaryHex, reservedHexes, chromaTarget: color.dataVizChroma })
    return { primary, secondary, accents, neutral, dataViz }
  }, [color])
}
