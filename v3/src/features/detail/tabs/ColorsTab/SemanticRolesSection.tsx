import { useColor, useColorTokens } from '@/store'
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

const STATE_PREFIXES = ['error', 'warning', 'success', 'info'] as const

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

export function SemanticRolesSection() {
  // Subscribe to color changes for reactivity
  useColor()
  const tokenMap = useColorTokens()

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

      {/* State/mood roles */}
      <div className={styles.subsectionTitle} style={{ marginTop: 16 }}>State & Mood</div>
      <div className={styles.stateGrid}>
        {STATE_PREFIXES.map(prefix => {
          const baseHex = getCssVar(`--color-${prefix}`)
          const containerHex = getCssVar(`--color-${prefix}-container`)
          return (
            <div key={prefix} className={styles.stateCard}>
              <div className={styles.statePair}>
                <div className={styles.stateSwatch} style={{ background: baseHex }} title={`${prefix}: ${baseHex}`} />
                <div className={styles.stateSwatch} style={{ background: containerHex }} title={`${prefix}-container: ${containerHex}`} />
              </div>
              <div className={styles.stateLabel}>{prefix}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
