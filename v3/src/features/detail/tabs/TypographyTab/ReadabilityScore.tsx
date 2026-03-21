import { APCAcontrast, sRGBtoY } from 'apca-w3'
import { useColor, useTypography } from '@/store'
import { makeShadeScale, getWcagContrastRatio } from '@/core/color/scales'
import { deriveNeutralRoles } from '@/core/color/semantic'
import styles from './ReadabilityScore.module.css'

function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function computeAPCA(fgHex: string, bgHex: string): number {
  const [fr, fg, fb] = hexToRGB(fgHex)
  const [br, bg, bb] = hexToRGB(bgHex)
  const fgY = sRGBtoY([fr, fg, fb])
  const bgY = sRGBtoY([br, bg, bb])
  return Math.abs(Number(APCAcontrast(fgY, bgY)))
}

function apcaGrade(score: number): { label: string; className: string } {
  if (score >= 75) return { label: 'Excellent', className: styles.gradeGood }
  if (score >= 60) return { label: 'Good', className: styles.gradeMedium }
  return { label: 'Low', className: styles.gradePoor }
}

export function ReadabilityScore() {
  const { slots } = useColor()
  const { pairing } = useTypography()
  const brandHex = slots.find(s => s.role === 'brand')?.hex ?? '#888'
  const brandScale = makeShadeScale(brandHex)
  const neutralRoles = deriveNeutralRoles(brandScale)
  const textHex = neutralRoles['on-surface']
  const bgHex = neutralRoles['background']

  const apcaScore = computeAPCA(textHex, bgHex)
  const grade = apcaGrade(apcaScore)
  const wcagRatio = getWcagContrastRatio(textHex, bgHex)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Readability — APCA Score</div>
      <div className={styles.card}>
        <div className={styles.scoreRow}>
          <div className={styles.score}>{apcaScore.toFixed(0)}</div>
          <div>
            <div className={styles.scoreLabel}>APCA Lc · body text on background</div>
            <span className={`${styles.grade} ${grade.className}`}>{grade.label}</span>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div className={styles.scoreLabel}>WCAG</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              {wcagRatio.toFixed(1)}:1
            </div>
          </div>
        </div>
        <div
          className={styles.sampleText}
          style={{ fontFamily: pairing ? `"${pairing.body}", sans-serif` : 'sans-serif' }}
        >
          Body text at 16px — The five boxing wizards jump quickly.
          How vexingly quick daft zebras jump. Pack my box with five dozen liquor jugs.
        </div>
      </div>
    </div>
  )
}
