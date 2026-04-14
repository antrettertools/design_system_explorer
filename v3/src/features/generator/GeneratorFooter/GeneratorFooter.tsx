import { useColorActions, useUIActions, useTypographyActions } from '@/store'
import { ArrowRight, Sparkles } from 'lucide-react'
import styles from './GeneratorFooter.module.css'

export function GeneratorFooter() {
  const { setMode, showMobilePreview } = useUIActions()
  const colorActions = useColorActions()
  const typographyActions = useTypographyActions()

  const handleGenerate = () => {
    colorActions.generate()
    typographyActions.generate(undefined)
  }

  return (
    <div className={styles.footer}>
      {/* Desktop: full-width CTA strip */}
      <button
        className={styles.detailStrip}
        onClick={() => setMode('detail')}
        aria-label="Explore your design system in detail"
      >
        <span className={styles.detailStripText}>Explore your design system</span>
        <ArrowRight size={14} strokeWidth={2} className={styles.detailStripArrow} />
      </button>

      {/* Mobile only: unchanged */}
      <button className={styles.previewBtn} onClick={showMobilePreview} aria-label="Show live preview">
        Preview
        <ArrowRight size={13} strokeWidth={2} />
      </button>
      <button className={styles.generateMobile} onClick={handleGenerate} aria-label="Generate new palette">
        Generate
        <Sparkles size={14} strokeWidth={1.75} />
      </button>
    </div>
  )
}
