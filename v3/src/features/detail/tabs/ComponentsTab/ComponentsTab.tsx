import { lazy, Suspense } from 'react'
import styles from './ComponentsTab.module.css'
import { ComponentsSummaryCard } from './ComponentsSummaryCard'
import { ComponentTokenSection } from './ComponentTokenSection'

// All four icon libraries (~300–500 kB) are only loaded when this tab is first
// opened. React.lazy defers the chunk until the Suspense boundary activates.
const IconLibrarySection = lazy(() =>
  import('./IconLibrarySection').then(m => ({ default: m.IconLibrarySection })),
)

export function ComponentsTab() {
  return (
    <div className={styles.tab}>
      <ComponentsSummaryCard />
      <ComponentTokenSection />
      <Suspense fallback={<div className={styles.iconLoading}>Loading icon libraries…</div>}>
        <IconLibrarySection />
      </Suspense>
    </div>
  )
}
