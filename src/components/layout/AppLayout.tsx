import type { ReactNode } from 'react'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  sidebar: ReactNode
  preview: ReactNode
}

export function AppLayout({ sidebar, preview }: AppLayoutProps) {
  return (
    <main className={styles.main}>
      <aside className={styles.sidebar}>{sidebar}</aside>
      <div className={styles.preview}>{preview}</div>
    </main>
  )
}

// ── Sidebar building blocks ────────────────────────────────────

export function SidebarSection({ title }: { title: string }) {
  return <div className={styles.sectionHeader}>{title}</div>
}

export function ControlGroup({ children }: { children: ReactNode }) {
  return <div className={styles.controlGroup}>{children}</div>
}

export function ControlLabel({
  children,
  value,
}: {
  children: ReactNode
  value?: string | number
}) {
  return (
    <div className={styles.controlLabel}>
      <span>{children}</span>
      {value !== undefined && <span className={styles.controlValue}>{value}</span>}
    </div>
  )
}
