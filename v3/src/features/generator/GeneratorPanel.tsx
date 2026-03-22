import { useColor } from '@/store'
import styles from './GeneratorPanel.module.css'
import { SpaceHintBar } from './SpaceHintBar'
import { ColorSwatches } from './ColorSwatches/ColorSwatches'
import { RecipePillRow } from './RecipePillRow/RecipePillRow'
import { TypographySpecimen } from './TypographySpecimen/TypographySpecimen'
import { GeneratorFooter } from './GeneratorFooter/GeneratorFooter'

export function GeneratorPanel() {
  const { activeRecipe } = useColor()

  return (
    <div className={styles.panel}>
      <SpaceHintBar />
      <div className={styles.content}>
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Colors</span>
          <span className={styles.sectionResult}>{activeRecipe?.label ?? 'Random'}</span>
          <RecipePillRow />
          <ColorSwatches />
        </div>
        <div className={styles.section}>
          <TypographySpecimen />
        </div>
      </div>
      <GeneratorFooter />
    </div>
  )
}
