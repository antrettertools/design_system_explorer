import type { ReactNode } from 'react'
import styles from './PreviewCard.module.css'

interface PreviewCardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function PreviewCard({ title, children, className }: PreviewCardProps) {
  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.content}>{children}</div>
    </div>
  )
}
