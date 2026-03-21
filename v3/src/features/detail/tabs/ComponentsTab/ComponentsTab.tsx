import { ComponentTokenSection } from './ComponentTokenSection'
import { IconLibrarySection } from './IconLibrarySection'

export function ComponentsTab() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xl)',
        padding: 'var(--spacing-lg)',
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      <ComponentTokenSection />
      <IconLibrarySection />
    </div>
  )
}
