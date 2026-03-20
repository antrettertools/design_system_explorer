import { useState } from 'react'
import { ComponentsSidebar } from './ComponentsSidebar'
import { ComponentTokenMap } from './ComponentTokenMap'
import { DEFAULT_COMPONENT_TOKENS } from '@/core/components/defaults'
import styles from './ComponentsPanel.module.css'

export function ComponentsPanel() {
  const [selected, setSelected] = useState(Object.keys(DEFAULT_COMPONENT_TOKENS)[0])

  return (
    <div className={styles.panel}>
      <div className={styles.sideNav}>
        <ComponentsSidebar selected={selected} onSelect={setSelected} />
      </div>
      <div className={styles.content}>
        <div className={styles.preview}>
          <div className={styles.previewLabel}>Preview</div>
          <div className={styles.previewArea}>
            <ComponentPreview componentKey={selected} />
          </div>
        </div>
        <ComponentTokenMap componentKey={selected} />
      </div>
    </div>
  )
}

function ComponentPreview({ componentKey }: { componentKey: string }) {
  const cssKey = componentKey.replace(/-/g, '_')

  return (
    <div className={styles.previewContent}>
      {componentKey.startsWith('button') && (
        <div className={styles.buttonRow}>
          <button className={`${styles.demoBtn} ${(styles as Record<string, string>)[cssKey] ?? ''}`}>
            {componentKey.replace('button-', '').replace(/-/g, ' ')} button
          </button>
          <button className={`${styles.demoBtn} ${(styles as Record<string, string>)[cssKey] ?? ''}`} disabled>
            disabled
          </button>
        </div>
      )}
      {componentKey === 'input' && (
        <input className={styles.demoInput} placeholder="Input field" />
      )}
      {componentKey === 'card' && (
        <div className={styles.demoCard}>Card component</div>
      )}
      {componentKey.startsWith('badge') && (
        <span className={`${styles.demoBadge} ${(styles as Record<string, string>)[cssKey] ?? ''}`}>
          {componentKey.replace('badge-', '')} badge
        </span>
      )}
      {!componentKey.startsWith('button') &&
        !['input', 'card'].includes(componentKey) &&
        !componentKey.startsWith('badge') && (
          <div className={styles.previewPlaceholder}>{componentKey}</div>
        )}
    </div>
  )
}
