import { useState } from 'react'
import { useComponents, useComponentsActions, useStore } from '@/store'
import { deriveComponentTokens } from '@/core/components/tokens'
import type { ComponentName } from '@/core/components/types'
import styles from './ComponentTokenSection.module.css'

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
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Live button preview */}
                  {comp === 'button' && (
                    <div className={styles.componentPreview}>
                      <span className={styles.previewLabel}>Preview:</span>
                      <button
                        style={{
                          background: 'var(--component-button-bg)',
                          color: 'var(--component-button-text)',
                          border: '1px solid var(--component-button-border)',
                          borderRadius: 'var(--component-button-radius)',
                          boxShadow: 'var(--component-button-shadow)',
                          padding: '8px 16px',
                          fontSize: 'var(--font-size-body)',
                          fontFamily: 'var(--font-body)',
                          cursor: 'default',
                        }}
                      >
                        Button
                      </button>
                      <button
                        style={{
                          background: 'var(--component-button-bg-hover)',
                          color: 'var(--component-button-text)',
                          border: '1px solid var(--component-button-border)',
                          borderRadius: 'var(--component-button-radius)',
                          boxShadow: 'var(--component-button-shadow)',
                          padding: '8px 16px',
                          fontSize: 'var(--font-size-body)',
                          fontFamily: 'var(--font-body)',
                          cursor: 'default',
                        }}
                      >
                        Hover
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
