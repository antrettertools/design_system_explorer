import { useRef, useState } from 'react'
import { useColor, useColorActions } from '@/store'
import { ColorSlotCard } from './ColorSlotCard'
import styles from './ColorSwatches.module.css'

export function ColorSwatches() {
  const { slots } = useColor()
  const { reorderSlots } = useColorActions()
  const dragFrom = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDragStart = (id: string) => { dragFrom.current = id }
  const handleDragOver = (id: string) => { setDragOverId(id) }
  const handleDrop = () => {
    if (!dragFrom.current || dragOverId === null) return
    const fromIdx = slots.findIndex(s => s.id === dragFrom.current)
    const toIdx = slots.findIndex(s => s.id === dragOverId)
    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
      reorderSlots(fromIdx, toIdx)
    }
    dragFrom.current = null
    setDragOverId(null)
  }

  return (
    <div className={styles.grid}>
      {slots.map(slot => (
        <ColorSlotCard
          key={slot.id}
          slot={slot}
          canRemove={slots.length > 1}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  )
}
