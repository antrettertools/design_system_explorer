import { useEffect } from 'react'
import { loadFont, buildFontFamilyStack, buildVariationSettings } from '@/core/typography/fontLoader'
import { getFontByName } from '@/core/typography/fontDatabase'
import { useTypography } from '@/store'

/**
 * Ensures both the heading and body fonts are loaded and returns CSS
 * strings for each. Also exposes backward-compat properties pointing
 * to the body font for components that haven't been migrated yet.
 */
export function useFont() {
  const typography = useTypography()
  const headingFont = getFontByName(typography.headingFamily)
  const bodyFont = getFontByName(typography.bodyFamily)

  useEffect(() => {
    if (headingFont) loadFont(headingFont)
  }, [headingFont])

  useEffect(() => {
    if (bodyFont) loadFont(bodyFont)
  }, [bodyFont])

  const headingStack = headingFont
    ? buildFontFamilyStack(headingFont)
    : `'${typography.headingFamily}', serif`
  const bodyStack = bodyFont
    ? buildFontFamilyStack(bodyFont)
    : `'${typography.bodyFamily}', sans-serif`

  const headingVariation = headingFont
    ? buildVariationSettings(headingFont, typography.headingWeight, typography.headingExtraAxes)
    : undefined
  const bodyVariation = bodyFont
    ? buildVariationSettings(bodyFont, typography.bodyWeight, typography.bodyExtraAxes)
    : undefined

  return {
    heading: {
      fontFamilyStack: headingStack,
      variationSettings: headingVariation,
      font: headingFont,
    },
    body: {
      fontFamilyStack: bodyStack,
      variationSettings: bodyVariation,
      font: bodyFont,
    },
    // Backward-compat: points to body
    fontFamilyStack: bodyStack,
    variationSettings: bodyVariation,
    font: bodyFont,
  }
}

/**
 * Load an arbitrary font by name (for previews, pairings, grids, etc.)
 */
export function useLoadFont(fontName: string): void {
  useEffect(() => {
    const font = getFontByName(fontName)
    if (font) loadFont(font)
  }, [fontName])
}
