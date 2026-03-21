import { makeShadeScale } from '@/core/color/scales'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '@/core/color/semantic'
import { deriveDarkModeRoles } from '@/core/color/darkMode'
import { generateDataVizPalette } from '@/core/color/dataViz'
import type { ColorSlot } from '@/core/color/types'
import type { TypeScale } from '@/core/typography/types'
import type { TokenMap } from '@/core/export/types'

/**
 * Build the full token map from the current store state.
 * This runs synchronously on every state change via a Zustand subscription.
 * The resulting TokenMap is injected into :root CSS custom properties.
 */
export function buildTokenMap(
  slots: ColorSlot[],
  scale: TypeScale | null,
  pairing: { heading: string; body: string } | null,
  dataVizN: number,
): TokenMap {
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}

  const brandSlot = slots.find(s => s.role === 'brand') ?? slots[0]
  const brandHex = brandSlot?.hex ?? '#888888'

  // Shade scales for all slots
  for (const slot of slots) {
    const shadeScale = makeShadeScale(slot.hex)
    for (const [step, value] of Object.entries(shadeScale)) {
      light[`--color-${slot.role}-${step}`] = value
    }
  }

  // Brand-derived semantic roles (light)
  const brandScale = makeShadeScale(brandHex)
  const brandRoles = deriveBrandRoles(brandScale)
  for (const [k, v] of Object.entries(brandRoles)) {
    light[`--color-${k}`] = v
  }

  // Neutral roles (light)
  const neutralRoles = deriveNeutralRoles(brandScale)
  for (const [k, v] of Object.entries(neutralRoles)) {
    light[`--color-${k}`] = v
  }

  // State/mood roles (light)
  const stateMoodRoles = deriveStateMoodRoles(brandHex)
  for (const [k, v] of Object.entries(stateMoodRoles)) {
    light[`--color-${k}`] = v
  }

  // Dark mode equivalents
  const darkBrandRoles = deriveDarkModeRoles(brandScale)
  for (const [k, v] of Object.entries(darkBrandRoles)) {
    dark[`--color-${k}`] = v
  }

  // Data viz palette
  const dvColors = generateDataVizPalette(brandHex, dataVizN)
  dvColors.forEach((hex, i) => {
    light[`--color-dataviz-${i + 1}`] = hex
  })

  // Typography tokens
  if (pairing) {
    light['--font-heading'] = `"${pairing.heading}", serif`
    light['--font-body'] = `"${pairing.body}", sans-serif`
  }

  if (scale) {
    for (const [stepName, step] of Object.entries(scale)) {
      if (stepName.startsWith('_')) continue
      const s = step as { size: number; weight: number; lineHeight: number; letterSpacing: string }
      light[`--font-size-${stepName}`] = `${s.size}px`
      light[`--font-weight-${stepName}`] = String(s.weight)
      light[`--line-height-${stepName}`] = String(s.lineHeight)
      light[`--letter-spacing-${stepName}`] = s.letterSpacing
    }
  }

  return { light, dark }
}

/**
 * Inject CSS custom properties into :root and [data-theme="dark"].
 * Call this after every state change.
 */
export function injectTokensToDOM(tokens: TokenMap): void {
  const root = document.documentElement
  for (const [key, value] of Object.entries(tokens.light)) {
    root.style.setProperty(key, value)
  }
  // For dark tokens, we inject them into a <style> tag that targets [data-theme="dark"]
  // so they apply when the theme is toggled without needing JS per-property
  let styleEl = document.getElementById('palette-dark-tokens') as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'palette-dark-tokens'
    document.head.appendChild(styleEl)
  }
  const darkRules = Object.entries(tokens.dark)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  styleEl.textContent = `[data-theme="dark"] {\n${darkRules}\n}`
}
