import type { FontDefinition, FontAxes } from '../tokens/types'

const loadedFonts = new Set<string>(['DM Mono', 'Syne'])

/**
 * Loads a font dynamically by injecting a <link> element.
 * Returns immediately if already loaded.
 * Handles Google Fonts and Fontshare.
 */
export function loadFont(font: FontDefinition): void {
  if (loadedFonts.has(font.name)) return
  loadedFonts.add(font.name)

  let href: string

  if (font.source === 'google') {
    href = buildGoogleFontUrl(font.name, font.axes)
  } else if (font.source === 'fontshare') {
    href = buildFontshareUrl(font.name)
  } else {
    // System fonts need no loading
    return
  }

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Builds a Google Fonts v2 CSS URL.
 * For variable fonts, requests the full weight range.
 * For static fonts, requests a standard set of weights.
 */
function buildGoogleFontUrl(name: string, axes?: FontAxes): string {
  const family = name.replace(/ /g, '+')

  if (axes?.wght) {
    const { min, max } = axes.wght
    // Request both normal and italic variable range
    return `https://fonts.googleapis.com/css2?family=${family}:ital,wght@0,${min}..${max};1,${min}..${max}&display=swap`
  }

  // Static font: request common weights
  return `https://fonts.googleapis.com/css2?family=${family}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`
}

/**
 * Builds a Fontshare CSS URL.
 */
function buildFontshareUrl(name: string): string {
  const slug = name.toLowerCase().replace(/ /g, '-')
  return `https://api.fontshare.com/v2/css?f[]=${slug}@400,500,700,300&display=swap`
}

/**
 * Builds the CSS font-family stack for a given font.
 */
export function buildFontFamilyStack(font: FontDefinition): string {
  const fallback =
    font.category === 'mono'
      ? "'Cascadia Code', 'Fira Code', monospace"
      : font.category === 'serif'
        ? 'Georgia, serif'
        : 'system-ui, sans-serif'

  return `'${font.name}', ${fallback}`
}

/**
 * Builds the font-variation-settings CSS value for a variable font,
 * given the current axis values.
 */
export function buildVariationSettings(
  font: FontDefinition,
  currentWeight: number,
  extraAxes: Record<string, number>,
): string | undefined {
  if (!font.variable || !font.axes) return undefined

  const settings = Object.entries(font.axes).map(([tag, range]) => {
    const value = tag === 'wght' ? currentWeight : (extraAxes[tag] ?? range?.default ?? 400)
    return `'${tag}' ${value}`
  })

  return settings.join(', ')
}

/**
 * Checks whether a font name is already loaded.
 */
export function isFontLoaded(name: string): boolean {
  return loadedFonts.has(name)
}
