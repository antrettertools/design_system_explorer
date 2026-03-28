import { useRef, useState, useEffect } from 'react'
import { useColor, useColorActions } from '@/store'
import { POSITION_LABELS } from '@/core/color/types'
import { ColorSlotCard } from './ColorSlotCard'
import styles from './ColorSwatches.module.css'

export function ColorSwatches() {
  const { slots } = useColor()
  const { reorderSlots, addSlot } = useColorActions()

  // ── Desktop drag ─────────────────────────────────────────────────────────
  const dragFrom = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDragStart = (id: string) => { dragFrom.current = id }
  const handleDragOver  = (id: string) => { setDragOverId(id) }
  const handleDrop = () => {
    if (!dragFrom.current || dragOverId === null) return
    const fromIdx = slots.findIndex(s => s.id === dragFrom.current)
    const toIdx   = slots.findIndex(s => s.id === dragOverId)
    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) reorderSlots(fromIdx, toIdx)
    dragFrom.current = null
    setDragOverId(null)
  }

  // ── Touch long-press drag ─────────────────────────────────────────────────
  const [touchDragId, setTouchDragId] = useState<string | null>(null)
  const [touchOverId, setTouchOverId] = useState<string | null>(null)
  const touchDragIdRef    = useRef<string | null>(null)
  const longPressTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef      = useRef<HTMLDivElement>(null)

  // Non-passive touchmove so we can preventDefault (blocks scroll) during drag
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onTouchMove(e: TouchEvent) {
      if (!touchDragIdRef.current) return
      e.preventDefault()
      const touch = e.touches[0]
      const target  = document.elementFromPoint(touch.clientX, touch.clientY)
      const wrapper = target?.closest('[data-slot-id]')
      setTouchOverId(wrapper?.getAttribute('data-slot-id') ?? null)
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [])

  function handleCardTouchStart(e: React.TouchEvent, id: string) {
    const touch  = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY

    if (longPressTimer.current) clearTimeout(longPressTimer.current)

    // Cancel long-press if finger moves more than 8px before threshold
    function onEarlyMove(ev: TouchEvent) {
      const t = ev.touches[0]
      if (Math.hypot(t.clientX - startX, t.clientY - startY) > 8) {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
        window.removeEventListener('touchmove', onEarlyMove)
      }
    }
    window.addEventListener('touchmove', onEarlyMove, { passive: true })

    longPressTimer.current = setTimeout(() => {
      window.removeEventListener('touchmove', onEarlyMove)
      navigator.vibrate?.(30)
      touchDragIdRef.current = id
      setTouchDragId(id)
    }, 400)
  }

  function handleCardTouchEnd() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }

    const fromId = touchDragIdRef.current
    const toId   = touchOverId
    if (fromId && toId && fromId !== toId) {
      const fromIdx = slots.findIndex(s => s.id === fromId)
      const toIdx   = slots.findIndex(s => s.id === toId)
      if (fromIdx >= 0 && toIdx >= 0) reorderSlots(fromIdx, toIdx)
    }
    touchDragIdRef.current = null
    setTouchDragId(null)
    setTouchOverId(null)
  }

  const canAdd = slots.length < 8

  return (
    <div className={`${styles.grid} ${touchDragId ? styles.anyDragging : ''}`} ref={containerRef}>
      {slots.map((slot, index) => (
        <div key={slot.id} className={styles.slotWrapper} data-slot-id={slot.id}>
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
            isTouchDragging={touchDragId === slot.id}
            isTouchOver={touchOverId === slot.id && touchDragId !== slot.id}
            isTouchDimmed={touchDragId !== null && touchDragId !== slot.id && touchOverId !== slot.id}
            onTouchStartCard={handleCardTouchStart}
            onTouchEndCard={handleCardTouchEnd}
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
