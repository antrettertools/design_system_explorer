import { useColor } from '@/store'
import { getWcagContrastRatio } from '@/core/color/scales'
import styles from './FontColorsSection.module.css'

const FONT_ROLES = [
  {
    token: '--color-on-surface',
    label: 'on-surface',
    specimen: 'The quick brown fox jumps over the lazy dog',
    bgToken: '--color-background',
  },
  {
    token: '--color-on-surface-subtle',
    label: 'on-surface-subtle',
    specimen: 'Supporting detail text appears like this',
    bgToken: '--color-background',
  },
  {
    token: '--color-interactive',
    label: 'interactive (link)',
    specimen: 'Click here to learn more →',
    bgToken: '--color-background',
  },
  {
    token: '--color-on-interactive',
    label: 'on-interactive',
    specimen: 'Text on primary button',
    bgToken: '--color-interactive',
  },
]

function resolveToken(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || '#888888'
}

export function FontColorsSection() {
  useColor()

  const rows = FONT_ROLES.map(role => {
    const fgHex = resolveToken(role.token)
    const bgHex = resolveToken(role.bgToken)
    const ratio = getWcagContrastRatio(fgHex, bgHex)
    const passAA = ratio >= 4.5
    return { ...role, fgHex, bgHex, ratio, passAA }
  })

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>Font Colors</div>
      <div className={styles.rows}>
        {rows.map(({ token, label, specimen, fgHex, bgHex, ratio, passAA }) => (
          <div
            key={token}
            className={styles.row}
            style={{ background: bgHex }}
          >
            <div className={styles.dot} style={{ background: fgHex }} />
            <div className={styles.meta}>
              <div className={styles.tokenLabel}>{label}</div>
              <div className={styles.specimen} style={{ color: fgHex }}>
                {specimen}
              </div>
            </div>
            <div className={`${styles.badge} ${passAA ? styles.badgePass : styles.badgeFail}`}>
              AA {passAA ? '✓' : '✗'} {ratio.toFixed(1)}:1
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
