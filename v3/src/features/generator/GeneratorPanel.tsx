import styles from './GeneratorPanel.module.css'
import { ColorSwatches } from './ColorSwatches/ColorSwatches'
import { HarmonyHint } from './HarmonyHint'
import { TypographySpecimen } from './TypographySpecimen/TypographySpecimen'
import { GeneratorFooter } from './GeneratorFooter/GeneratorFooter'

export function GeneratorPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        <ColorSwatches />
        <HarmonyHint />
        <TypographySpecimen />
      </div>
      <GeneratorFooter />
    </div>
  )
}
