import type { ColorSlot } from '@/core/color/types'
import type { SpacingConfig } from '@/core/spacing/types'
import type { ComponentTokenMap, ComponentTokenSet } from './types'

/**
 * Derive the full component token map from the current palette and spacing.
 *
 * All values are CSS variable references — no resolved hex values.
 * Slot-dependent variants (badge-secondary, tag-accent-a, etc.) are only
 * included when the corresponding palette slot exists in `slots`.
 */
export function deriveComponentTokens(
  slots: ColorSlot[],
  spacing: SpacingConfig,
): ComponentTokenMap {
  const hasSecondary = slots.some(s => s.role === 'secondary')
  const hasAccentA   = slots.some(s => s.role === 'accentA')
  const hasAccentB   = slots.some(s => s.role === 'accentB')

  const radiusSm   = `var(--radius-sm, ${spacing.radius.sm}px)`
  const radiusMd   = `var(--radius-md, ${spacing.radius.md}px)`
  const radiusLg   = `var(--radius-lg, ${spacing.radius.lg}px)`
  const radiusFull = 'var(--radius-full, 9999px)'
  const shadowNone = 'none'
  const shadowSm   = 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.06))'
  const shadowMd   = 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))'
  const paddingMd  = `var(--spacing-md, ${spacing.scale.md}px)`
  const paddingLg  = `var(--spacing-lg, ${spacing.scale.lg}px)`

  // ---- BUTTONS -------------------------------------------------------
  const button: ComponentTokenSet = {
    bg:      'var(--color-interactive)',
    bgHover: 'var(--color-interactive-hover)',
    text:    'var(--color-on-interactive)',
    border:  'transparent',
    radius:  radiusMd,
    shadow:  shadowSm,
  }

  const buttonSecondary: ComponentTokenSet = {
    bg:      'var(--color-surface)',
    bgHover: 'var(--color-surface-raised)',
    text:    'var(--color-on-surface)',
    border:  'var(--color-border)',
    radius:  radiusMd,
    shadow:  shadowNone,
  }

  const buttonGhost: ComponentTokenSet = {
    bg:      'transparent',
    bgHover: 'var(--color-interactive-subtle)',
    text:    'var(--color-interactive)',
    border:  'transparent',
    radius:  radiusMd,
    shadow:  shadowNone,
  }

  const buttonDestructive: ComponentTokenSet = {
    bg:      'var(--color-error)',
    bgHover: 'var(--color-error)',
    text:    'var(--color-on-surface)',
    border:  'transparent',
    radius:  radiusMd,
    shadow:  shadowSm,
  }

  // ---- INPUT ---------------------------------------------------------
  const input: ComponentTokenSet = {
    bg:          'var(--color-surface)',
    bgHover:     'var(--color-surface)',
    text:        'var(--color-on-surface)',
    border:      'var(--color-border)',
    focusBorder: 'var(--color-interactive)',
    placeholder: 'var(--color-on-surface-subtle)',
    radius:      radiusMd,
    shadow:      shadowNone,
  }

  // ---- CARD ----------------------------------------------------------
  const card: ComponentTokenSet = {
    bg:      'var(--color-surface)',
    bgHover: 'var(--color-surface-raised)',
    text:    'var(--color-on-surface)',
    border:  'var(--color-border)',
    radius:  radiusLg,
    shadow:  shadowMd,
    padding: paddingLg,
  }

  // ---- BADGES --------------------------------------------------------
  // Helper: build a badge token set from a shade scale name
  function badgeFromScale(scaleName: string): ComponentTokenSet {
    return {
      bg:      `var(--color-${scaleName}-100)`,
      bgHover: `var(--color-${scaleName}-200)`,
      text:    `var(--color-${scaleName}-700)`,
      border:  'transparent',
      radius:  radiusFull,
      shadow:  shadowNone,
    }
  }

  // Helper: build a badge token set from semantic state prefix
  function badgeFromState(prefix: string): ComponentTokenSet {
    return {
      bg:      `var(--color-${prefix}-container)`,
      bgHover: `var(--color-${prefix}-container)`,
      text:    `var(--color-${prefix})`,
      border:  'transparent',
      radius:  radiusFull,
      shadow:  shadowNone,
    }
  }

  const badge = badgeFromScale('brand')

  const badgeNeutral: ComponentTokenSet = {
    bg:      'var(--color-surface-raised)',
    bgHover: 'var(--color-border)',
    text:    'var(--color-on-surface-subtle)',
    border:  'var(--color-border)',
    radius:  radiusFull,
    shadow:  shadowNone,
  }

  // ---- TAGS ----------------------------------------------------------
  function tagFromScale(scaleName: string): ComponentTokenSet {
    return {
      bg:      `var(--color-${scaleName}-100)`,
      bgHover: `var(--color-${scaleName}-200)`,
      text:    `var(--color-${scaleName}-700)`,
      border:  `var(--color-${scaleName}-200)`,
      radius:  radiusSm,
      shadow:  shadowNone,
    }
  }

  const tag: ComponentTokenSet = {
    ...tagFromScale('brand'),
    radius: radiusSm,
  }

  const tagNeutral: ComponentTokenSet = {
    bg:      'var(--color-surface-raised)',
    bgHover: 'var(--color-border)',
    text:    'var(--color-on-surface)',
    border:  'var(--color-border)',
    radius:  radiusSm,
    shadow:  shadowNone,
  }

  // ---- TOOLTIP -------------------------------------------------------
  const tooltip: ComponentTokenSet = {
    bg:      'var(--color-on-surface)',
    bgHover: 'var(--color-on-surface)',
    text:    'var(--color-background)',
    border:  'transparent',
    radius:  radiusSm,
    shadow:  shadowSm,
    padding: `var(--spacing-xs, ${spacing.scale.xs}px) var(--spacing-sm, ${spacing.scale.sm}px)`,
  }

  const tooltipLight: ComponentTokenSet = {
    bg:      'var(--color-surface-raised)',
    bgHover: 'var(--color-surface-raised)',
    text:    'var(--color-on-surface)',
    border:  'var(--color-border)',
    radius:  radiusSm,
    shadow:  shadowMd,
    padding: `var(--spacing-xs, ${spacing.scale.xs}px) var(--spacing-sm, ${spacing.scale.sm}px)`,
  }

  // ---- ALERT ---------------------------------------------------------
  const alert: ComponentTokenSet = {
    bg:        'var(--color-info-container)',
    bgHover:   'var(--color-info-container)',
    text:      'var(--color-on-surface)',
    border:    'var(--color-info)',
    radius:    radiusMd,
    shadow:    shadowNone,
    iconColor: 'var(--color-info)',
    padding:   paddingMd,
  }

  // ---- ASSEMBLE ------------------------------------------------------
  const required = {
    'button':             button,
    'button-secondary':   buttonSecondary,
    'button-ghost':       buttonGhost,
    'button-destructive': buttonDestructive,
    'input':              input,
    'card':               card,
    'badge':              badge,
    'badge-neutral':      badgeNeutral,
    'badge-error':        badgeFromState('error'),
    'badge-warning':      badgeFromState('warning'),
    'badge-success':      badgeFromState('success'),
    'badge-info':         badgeFromState('info'),
    'tag':                tag,
    'tag-neutral':        tagNeutral,
    'tooltip':            tooltip,
    'tooltip-light':      tooltipLight,
    'alert':              alert,
  }

  const optional: Partial<ComponentTokenMap> = {}
  if (hasSecondary) {
    optional['badge-secondary'] = badgeFromScale('secondary')
    optional['tag-secondary']   = tagFromScale('secondary')
  }
  if (hasAccentA) {
    optional['badge-accent-a'] = badgeFromScale('accentA')
    optional['tag-accent-a']   = tagFromScale('accentA')
  }
  if (hasAccentB) {
    optional['badge-accent-b'] = badgeFromScale('accentB')
    optional['tag-accent-b']   = tagFromScale('accentB')
  }

  return { ...required, ...optional } as ComponentTokenMap
}
