import React, { useState, useRef } from 'react'
import { useComponents, useComponentsActions, useStore } from '@/store'
import { deriveComponentTokens } from '@/core/components/tokens'
import type { ComponentName, ComponentVariantKey } from '@/core/components/types'
import { ComponentPreview } from './ComponentPreview'
import { ColorPickerPopover } from '@/components/ui/ColorPickerPopover/ColorPickerPopover'
import styles from './ComponentTokenSection.module.css'

const COLOR_KEYS = new Set(['bg', 'bgHover', 'text', 'border', 'focusBorder', 'placeholder', 'iconColor'])

function isColorKey(key: string): boolean {
  return COLOR_KEYS.has(key)
}

const COMPONENT_ORDER: ComponentName[] = ['button', 'input', 'card', 'badge', 'tag', 'tooltip', 'alert']

// Maps each component family to its variant keys (required order)
const BASE_VARIANTS: Record<ComponentName, ComponentVariantKey[]> = {
  button:  ['button', 'button-secondary', 'button-ghost', 'button-destructive'],
  input:   ['input'],
  card:    ['card'],
  badge:   ['badge', 'badge-neutral', 'badge-error', 'badge-warning', 'badge-success', 'badge-info'],
  tag:     ['tag', 'tag-neutral'],
  tooltip: ['tooltip', 'tooltip-light'],
  alert:   ['alert'],
}

// Slot-dependent variants added per family when the slot exists
const SLOT_VARIANTS: Record<ComponentName, { role: string; key: ComponentVariantKey }[]> = {
  button:  [],
  input:   [],
  card:    [],
  badge:   [
    { role: 'secondary', key: 'badge-secondary' },
    { role: 'accentA',   key: 'badge-accent-a' },
    { role: 'accentB',   key: 'badge-accent-b' },
  ],
  tag:     [
    { role: 'secondary', key: 'tag-secondary' },
    { role: 'accentA',   key: 'tag-accent-a' },
    { role: 'accentB',   key: 'tag-accent-b' },
  ],
  tooltip: [],
  alert:   [],
}

// Human-readable labels for each variant key
const VARIANT_LABELS: Record<ComponentVariantKey, string> = {
  'button':             'Primary',
  'button-secondary':   'Secondary',
  'button-ghost':       'Ghost',
  'button-destructive': 'Destructive',
  'input':              'Default',
  'card':               'Default',
  'badge':              'Brand',
  'badge-neutral':      'Neutral',
  'badge-secondary':    'Secondary',
  'badge-accent-a':     'Accent A',
  'badge-accent-b':     'Accent B',
  'badge-error':        'Error',
  'badge-warning':      'Warning',
  'badge-success':      'Success',
  'badge-info':         'Info',
  'tag':                'Brand',
  'tag-neutral':        'Neutral',
  'tag-secondary':      'Secondary',
  'tag-accent-a':       'Accent A',
  'tag-accent-b':       'Accent B',
  'tooltip':            'Dark',
  'tooltip-light':      'Light',
  'alert':              'Default',
}

const TOKEN_LABELS: Record<string, string> = {
  bg:          'Background',
  bgHover:     'Background hover',
  text:        'Text color',
  border:      'Border color',
  focusBorder: 'Focus border',
  placeholder: 'Placeholder',
  radius:      'Border radius',
  shadow:      'Shadow',
  padding:     'Padding',
  iconColor:   'Icon color',
}

export function ComponentTokenSection() {
  const { overrides } = useComponents()
  const { overrideComponentToken, resetComponentToken } = useComponentsActions()
  const slots = useStore((s) => s.color.slots)
  const spacing = useStore((s) => s.spacing)
  const [expanded, setExpanded] = useState<ComponentName | null>('button')
  const [openPicker, setOpenPicker] = useState<string | null>(null)
  const swatchRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const derived = deriveComponentTokens(slots, spacing.config)

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Component Tokens</h2>
      <p className={styles.description}>
        Token values are CSS variable references that automatically reflect your current palette.
        Override any token to set a fixed value.
      </p>
      <div className={styles.accordionList}>
        {COMPONENT_ORDER.map((comp) => {
          const isOpen = expanded === comp

          // Compute the full list of variant keys for this component
          const slotRoles = new Set(slots.map(s => s.role))
          const slotVariants = SLOT_VARIANTS[comp]
            .filter(sv => slotRoles.has(sv.role as never))
            .map(sv => sv.key)
          const variantKeys: ComponentVariantKey[] = [...BASE_VARIANTS[comp], ...slotVariants]

          // Total override count across all variants
          const overrideCount = variantKeys.reduce((sum, vk) => {
            return sum + Object.keys(overrides[vk] ?? {}).length
          }, 0)

          return (
            <div key={comp} className={styles.accordion}>
              <div
                className={styles.accordionHeader}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : comp)}
                onKeyDown={(e) => e.key === 'Enter' && setExpanded(isOpen ? null : comp)}
              >
                <span className={styles.accordionLabel}>{comp}</span>
                <div className={styles.accordionMeta}>
                  {overrideCount > 0 && (
                    <span className={styles.overrideCount}>{overrideCount} overridden</span>
                  )}
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
                </div>
              </div>

              {isOpen && (
                <div className={styles.accordionBody}>
                  {variantKeys.map((variantKey) => {
                    const tokenSet = derived[variantKey]
                    if (!tokenSet) return null
                    const compOverrides = overrides[variantKey] ?? {}

                    return (
                      <div key={variantKey} className={styles.variantSection}>
                        {variantKeys.length > 1 && (
                          <div className={styles.variantHeader}>
                            {VARIANT_LABELS[variantKey] ?? variantKey}
                          </div>
                        )}
                        <div className={styles.tokenTable}>
                          {Object.entries(tokenSet).map(([key, autoValue]) => {
                            const isOverridden = key in compOverrides
                            const currentValue = isOverridden
                              ? (compOverrides as Record<string, string>)[key]
                              : autoValue

                            const pickerId = `${variantKey}-${key}`
                            return (
                              <div key={key} className={styles.tokenRow}>
                                <div className={styles.tokenKey}>
                                  {TOKEN_LABELS[key] ?? key}
                                </div>
                                <div className={styles.tokenValue}>
                                  {isOverridden ? (
                                    <span className={styles.overriddenPill}>overridden</span>
                                  ) : (
                                    <span className={styles.autoPill}>auto</span>
                                  )}
                                  {isColorKey(key) && (
                                    <div
                                      className={styles.tokenColorSwatch}
                                      style={{ background: currentValue }}
                                      ref={(el) => { swatchRefs.current[pickerId] = el }}
                                      onClick={() => setOpenPicker(openPicker === pickerId ? null : pickerId)}
                                      title="Click to edit color"
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) => e.key === 'Enter' && setOpenPicker(openPicker === pickerId ? null : pickerId)}
                                      aria-label={`Edit ${variantKey} ${key} color`}
                                    />
                                  )}
                                  <input
                                    className={styles.tokenInput}
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) => overrideComponentToken(variantKey, key, e.target.value)}
                                    aria-label={`${variantKey} ${key}`}
                                  />
                                  {isOverridden && (
                                    <button
                                      className={styles.resetBtn}
                                      onClick={() => resetComponentToken(variantKey, key)}
                                      title="Reset to auto"
                                      aria-label={`Reset ${variantKey} ${key}`}
                                    >
                                      ↺
                                    </button>
                                  )}
                                  {openPicker === pickerId && (
                                    <ColorPickerPopover
                                      hex={currentValue.startsWith('#') ? currentValue : '#888888'}
                                      onChange={(hex) => overrideComponentToken(variantKey, key, hex)}
                                      onClose={() => setOpenPicker(null)}
                                      anchorRef={{ current: swatchRefs.current[pickerId] } as React.RefObject<HTMLElement>}
                                    />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  <div className={styles.previewWrapper}>
                    <span className={styles.previewLabel}>Preview</span>
                    <ComponentPreview componentName={comp} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
