import { useEffect } from 'react'
import { loadFont, buildFontFamilyStack, buildVariationSettings } from '@/core/typography/fontLoader'
import { getFontByName } from '@/core/typography/fontDatabase'
import { useTypography } from '@/store'

/**
 * Ensures the current font is loaded and returns CSS strings for it.
 */
export function useFont() {
  const typography = useTypography()
  const font = getFontByName(typography.fontFamily)

  useEffect(() => {
    if (font) loadFont(font)
  }, [font])

  if (!font) {
    return {
      fontFamilyStack: typography.fontFamily,
      variationSettings: undefined,
      font: undefined,
    }
  }

  return {
    fontFamilyStack: buildFontFamilyStack(font),
    variationSettings: buildVariationSettings(font, typography.fontWeight, typography.extraAxes),
    font,
  }
}

/**
 * Load an arbitrary font by name (for previews, pairings, etc.)
 */
export function useLoadFont(fontName: string): void {
  useEffect(() => {
    const font = getFontByName(fontName)
    if (font) loadFont(font)
  }, [fontName])
}
