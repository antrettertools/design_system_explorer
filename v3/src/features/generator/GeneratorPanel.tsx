import { useColor, useColorActions } from '@/store'
import styles from './GeneratorPanel.module.css'
import { SpaceHintBar } from './SpaceHintBar'
import { ColorSwatches } from './ColorSwatches/ColorSwatches'
import { RecipePillRow } from './RecipePillRow/RecipePillRow'
import { TypographySpecimen } from './TypographySpecimen/TypographySpecimen'
import { TokenHints } from './TokenHints/TokenHints'
import { GeneratorFooter } from './GeneratorFooter/GeneratorFooter'
import { Lock, LockOpen } from 'lucide-react'

export function GeneratorPanel() {
  const { activeRecipe, slots } = useColor()
  const { lockAllSlots, unlockAllSlots } = useColorActions()
  const allColorsLocked = slots.length > 0 && slots.every(s => s.locked)

  return (
    <div className={styles.panel}>
      <SpaceHintBar />
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Colors</span>
            <button
              className={styles.sectionLockBtn}
              onClick={allColorsLocked ? unlockAllSlots : lockAllSlots}
              title={allColorsLocked ? 'Unlock all colors' : 'Lock all colors'}
              aria-label={allColorsLocked ? 'Unlock all colors' : 'Lock all colors'}
              aria-pressed={allColorsLocked}
            >
              {allColorsLocked
                ? <Lock size={12} strokeWidth={2.5} />
                : <LockOpen size={12} strokeWidth={2.5} />}
            </button>
          </div>
          <span className={styles.sectionResult}>{activeRecipe?.label ?? 'Random'}</span>
          <RecipePillRow />
          <ColorSwatches />
        </div>
        <div className={styles.section}>
          <TypographySpecimen />
        </div>
        {/* Zone C: Token Hints */}
        <TokenHints />
      </div>
      <GeneratorFooter />
    </div>
  )
}
