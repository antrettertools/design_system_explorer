import styles from './ComponentsTab.module.css'
import { ComponentTokenSection } from './ComponentTokenSection'
import { IconLibrarySection } from './IconLibrarySection'

export function ComponentsTab() {
  return (
    <div className={styles.tab}>
      <ComponentTokenSection />
      <IconLibrarySection />
    </div>
  )
}
