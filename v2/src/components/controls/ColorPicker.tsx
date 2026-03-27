import { useState, useEffect } from 'react'
import { parse, formatHsl } from 'culori'
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
      const parsed = parse(value)
      if (!parsed) return ''
      const hslStr = formatHsl(parsed)
      const match = hslStr.match(/hsl\(([0-9.]+),\s*([0-9.]+)%,\s*([0-9.]+)%\)/)
      if (match) {
        return `HSL ${Math.round(Number(match[1]))}° ${Math.round(Number(match[2]))}% ${Math.round(Number(match[3]))}%`
      }
      return hslStr
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
      className={styles.swatchInline}
      style={
        {
          '--swatch-size': `${size}px`,
          '--swatch-color': hex,
        } as React.CSSProperties
      }
      onClick={onClick}
      title={hex}
      data-clickable={onClick ? 'true' : undefined}
    />
  )
}
