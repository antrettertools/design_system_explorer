import { useColor } from '@/store'
import { getWcagContrastRatio, getWcagLevels } from '@/core/color/scales'
import { POSITION_LABELS } from '@/core/color/types'
import styles from './ContrastGrid.module.css'

interface ContrastPair {
  fgLabel: string
  bgLabel: string
  fgHex: string
  bgHex: string
}

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

export function ContrastGrid() {
  const { slots } = useColor()

  // All unique ordered slot pairs, sorted by contrast ratio descending — shows the
  // most interesting brand-to-brand contrasts. Capped at 8 to keep the grid scannable.
  const allPairs: ContrastPair[] = slots.flatMap(slot =>
    slots
      .filter(s => s.id !== slot.id)
      .map(bg => ({
        fgLabel: slot.name ?? POSITION_LABELS[slot.role],
        bgLabel: bg.name ?? POSITION_LABELS[bg.role],
        fgHex: slot.hex,
        bgHex: bg.hex,
      })),
  )

  const pairs = allPairs
    .sort((a, b) => getWcagContrastRatio(b.fgHex, b.bgHex) - getWcagContrastRatio(a.fgHex, a.bgHex))
    .slice(0, 8)

  // Pad with the two most critical semantic pairs if we have fewer than 4 brand pairs
  if (pairs.length < 4) {
    const onSurface     = getCssVar('--color-on-surface')
    const background    = getCssVar('--color-background')
    const onInteractive = getCssVar('--color-on-interactive')
    const interactive   = getCssVar('--color-interactive')
    pairs.push(
      { fgLabel: 'on-surface', bgLabel: 'background', fgHex: onSurface, bgHex: background },
      { fgLabel: 'on-interactive', bgLabel: 'interactive', fgHex: onInteractive, bgHex: interactive },
    )
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Contrast — WCAG AA / AAA</div>
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
                <span className={styles.cellLabel}>{pair.fgLabel} / {pair.bgLabel}</span>
              </div>
              <div className={styles.cellRight}>
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
