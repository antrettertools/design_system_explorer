import { Lock, LockOpen } from 'lucide-react'
import { useColor, useColorActions } from '@/store'
import { ShadeScaleSection } from './ShadeScaleSection'
import { NeutralScaleSection } from './NeutralScaleSection'
import { GreyscaleSection } from './GreyscaleSection'
import { SemanticRolesSection } from './SemanticRolesSection'
import { FontColorsSection } from './FontColorsSection'
import { DataVizSection } from './DataVizSection'
import { ContrastGrid } from './ContrastGrid'
import styles from './ColorsTab.module.css'

function LockHintRow() {
  const { slots } = useColor()
  const { lockAllSlots, unlockAllSlots } = useColorActions()
  const lockedCount = slots.filter(s => s.locked).length
  const allLocked = lockedCount === slots.length
  const noneUnlocked = lockedCount === slots.length

  return (
    <div className={styles.lockHint}>
      <span className={styles.lockHintIcon}>
        {allLocked ? <Lock size={11} strokeWidth={2} /> : <LockOpen size={11} strokeWidth={2} />}
      </span>
      <span className={styles.lockHintText}>
        {allLocked
          ? `All ${slots.length} locked`
          : `${lockedCount} of ${slots.length} locked`
        }
        {' · '}
        <kbd className={styles.kbd}>SPACE</kbd>
        {' '}
        {noneUnlocked ? 'blocked — unlock to regenerate' : 'regenerates unlocked colors'}
      </span>
      <button
        className={styles.lockHintBtn}
        onClick={allLocked ? unlockAllSlots : lockAllSlots}
        title={allLocked ? 'Unlock all colors' : 'Lock all colors'}
      >
        {allLocked ? 'Unlock all' : 'Lock all'}
      </button>
    </div>
  )
}

export function ColorsTab() {
  return (
    <>
      <LockHintRow />
      <ShadeScaleSection />
      <NeutralScaleSection />
      <GreyscaleSection />
      <SemanticRolesSection />
      <FontColorsSection />
      <DataVizSection />
      <ContrastGrid />
    </>
  )
}
