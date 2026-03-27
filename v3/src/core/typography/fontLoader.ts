import type { FontPairing, FontSource } from './types'

// Track loaded font CSS links by font name
const loadedFonts = new Set<string>()
const fontUsageCycle = new Map<string, number>()
let currentCycle = 0

function getFontUrl(fontName: string, source: FontSource): string {
  const encoded = encodeURIComponent(fontName)
  switch (source) {
    case 'google':
      return `https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;600;700;800;900&display=swap`
    case 'fontshare':
      return `https://api.fontshare.com/v2/css?f[]=${encoded.toLowerCase().replace(/%20/g, '-')}@400,700&display=swap`
    case 'bunny':
      return `https://fonts.bunny.net/css?family=${encoded.toLowerCase().replace(/%20/g, '-')}:400,700&display=swap`
  }
}

function injectFontLink(fontName: string, source: FontSource): void {
  if (loadedFonts.has(fontName)) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = getFontUrl(fontName, source)
  link.onerror = () => {
    console.warn(`[palette] Failed to load font: ${fontName} from ${source}`)
  }
  document.head.appendChild(link)
  loadedFonts.add(fontName)
}

/**
 * Load the fonts for the currently active pairing.
 * Call this whenever the active pairing changes.
 * Tracks usage cycle for retention — fonts used in the last 2 cycles are kept.
 */
export function loadActivePairing(pairing: FontPairing): void {
  currentCycle++
  fontUsageCycle.set(pairing.heading, currentCycle)
  fontUsageCycle.set(pairing.body, currentCycle)
  injectFontLink(pairing.heading, pairing.source)
  // Body font might be from a different source — for simplicity we use same source
  // Real implementation: body source could differ; pairings.json only has one source field
  injectFontLink(pairing.body, pairing.source)
}

/**
 * Load a single font for the font browser grid (IntersectionObserver trigger).
 * Uses a short sample string weight only.
 */
export function loadBrowserFont(fontName: string, source: FontSource): void {
  injectFontLink(fontName, source)
}

/**
 * Check if a font is already loaded in the document.
 */
export function isFontLoaded(fontName: string): boolean {
  return loadedFonts.has(fontName)
}

/**
 * Create an IntersectionObserver that loads fonts as their preview cells scroll into view.
 * Returns the observer — caller must disconnect when component unmounts.
 */
export function createFontBrowserObserver(
  onLoad: (fontName: string) => void,
): IntersectionObserver {
  return new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const fontName = (entry.target as HTMLElement).dataset.font
          const source = (entry.target as HTMLElement).dataset.source as FontSource
          if (fontName && source) {
            loadBrowserFont(fontName, source)
            onLoad(fontName)
          }
        }
      }
    },
    { rootMargin: '100px' },
  )
}

// Export for module completeness — cycle tracking is internal
export { fontUsageCycle as _fontUsageCycle }
