import { useState, useRef } from 'react'
import { useColorActions } from '@/store'
import type { ColorSlot } from '@/core/color/types'
import { ShadeStrip } from './ShadeStrip'
import { ColorPickerPopover } from '@/components/ui/ColorPickerPopover/ColorPickerPopover'
import { Lock, LockOpen, X } from 'lucide-react'
import styles from './ColorSlotCard.module.css'

export const ROLE_LABELS: Record<string, string> = {
  brand: 'Brand',
  secondary: 'Secondary',
  accentA: 'Accent A',
  accentB: 'Accent B',
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

interface ColorSlotCardProps {
  slot: ColorSlot
  canRemove: boolean
  onDragStart?: (id: string) => void
  onDragOver?: (id: string) => void
  onDrop?: () => void
}

export function ColorSlotCard({
  slot,
  canRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: ColorSlotCardProps) {
  const { toggleLock, removeSlot, overrideHex, renameSlot } = useColorActions()
  const isLight = isLightColor(slot.hex)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const swatchRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const displayName = slot.name ?? ROLE_LABELS[slot.role] ?? slot.role

  function startEditing(e: React.MouseEvent) {
    e.stopPropagation()
    setNameInput(slot.name ?? '')
    setEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }

  function commitName() {
    renameSlot(slot.id, nameInput)
    setEditingName(false)
  }

  function cancelEdit() {
    setEditingName(false)
  }

  return (
    <div
      className={`${styles.card} ${slot.locked ? styles.locked : ''}`}
      data-light={isLight}
      draggable
      onDragStart={() => onDragStart?.(slot.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(slot.id) }}
      onDrop={onDrop}
    >
      <div
        ref={swatchRef}
        className={styles.swatch}
        style={{ background: slot.hex }}
        onClick={() => !editingName && setPickerOpen(true)}
      >
        <div className={styles.topRow}>
          {editingName ? (
            <input
              ref={nameInputRef}
              className={styles.roleLabelInput}
              value={nameInput}
              placeholder={ROLE_LABELS[slot.role] ?? slot.role}
              onChange={e => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); commitName() }
                if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
                e.stopPropagation()
              }}
              onClick={e => e.stopPropagation()}
              maxLength={20}
            />
          ) : (
            <span
              className={styles.roleLabel}
              onClick={startEditing}
              title="Click to rename"
            >
              {displayName}
            </span>
          )}
          <button
            className={styles.lockBtn}
            onClick={(e) => { e.stopPropagation(); toggleLock(slot.id) }}
            aria-label={slot.locked ? 'Unlock color' : 'Lock color'}
            title={slot.locked ? 'Click to unlock' : 'Click to lock'}
          >
            {slot.locked ? <Lock size={11} strokeWidth={2.5} /> : <LockOpen size={11} strokeWidth={2.5} />}
          </button>
        </div>
        <div className={styles.bottomRow}>
          <span className={styles.hex}>{slot.hex.toUpperCase()}</span>
        </div>
        {canRemove && slot.role !== 'brand' && (
          <button
            className={styles.removeBtn}
            onClick={(e) => { e.stopPropagation(); removeSlot(slot.id) }}
            aria-label={`Remove ${displayName} color`}
            title="Remove color"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        )}
      </div>
      {slot.locked && <ShadeStrip hex={slot.hex} role={slot.role} />}
      {pickerOpen && (
        <ColorPickerPopover
          hex={slot.hex}
          onChange={hex => overrideHex(slot.id, hex)}
          onClose={() => setPickerOpen(false)}
          anchorRef={swatchRef as React.RefObject<HTMLElement>}
        />
      )}
    </div>
  )
}
