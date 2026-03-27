import { useEffect, useRef, useState } from 'react'
import styles from './ColorPickerPopover.module.css'

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/

function sanitizeHex(hex: string): string {
  return HEX_REGEX.test(hex) ? hex : '#888888'
}

interface ColorPickerPopoverProps {
  hex: string
  onChange: (hex: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement>
}

export function ColorPickerPopover({ hex, onChange, onClose, anchorRef }: ColorPickerPopoverProps) {
  const safeHex = sanitizeHex(hex)
  const [textValue, setTextValue] = useState(safeHex)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Sync text value when hex prop changes
  useEffect(() => {
    setTextValue(sanitizeHex(hex))
  }, [hex])

  // Compute position relative to anchor
  const style: React.CSSProperties = {}
  if (anchorRef.current) {
    const rect = anchorRef.current.getBoundingClientRect()
    style.top = rect.bottom + 6
    style.left = Math.max(8, rect.right - 180)
  }

  // Outside click and Escape close
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleTextBlur() {
    if (HEX_REGEX.test(textValue)) {
      onChange(textValue)
    } else {
      setTextValue(sanitizeHex(hex))
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTextValue(val)
    // Only call onChange mid-type if it's valid
    if (HEX_REGEX.test(val)) {
      onChange(val)
    }
  }

  return (
    <div ref={popoverRef} className={styles.popover} style={style}>
      <input
        type="color"
        className={styles.colorInput}
        value={safeHex}
        onChange={e => onChange(e.target.value)}
      />
      <input
        type="text"
        className={styles.hexInput}
        value={textValue}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        placeholder="#000000"
        maxLength={7}
        spellCheck={false}
      />
    </div>
  )
}
