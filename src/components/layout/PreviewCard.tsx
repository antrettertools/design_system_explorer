import type { ReactNode } from 'react'
import styles from './PreviewCard.module.css'

interface PreviewCardProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function PreviewCard({ title, subtitle, children }: PreviewCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>
        {title}
        {subtitle && <span className={styles.titleSub}>{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}
