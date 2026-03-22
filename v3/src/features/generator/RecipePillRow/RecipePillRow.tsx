import { useColor, useColorActions } from '@/store'
import type { PrimaryType } from '@/core/color/types'
import styles from './RecipePillRow.module.css'

const TYPE_PILLS: { type: PrimaryType; label: string }[] = [
  { type: 'triadic',       label: 'Triadic' },
  { type: 'analogous',     label: 'Analogous' },
  { type: 'complementary', label: 'Complement' },
  { type: 'split-comp',    label: 'Split-Comp' },
  { type: 'mono',          label: 'Mono' },
  { type: 'tetradic',      label: 'Tetradic' },
  { type: 'compound',      label: 'Compound' },
  { type: 'special',       label: 'Special' },
]

export function RecipePillRow() {
  const { pinnedPrimaryType, pinnedRecipeId } = useColor()
  const { pinPrimaryType } = useColorActions()

  const isUnpinned = pinnedPrimaryType === null && pinnedRecipeId === null

  return (
    <div className={styles.row} role="group" aria-label="Color harmony type">
      <button
        className={`${styles.pill} ${styles.accent} ${isUnpinned ? styles.active : ''}`}
        onClick={() => pinPrimaryType(null)}
        aria-pressed={isUnpinned}
      >
        Any
      </button>
      {TYPE_PILLS.map(({ type, label }) => (
        <button
          key={type}
          className={`${styles.pill} ${pinnedPrimaryType === type ? styles.active : ''}`}
          onClick={() => pinPrimaryType(pinnedPrimaryType === type ? null : type)}
          aria-pressed={pinnedPrimaryType === type}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
