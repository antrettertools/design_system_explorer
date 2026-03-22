import { useColor } from '@/store'
import { ROLE_LABELS } from '@/features/generator/ColorSwatches/ColorSlotCard'
import styles from './ContrastGrid.module.css'

interface ContrastPair {
  fgLabel: string
  bgLabel: string
  fgHex: string
  bgHex: string
}

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const bright = Math.max(l1, l2)
  const dark = Math.min(l1, l2)
  return (bright + 0.05) / (dark + 0.05)
}

function getWcagLevels(ratio: number): { aaBodyText: boolean; aaaBodyText: boolean } {
  return { aaBodyText: ratio >= 4.5, aaaBodyText: ratio >= 7 }
}

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

export function ContrastGrid() {
  const { slots } = useColor()

  const onSurface = getCssVar('--color-on-surface')
  const background = getCssVar('--color-background')
  const onInteractive = getCssVar('--color-on-interactive')
  const interactive = getCssVar('--color-interactive')
  const onSurfaceSubtle = getCssVar('--color-on-surface-subtle')
  const surface = getCssVar('--color-surface')

  const pairs: ContrastPair[] = [
    {
      fgLabel: 'on-surface / background',
      bgLabel: 'background',
      fgHex: onSurface,
      bgHex: background,
    },
    {
      fgLabel: 'on-interactive / interactive',
      bgLabel: 'interactive',
      fgHex: onInteractive,
      bgHex: interactive,
    },
    {
      fgLabel: 'interactive / background',
      bgLabel: 'background',
      fgHex: interactive,
      bgHex: background,
    },
    {
      fgLabel: 'on-surface-subtle / surface',
      bgLabel: 'surface',
      fgHex: onSurfaceSubtle,
      bgHex: surface,
    },
    ...slots.flatMap(slot =>
      slots
        .filter(s => s.id !== slot.id)
        .map(bg => ({
          fgLabel: `${slot.name ?? ROLE_LABELS[slot.role] ?? slot.role} / ${bg.name ?? ROLE_LABELS[bg.role] ?? bg.role}`,
          bgLabel: bg.name ?? ROLE_LABELS[bg.role] ?? bg.role,
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
          const ratio = contrastRatio(pair.fgHex, pair.bgHex)
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
