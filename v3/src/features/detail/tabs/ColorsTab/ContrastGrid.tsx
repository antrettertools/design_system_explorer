import { useColor } from '@/store'
import { getWcagContrastRatio, getWcagLevels, makeShadeScale } from '@/core/color/scales'
import { deriveBrandRoles, deriveNeutralRoles } from '@/core/color/semantic'
import styles from './ContrastGrid.module.css'

interface ContrastPair {
  fgLabel: string
  bgLabel: string
  fgHex: string
  bgHex: string
}

export function ContrastGrid() {
  const { slots } = useColor()
  const brandHex = slots.find(s => s.role === 'brand')?.hex ?? '#888'
  const brandScale = makeShadeScale(brandHex)
  const brandRoles = deriveBrandRoles(brandScale)
  const neutralRoles = deriveNeutralRoles(brandScale)

  const pairs: ContrastPair[] = [
    {
      fgLabel: 'on-surface / background',
      bgLabel: 'background',
      fgHex: neutralRoles['on-surface'],
      bgHex: neutralRoles['background'],
    },
    {
      fgLabel: 'on-interactive / interactive',
      bgLabel: 'interactive',
      fgHex: brandRoles['on-interactive'],
      bgHex: brandRoles['interactive'],
    },
    {
      fgLabel: 'interactive / background',
      bgLabel: 'background',
      fgHex: brandRoles['interactive'],
      bgHex: neutralRoles['background'],
    },
    {
      fgLabel: 'on-surface-subtle / surface',
      bgLabel: 'surface',
      fgHex: neutralRoles['on-surface-subtle'],
      bgHex: neutralRoles['surface'],
    },
    ...slots.flatMap(slot =>
      slots
        .filter(s => s.id !== slot.id)
        .map(bg => ({
          fgLabel: `${slot.role} / ${bg.role}`,
          bgLabel: bg.role,
          fgHex: slot.hex,
          bgHex: bg.hex,
        })),
    ).slice(0, 4),
  ]

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Contrast — WCAG AA/AAA</div>
      <div className={styles.grid} role="list">
        {pairs.map((pair, i) => {
          const ratio = getWcagContrastRatio(pair.fgHex, pair.bgHex)
          const levels = getWcagLevels(ratio)
          return (
            <div
              key={i}
              className={styles.cell}
              style={{ background: pair.bgHex, color: pair.fgHex }}
              role="listitem"
            >
              <div className={styles.cellColors}>
                <div className={styles.swatch} style={{ background: pair.fgHex }} />
                <span className={styles.cellLabel}>{pair.fgLabel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${levels.aaBodyText ? styles.badgePass : styles.badgeFail}`}>AA</span>
                  {levels.aaaBodyText && <span className={`${styles.badge} ${styles.badgeAAA}`}>AAA</span>}
                </div>
                <span className={styles.ratio}>{ratio.toFixed(1)}:1</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
