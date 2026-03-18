import { useState, useEffect } from 'react'
import chroma from 'chroma-js'
import styles from './ColorPicker.module.css'

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value.toUpperCase())

  useEffect(() => {
    setHexInput(value.toUpperCase())
  }, [value])

  const handleHexChange = (raw: string) => {
    setHexInput(raw)
    const cleaned = raw.startsWith('#') ? raw : `#${raw}`
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      onChange(cleaned.toLowerCase())
    }
  }

  const hsl = (() => {
    try {
      const [h, s, l] = chroma(value).hsl()
      return `HSL ${Math.round((h ?? 0) * 360)}° ${Math.round((s ?? 0) * 100)}% ${Math.round((l ?? 0) * 100)}%`
    } catch {
      return ''
    }
  })()

  return (
    <div className={styles.wrapper}>
      <input
        type="color"
        className={styles.swatch}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        title={label ?? 'Pick color'}
      />
      <div className={styles.fields}>
        <input
          type="text"
          className={styles.hexInput}
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          maxLength={7}
          spellCheck={false}
        />
        <div className={styles.meta}>{hsl}</div>
      </div>
    </div>
  )
}

/** Compact inline color swatch (no text input) */
export function ColorSwatch({
  hex,
  size = 28,
  onClick,
}: {
  hex: string
  size?: number
  onClick?: () => void
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        background: hex,
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid rgba(0,0,0,0.1)',
        flexShrink: 0,
      }}
      onClick={onClick}
      title={hex}
    />
  )
}
