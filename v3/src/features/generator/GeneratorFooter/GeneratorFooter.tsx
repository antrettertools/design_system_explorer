import { useColor, useColorActions, useUIActions, useTypographyActions } from '@/store'
import styles from './GeneratorFooter.module.css'

export function GeneratorFooter() {
  const { slots } = useColor()
  const { addSlot } = useColorActions()
  const { setMode } = useUIActions()
  const colorActions = useColorActions()
  const typographyActions = useTypographyActions()

  const handleGenerate = () => {
    colorActions.generate()
    typographyActions.generate(undefined)
  }

  return (
    <div className={styles.footer}>
      <span className={styles.hint}>
        Press <kbd>SPACE</kbd> to generate
      </span>
      <div className={styles.actions}>
        <button
          className={styles.vibeChip}
          disabled
          title="Coming soon \u2014 vibe-based generation (Phase 4)"
          aria-disabled="true"
        >
          \u2726 vibe
        </button>
        <button
          className={styles.addBtn}
          onClick={addSlot}
          disabled={slots.length >= 8}
          aria-label="Add color slot"
        >
          + Add color
        </button>
        <button
          className={styles.detailBtn}
          onClick={() => setMode('detail')}
          aria-label="Enter detail mode"
        >
          Detail Mode \u2192
        </button>
      </div>
      <button
        className={styles.generateMobile}
        onClick={handleGenerate}
        aria-label="Generate new palette"
      >
        Generate \u2726
      </button>
    </div>
  )
}
