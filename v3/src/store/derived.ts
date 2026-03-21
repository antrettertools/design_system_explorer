import { makeShadeScale } from '@/core/color/scales'
import { deriveBrandRoles, deriveStateMoodRoles, deriveNeutralRoles } from '@/core/color/semantic'
import { deriveDarkModeRoles } from '@/core/color/darkMode'
import { generateDataVizPalette } from '@/core/color/dataViz'
import { deriveComponentTokens } from '@/core/components/tokens'
import type { ColorSlot } from '@/core/color/types'
import type { TypeScale } from '@/core/typography/types'
import type { TokenMap } from '@/core/export/types'
import type { ComponentName, ComponentTokenMap } from '@/core/components/types'
import type { SpacingState } from './spacing'
import type { EffectsState } from './effects'

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
  spacing?: SpacingState,
  effects?: EffectsState,
  opts?: {
    componentOverrides?: Partial<ComponentTokenMap>
  },
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

  // SPACING TOKENS
  if (spacing) {
    const effectiveScale = { ...spacing.config.scale, ...spacing.overrides }
    for (const [step, value] of Object.entries(effectiveScale)) {
      light[`--spacing-${step}`] = `${value}px`
    }

    const radius = spacing.config.radius
    for (const [step, value] of Object.entries(radius)) {
      light[`--radius-${step}`] = step === 'full' ? '9999px' : `${value}px`
    }

    for (const [step, value] of Object.entries(spacing.config.iconSizes)) {
      light[`--icon-size-${step}`] = `${value}px`
    }

    for (const [step, value] of Object.entries(spacing.config.zIndex)) {
      light[`--z-${step}`] = String(value)
    }

    for (const [name, value] of Object.entries(spacing.config.breakpoints)) {
      light[`--breakpoint-${name}`] = `${value}px`
    }

    spacing.config.borderWidths.forEach((w, i) => {
      light[`--border-width-${i + 1}`] = `${w}px`
    })
  }

  // EFFECTS TOKENS
  if (effects) {
    const baseShadows = effects.shadowMode === 'colored'
      ? effects.config.shadows
      : effects.config.shadowsNeutral
    const shadows = { ...baseShadows, ...effects.shadowOverrides }
    for (const [step, value] of Object.entries(shadows)) {
      light[`--shadow-${step}`] = value
    }

    const { focusRing } = effects.config
    light['--focus-ring-width'] = focusRing.width
    light['--focus-ring-color'] = focusRing.color
    light['--focus-ring-offset'] = focusRing.offset

    const { motion } = effects.config
    for (const [name, value] of Object.entries(motion.easings)) {
      light[`--ease-${name}`] = value
    }
    for (const [step, value] of Object.entries(motion.durations)) {
      light[`--duration-${step}`] = `${value}ms`
    }
    for (const [step, value] of Object.entries(motion.transitions)) {
      light[`--transition-${step}`] = value
    }
  }

  // COMPONENT TOKENS
  // All values are CSS variable references — they point to semantic tokens already
  // injected above, so they automatically react to palette changes.
  if (spacing) {
    const componentTokens = deriveComponentTokens(slots, spacing.config)
    const finalComponents: ComponentTokenMap = { ...componentTokens }

    if (opts?.componentOverrides) {
      for (const [comp, overrideSet] of Object.entries(opts.componentOverrides)) {
        finalComponents[comp as ComponentName] = {
          ...finalComponents[comp as ComponentName],
          ...overrideSet,
        }
      }
    }

    for (const [comp, tokenSet] of Object.entries(finalComponents)) {
      for (const [key, value] of Object.entries(tokenSet)) {
        // camelCase → kebab-case: bgHover → bg-hover
        const kebabKey = key.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`)
        light[`--component-${comp}-${kebabKey}`] = value
        // Component tokens reference semantic vars which already flip in dark mode
        dark[`--component-${comp}-${kebabKey}`] = value
      }
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
