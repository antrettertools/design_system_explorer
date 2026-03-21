import { useColor } from '@/store'
import styles from './FontColorsSection.module.css'

function getLuminance(hex: string): number {
  const clean = hex.replace('#', '').padEnd(6, '0')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const srgb = [r, g, b].map(c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

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
  // Re-render on color changes
  useColor()

  const rows = FONT_ROLES.map(role => {
    const fgHex = resolveToken(role.token)
    const bgHex = resolveToken(role.bgToken)
    const ratio = contrastRatio(fgHex, bgHex)
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
