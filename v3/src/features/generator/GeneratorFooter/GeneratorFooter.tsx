import { useColor, useColorActions, useUIActions, useTypographyActions } from '@/store'
import { ArrowRight, Sparkles, Plus } from 'lucide-react'
import styles from './GeneratorFooter.module.css'

export function GeneratorFooter() {
  const { slots } = useColor()
  const { addSlot } = useColorActions()
  const { setMode, showMobilePreview } = useUIActions()
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
          title="Coming soon — vibe-based generation (Phase 4)"
          aria-disabled="true"
        >
          <Sparkles size={12} strokeWidth={1.75} />
          vibe
        </button>
        <button
          className={styles.addBtn}
          onClick={addSlot}
          disabled={slots.length >= 8}
          aria-label="Add color slot"
        >
          <Plus size={13} strokeWidth={2} />
          Add color
        </button>
        <button
          className={styles.detailBtn}
          onClick={() => setMode('detail')}
          aria-label="Enter detail mode"
        >
          Detail Mode
          <ArrowRight size={13} strokeWidth={2} />
        </button>
      </div>
      <button
        className={styles.previewBtn}
        onClick={showMobilePreview}
        aria-label="Show live preview"
      >
        Preview
        <ArrowRight size={13} strokeWidth={2} />
      </button>
      <button
        className={styles.generateMobile}
        onClick={handleGenerate}
        aria-label="Generate new palette"
      >
        Generate
        <Sparkles size={14} strokeWidth={1.75} />
      </button>
    </div>
  )
}
