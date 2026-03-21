import type { ColorSlot } from '@/core/color/types'
import type { SpacingConfig } from '@/core/spacing/types'
import type { ComponentTokenMap } from './types'

/**
 * Derive component token sets from the current palette and spacing config.
 *
 * All values are CSS variable references (e.g. `var(--color-interactive)`),
 * not resolved hex values. This means the live preview automatically picks up
 * palette changes whenever :root CSS vars are updated by injectTokensToDOM().
 *
 * The function is purely functional — no React, no store — so it is fast to test.
 */
export function deriveComponentTokens(
  _slots: ColorSlot[],   // kept for future slot-count-aware logic
  spacing: SpacingConfig,
): ComponentTokenMap {
  const radiusMd = `var(--radius-md, ${spacing.radius.md}px)`
  const radiusLg = `var(--radius-lg, ${spacing.radius.lg}px)`
  const shadowMd = 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))'
  const shadowSm = 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.06))'

  return {
    button: {
      bg:       'var(--color-interactive)',
      bgHover:  'var(--color-interactive-hover)',
      text:     'var(--color-on-interactive)',
      border:   'transparent',
      radius:   radiusMd,
      shadow:   shadowSm,
    },
    input: {
      bg:            'var(--color-surface)',
      bgHover:       'var(--color-surface)',
      text:          'var(--color-text-primary)',
      border:        'var(--color-border)',
      focusBorder:   'var(--color-interactive)',
      placeholder:   'var(--color-text-muted)',
      radius:        radiusMd,
      shadow:        'none',
    },
    card: {
      bg:       'var(--color-surface)',
      bgHover:  'var(--color-surface-raised)',
      text:     'var(--color-text-primary)',
      border:   'var(--color-border)',
      radius:   radiusLg,
      shadow:   shadowMd,
      padding:  `var(--spacing-lg, ${spacing.scale.lg}px)`,
    },
    badge: {
      bg:       'var(--color-brand-100)',
      bgHover:  'var(--color-brand-200)',
      text:     'var(--color-brand-700)',
      border:   'transparent',
      radius:   'var(--radius-full, 9999px)',
      shadow:   'none',
    },
    tag: {
      bg:       'var(--color-neutral-100)',
      bgHover:  'var(--color-neutral-200)',
      text:     'var(--color-neutral-700)',
      border:   'var(--color-neutral-300)',
      radius:   'var(--radius-sm, 4px)',
      shadow:   'none',
    },
    tooltip: {
      bg:       'var(--color-neutral-900)',
      bgHover:  'var(--color-neutral-900)',
      text:     'var(--color-neutral-50)',
      border:   'transparent',
      radius:   'var(--radius-sm, 4px)',
      shadow:   shadowSm,
      padding:  `var(--spacing-xs, ${spacing.scale.xs}px) var(--spacing-sm, ${spacing.scale.sm}px)`,
    },
    alert: {
      bg:        'var(--color-info-subtle)',
      bgHover:   'var(--color-info-subtle)',
      text:      'var(--color-info)',
      border:    'var(--color-info)',
      radius:    radiusMd,
      shadow:    'none',
      iconColor: 'var(--color-info)',
    },
  }
}
