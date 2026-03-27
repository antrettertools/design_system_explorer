import { Lock, LockOpen } from 'lucide-react'
import { useTypography, useTypographyActions } from '@/store'
import styles from './FontPairCard.module.css'

const RATIO_PRESETS = [
  { label: '1.125', value: 1.125, name: 'Minor 2nd' },
  { label: '1.250', value: 1.25,  name: 'Major 2nd' },
  { label: '1.333', value: 1.333, name: 'Perfect 4th' },
  { label: '1.414', value: 1.414, name: 'Aug 4th' },
  { label: '1.500', value: 1.5,   name: 'Perfect 5th' },
]

function ratioName(ratio: number): string {
  const match = RATIO_PRESETS.find(p => Math.abs(p.value - ratio) < 0.001)
  return match ? match.name : `${ratio.toFixed(3)} custom`
}

export function FontPairCard() {
  const { pairing, scale, locks } = useTypography()
  const typographyActions = useTypographyActions()

  if (!pairing || !scale) return null

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Selected Fonts</div>

      <div className={styles.card}>
        {/* Heading font row */}
        <div className={styles.fontRow}>
          <div className={styles.fontMeta}>
            <span className={styles.fontRole}>Heading</span>
            <span className={styles.fontName}>{pairing.heading}</span>
          </div>
          <div
            className={styles.specimen}
            style={{ fontFamily: `"${pairing.heading}", serif` }}
          >
            Aa Bb Cc — The quick brown fox
          </div>
          <button
            className={`${styles.lockBtn} ${locks.heading ? styles.lockBtnActive : ''}`}
            onClick={() => typographyActions.toggleLock('heading')}
            title={locks.heading ? 'Unlock heading font' : 'Lock heading font'}
            aria-label={locks.heading ? 'Unlock heading font' : 'Lock heading font'}
          >
            {locks.heading ? <Lock size={13} /> : <LockOpen size={13} />}
          </button>
        </div>

        <div className={styles.divider} />

        {/* Body font row */}
        <div className={styles.fontRow}>
          <div className={styles.fontMeta}>
            <span className={styles.fontRole}>Body</span>
            <span className={styles.fontName}>{pairing.body}</span>
          </div>
          <div
            className={styles.specimen}
            style={{ fontFamily: `"${pairing.body}", sans-serif`, fontWeight: 400 }}
          >
            How vexingly quick daft zebras jump. Pack my box.
          </div>
          <button
            className={`${styles.lockBtn} ${locks.body ? styles.lockBtnActive : ''}`}
            onClick={() => typographyActions.toggleLock('body')}
            title={locks.body ? 'Unlock body font' : 'Lock body font'}
            aria-label={locks.body ? 'Unlock body font' : 'Lock body font'}
          >
            {locks.body ? <Lock size={13} /> : <LockOpen size={13} />}
          </button>
        </div>

        <div className={styles.divider} />

        {/* Scale ratio row */}
        <div className={styles.ratioRow}>
          <div className={styles.fontMeta}>
            <span className={styles.fontRole}>Scale ratio</span>
            <span className={styles.fontName}>{ratioName(scale._ratio)}</span>
          </div>
          <span className={styles.ratioValue}>{scale._ratio.toFixed(3)}</span>
          <button
            className={`${styles.lockBtn} ${locks.scale ? styles.lockBtnActive : ''}`}
            onClick={() => typographyActions.toggleLock('scale')}
            title={locks.scale ? 'Unlock scale ratio' : 'Lock scale ratio'}
            aria-label={locks.scale ? 'Unlock scale ratio' : 'Lock scale ratio'}
          >
            {locks.scale ? <Lock size={13} /> : <LockOpen size={13} />}
          </button>
        </div>
      </div>
    </div>
  )
}
