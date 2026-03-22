import { useRef, useState } from 'react'
import { useColor, useColorActions, useColorTokens } from '@/store'
import type { StateColorPrefix } from '@/store/color'
import { ColorPickerPopover } from '@/components/ui/ColorPickerPopover/ColorPickerPopover'
import styles from './SemanticRolesSection.module.css'

const BRAND_ROLES = [
  'interactive',
  'on-interactive',
  'interactive-container',
  'on-interactive-container',
  'interactive-subtle',
  'interactive-hover',
] as const

const NEUTRAL_ROLES = [
  'background',
  'surface',
  'surface-raised',
  'on-surface',
  'on-surface-subtle',
  'border',
  'border-strong',
] as const

const STATE_PREFIXES: StateColorPrefix[] = ['error', 'warning', 'success', 'info']

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

export function SemanticRolesSection() {
  useColor()
  const tokenMap = useColorTokens()
  const { stateOverrides } = useColor()
  const { setStateColor, resetStateColor } = useColorActions()
  const [openPicker, setOpenPicker] = useState<StateColorPrefix | null>(null)
  const swatchRefs = useRef<Record<string, HTMLDivElement | null>>({})

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Semantic Roles</div>

      {/* Brand-derived roles */}
      <div className={styles.subsectionTitle}>Brand</div>
      <div className={styles.rolesGrid}>
        {BRAND_ROLES.map(role => {
          const hex = getCssVar(`--color-${role}`)
          return (
            <div key={role} className={styles.roleCard}>
              <div className={styles.roleColorBar} style={{ background: hex }} />
              <div className={styles.roleMeta}>
                <div className={styles.roleName}>{role}</div>
                <div className={styles.roleHex}>{hex.toUpperCase()}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Neutral roles with light/dark comparison */}
      <div className={styles.subsectionTitle}>Neutral</div>
      {NEUTRAL_ROLES.map(role => {
        const lightHex = getCssVar(`--color-${role}`)
        const darkHex = tokenMap.dark[`--color-${role}`] ?? '#888'
        return (
          <div key={role} className={styles.pairedRow}>
            <div className={styles.pairedSwatch} style={{ background: lightHex }} title={`Light: ${lightHex}`} />
            <div>
              <span className={styles.pairedLabel}>{role}</span>
              <span className={styles.pairedHex}>{lightHex.toUpperCase()}</span>
            </div>
            <div className={styles.darkColumn}>
              <span className={styles.themeBadge}>dark</span>
              <div className={styles.pairedSwatch} style={{ background: darkHex }} title={`Dark: ${darkHex}`} />
              <span className={styles.pairedHex}>{darkHex.toUpperCase()}</span>
            </div>
          </div>
        )
      })}

      {/* State/mood roles — editable */}
      <div className={`${styles.subsectionTitle} ${styles.subsectionTitleSpaced}`}>State & Mood</div>
      <div className={styles.stateGrid}>
        {STATE_PREFIXES.map(prefix => {
          const baseHex = getCssVar(`--color-${prefix}`)
          const containerHex = getCssVar(`--color-${prefix}-container`)
          const isOverridden = prefix in stateOverrides
          return (
            <div key={prefix} className={`${styles.stateCard} ${isOverridden ? styles.stateCardOverridden : ''}`}>
              <div className={styles.statePair}>
                <div
                  ref={el => { swatchRefs.current[prefix] = el }}
                  className={styles.stateSwatch}
                  style={{ background: baseHex, cursor: 'pointer' }}
                  onClick={() => setOpenPicker(openPicker === prefix ? null : prefix)}
                  title={`Edit ${prefix} color`}
                />
                <div className={styles.stateSwatch} style={{ background: containerHex }} title={`${prefix}-container`} />
              </div>
              <div className={styles.stateFooter}>
                <span className={styles.stateLabel}>{prefix}</span>
                {isOverridden && (
                  <button
                    className={styles.stateResetBtn}
                    onClick={() => resetStateColor(prefix)}
                    title="Reset to auto-derived"
                    aria-label={`Reset ${prefix} color`}
                  >
                    ↺
                  </button>
                )}
              </div>
              {openPicker === prefix && (
                <ColorPickerPopover
                  hex={baseHex}
                  onChange={hex => setStateColor(prefix, hex)}
                  onClose={() => setOpenPicker(null)}
                  anchorRef={{ current: swatchRefs.current[prefix] } as React.RefObject<HTMLElement>}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
