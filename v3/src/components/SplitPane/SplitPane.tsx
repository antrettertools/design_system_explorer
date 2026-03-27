import { useRef, useState, useCallback, useEffect } from 'react'
import { useUI } from '@/store'
import styles from './SplitPane.module.css'

interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultLeftPercent?: number
}

export function SplitPane({ left, right, defaultLeftPercent = 50 }: SplitPaneProps) {
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { mobileShowPreview } = useUI()

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const pct = Math.min(Math.max((x / rect.width) * 100, 20), 80)
      setLeftPercent(pct)
    }
    const onMouseUp = () => setDragging(false)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging])

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        className={`${styles.left} ${mobileShowPreview ? styles.slideOut : ''}`}
        style={{ width: `${leftPercent}%` }}
      >
        {left}
      </div>
      <div
        className={`${styles.divider} ${dragging ? styles.dragging : ''}`}
        onMouseDown={onMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        tabIndex={0}
      />
      <div className={`${styles.right} ${mobileShowPreview ? styles.slideIn : ''}`}>
        {right}
      </div>
    </div>
  )
}
