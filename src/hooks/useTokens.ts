import { useMemo } from 'react'
import { useTypography, useColor, useSpacing, useShadow } from '@/store'
import { makeShadeScale } from '@/core/color/scales'
import { makeNeutralScale } from '@/core/color/neutral'
import { deriveStateColors } from '@/core/color/semantic'
import { deriveSubBrandColor } from '@/core/color/harmony'
import { generateDataVizPalette } from '@/core/color/dataViz'
import { generateTypeScale } from '@/core/typography/scale'
import { generateSpacingScale, generateRadiusScale, DEFAULT_Z_INDEX, DEFAULT_BREAKPOINTS } from '@/core/spacing/scale'
import { buildElevationScale } from '@/core/shadow/presets'
import type { DesignTokens, BrandColor, SubBrandColor, ShadeScale } from '@/core/tokens/types'

/**
 * Computes the complete DesignTokens object from the current store state.
 * This is the central derived-data hook — all rendering and export
 * should call this hook rather than computing tokens independently.
 *
 * Memoized: only recomputes when relevant state slices change.
 */
export function useTokens(): DesignTokens {
  const typography = useTypography()
  const color = useColor()
  const spacing = useSpacing()
  const shadow = useShadow()

  return useMemo<DesignTokens>(() => {
    // ── Brand colors ──────────────────────────────────────────
    const primaryScale = makeShadeScale(color.primaryHex)
    const secondaryScale = makeShadeScale(color.secondaryHex)

    const primaryBrand: BrandColor = {
      name: color.primaryName,
      hex: color.primaryHex,
      scale: primaryScale,
    }

    const secondaryBrand: BrandColor = {
      name: color.secondaryName,
      hex: color.secondaryHex,
      scale: secondaryScale,
    }

    // ── Sub-brand colors ───────────────────────────────────────
    const subBrandColors: SubBrandColor[] = color.subBrand.map((slot, i) => {
      let hex: string

      if (slot.mode === 'manual') {
        hex = slot.manualHex
      } else if (slot.mode === 'auto-harmony') {
        hex = deriveSubBrandColor(
          color.primaryHex,
          color.secondaryHex,
          color.harmonyModel,
          i,
        )
      } else {
        // auto-secondary: derive from secondary using complementary offset
        hex = deriveSubBrandColor(
          color.secondaryHex,
          color.primaryHex,
          color.harmonyModel,
          i,
        )
      }

      return {
        name: slot.name,
        hex,
        scale: makeShadeScale(hex),
        mode: slot.mode,
      }
    })

    // ── State colors ───────────────────────────────────────────
    const allPaletteHexes = [
      color.primaryHex,
      color.secondaryHex,
      ...subBrandColors.map((s) => s.hex),
    ]

    const stateColors = color.stateColorsLocked
      ? color.stateColors
      : deriveStateColors(allPaletteHexes)

    const stateScales = {
      success: makeShadeScale(stateColors.success),
      warning: makeShadeScale(stateColors.warning),
      error: makeShadeScale(stateColors.error),
      info: makeShadeScale(stateColors.info),
    } as Record<keyof typeof stateColors, ShadeScale>

    // ── Neutral ────────────────────────────────────────────────
    const neutralScale = makeNeutralScale(color.primaryHex, color.neutralTint)

    // ── Data viz palette ───────────────────────────────────────
    const reservedHexes = [color.primaryHex, color.secondaryHex, ...subBrandColors.map((s) => s.hex)]
    const dataVizPalette = generateDataVizPalette({
      count: color.dataVizCount,
      primaryHex: color.primaryHex,
      reservedHexes,
      chromaTarget: color.dataVizChroma,
    })

    // ── Typography ─────────────────────────────────────────────
    const typeScale = generateTypeScale(
      typography.fontSize,
      typography.scaleAlgorithm,
      typography.modularRatio,
    )

    // ── Spacing ────────────────────────────────────────────────
    const spacingScale = generateSpacingScale(spacing.base, spacing.algorithm)
    const radiusScale = generateRadiusScale(spacing.radiusBase, spacing.radiusScale)

    // ── Shadows ────────────────────────────────────────────────
    const elevation = buildElevationScale(shadow.base)

    return {
      primaryBrand,
      secondaryBrand,
      subBrandColors,
      dataVizPalette,
      stateColors,
      stateScales,
      neutral: { tint: color.neutralTint, scale: neutralScale },
      fontFamily: typography.fontFamily,
      fontCategory: typography.fontCategory,
      fontWeight: typography.fontWeight,
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      typeScale,
      spacingBase: spacing.base,
      spacingScale,
      radiusScale,
      zIndexScale: DEFAULT_Z_INDEX,
      breakpoints: DEFAULT_BREAKPOINTS,
      elevation,
    }
  }, [typography, color, spacing, shadow])
}
