import styles from './ComponentsTab.module.css'
import { ComponentsSummaryCard } from './ComponentsSummaryCard'
import { ComponentTokenSection } from './ComponentTokenSection'
import { IconLibrarySection } from './IconLibrarySection'

export function ComponentsTab() {
  return (
    <div className={styles.tab}>
      <ComponentsSummaryCard />
      <ComponentTokenSection />
      <IconLibrarySection />
    </div>
  )
}
