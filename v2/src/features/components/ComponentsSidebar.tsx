import { DEFAULT_COMPONENT_TOKENS } from '@/core/components/defaults'
import styles from './ComponentsSidebar.module.css'

interface ComponentsSidebarProps {
  selected: string
  onSelect: (key: string) => void
}

export function ComponentsSidebar({ selected, onSelect }: ComponentsSidebarProps) {
  const components = Object.keys(DEFAULT_COMPONENT_TOKENS)
  return (
    <div className={styles.sidebar}>
      <div className={styles.label}>Components</div>
      {components.map(key => (
        <button
          key={key}
          className={`${styles.item} ${selected === key ? styles.itemActive : ''}`}
          onClick={() => onSelect(key)}
        >
          {key.replace(/-/g, ' ')}
        </button>
      ))}
    </div>
  )
}
