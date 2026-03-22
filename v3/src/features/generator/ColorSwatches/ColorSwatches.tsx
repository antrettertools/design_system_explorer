import { useRef, useState } from 'react'
import { useColor, useColorActions } from '@/store'
import { POSITION_LABELS } from '@/core/color/types'
import { ColorSlotCard } from './ColorSlotCard'
import styles from './ColorSwatches.module.css'

export function ColorSwatches() {
  const { slots } = useColor()
  const { reorderSlots, addSlot } = useColorActions()
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

  const canAdd = slots.length < 8

  return (
    <div className={styles.grid}>
      {slots.map((slot, index) => (
        <div key={slot.id} className={styles.slotWrapper}>
          <span className={styles.roleTag}>
            {POSITION_LABELS[slot.role]}
          </span>
          <ColorSlotCard
            slot={slot}
            index={index}
            canRemove={slots.length > 1}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        </div>
      ))}
      <div className={styles.slotWrapper}>
        <span className={styles.roleTag} aria-hidden="true" />
        <button
          className={styles.addCard}
          onClick={addSlot}
          disabled={!canAdd}
          aria-label="Add color"
          title={canAdd ? 'Add color' : 'Maximum 8 colors'}
        >
          +
        </button>
      </div>
    </div>
  )
}
