import React, { useState, useRef } from 'react'
import { useComponents, useComponentsActions, useStore } from '@/store'
import { deriveComponentTokens } from '@/core/components/tokens'
import type { ComponentName } from '@/core/components/types'
import { ComponentPreview } from './ComponentPreview'
import { ColorPickerPopover } from '@/components/ui/ColorPickerPopover/ColorPickerPopover'
import styles from './ComponentTokenSection.module.css'

const COLOR_KEYS = new Set(['bg', 'bgHover', 'text', 'border', 'focusBorder', 'placeholder', 'iconColor'])

function isColorKey(key: string): boolean {
  return COLOR_KEYS.has(key)
}

const COMPONENT_ORDER: ComponentName[] = ['button', 'input', 'card', 'badge', 'tag', 'tooltip', 'alert']

const TOKEN_LABELS: Record<string, string> = {
  bg: 'Background',
  bgHover: 'Background hover',
  text: 'Text color',
  border: 'Border color',
  focusBorder: 'Focus border',
  placeholder: 'Placeholder',
  radius: 'Border radius',
  shadow: 'Shadow',
  padding: 'Padding',
  iconColor: 'Icon color',
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
          const tokenSet = derived[comp]
          const compOverrides = overrides[comp] ?? {}
          const overrideCount = Object.keys(compOverrides).length

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  {overrideCount > 0 && (
                    <span className={styles.overrideCount}>{overrideCount} overridden</span>
                  )}
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
                </div>
              </div>

              {isOpen && (
                <div className={styles.accordionBody}>
                  <div className={styles.tokenTable}>
                    {Object.entries(tokenSet).map(([key, autoValue]) => {
                      const isOverridden = key in compOverrides
                      const currentValue = isOverridden
                        ? (compOverrides as Record<string, string>)[key]
                        : autoValue

                      const pickerId = `${comp}-${key}`
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
                                aria-label={`Edit ${comp} ${key} color`}
                              />
                            )}
                            <input
                              className={styles.tokenInput}
                              type="text"
                              value={currentValue}
                              onChange={(e) => overrideComponentToken(comp, key, e.target.value)}
                              aria-label={`${comp} ${key}`}
                            />
                            {isOverridden && (
                              <button
                                className={styles.resetBtn}
                                onClick={() => resetComponentToken(comp, key)}
                                title="Reset to auto"
                                aria-label={`Reset ${comp} ${key}`}
                              >
                                ↺
                              </button>
                            )}
                            {openPicker === pickerId && (
                              <ColorPickerPopover
                                hex={currentValue.startsWith('#') ? currentValue : '#888888'}
                                onChange={(hex) => overrideComponentToken(comp, key, hex)}
                                onClose={() => setOpenPicker(null)}
                                anchorRef={{ current: swatchRefs.current[pickerId] } as React.RefObject<HTMLElement>}
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

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
