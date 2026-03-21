import { useRef, useState } from 'react'
import { ColorPickerPopover } from '@/components/ui/ColorPickerPopover/ColorPickerPopover'
import type { ShadowPresets } from '@/core/effects/types'
import styles from './ShadowBuilder.module.css'

type ParsedShadow = {
  x: number
  y: number
  blur: number
  spread: number
  color: string
} | null

function parseShadow(css: string): ParsedShadow {
  if (css.includes('var(')) return null
  const match = css.match(
    /(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px(?:\s+(-?\d+(?:\.\d+)?)px)?\s+(.+)/,
  )
  if (!match) return null
  return {
    x: parseFloat(match[1]),
    y: parseFloat(match[2]),
    blur: parseFloat(match[3]),
    spread: parseFloat(match[4] ?? '0'),
    color: match[5].trim(),
  }
}

function composeShadow(p: NonNullable<ParsedShadow>): string {
  return `${p.x}px ${p.y}px ${p.blur}px ${p.spread}px ${p.color}`
}

interface ShadowBuilderProps {
  step: keyof ShadowPresets
  value: string
  onOverride: (value: string) => void
  onReset: () => void
  isOverridden: boolean
}

export function ShadowBuilder({ step, value, onOverride, onReset, isOverridden }: ShadowBuilderProps) {
  const parsed = parseShadow(value)
  const [textValue, setTextValue] = useState(value)
  const [pickerOpen, setPickerOpen] = useState(false)
  const colorSwatchRef = useRef<HTMLDivElement>(null)

  // Sync text value when value prop changes externally
  const prevValue = useRef(value)
  if (prevValue.current !== value) {
    prevValue.current = value
    setTextValue(value)
  }

  function updateField(field: keyof NonNullable<ParsedShadow>, newVal: number | string) {
    if (!parsed) return
    const updated = { ...parsed, [field]: newVal }
    onOverride(composeShadow(updated))
  }

  return (
    <div className={styles.builder}>
      <div className={styles.header}>
        <span className={styles.stepLabel}>shadow-{step}</span>
        {isOverridden && (
          <button className={styles.resetBtn} onClick={onReset} title="Reset to derived value">
            ↺ reset
          </button>
        )}
      </div>

      {parsed ? (
        <div className={styles.richEditor}>
          <div
            className={styles.shadowPreview}
            style={{ boxShadow: value }}
          />
          <div className={styles.sliders}>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>X</span>
              <input type="range" min="-20" max="20" step="1" value={parsed.x} className={styles.slider}
                onChange={e => updateField('x', Number(e.target.value))} />
              <span className={styles.sliderValue}>{parsed.x}px</span>
            </div>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>Y</span>
              <input type="range" min="-20" max="20" step="1" value={parsed.y} className={styles.slider}
                onChange={e => updateField('y', Number(e.target.value))} />
              <span className={styles.sliderValue}>{parsed.y}px</span>
            </div>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>Blur</span>
              <input type="range" min="0" max="40" step="1" value={parsed.blur} className={styles.slider}
                onChange={e => updateField('blur', Number(e.target.value))} />
              <span className={styles.sliderValue}>{parsed.blur}px</span>
            </div>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>Spread</span>
              <input type="range" min="-10" max="10" step="1" value={parsed.spread} className={styles.slider}
                onChange={e => updateField('spread', Number(e.target.value))} />
              <span className={styles.sliderValue}>{parsed.spread}px</span>
            </div>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>Color</span>
              <div
                ref={colorSwatchRef}
                className={styles.colorSwatch}
                style={{ background: parsed.color }}
                onClick={() => setPickerOpen(true)}
                title="Edit shadow color"
              />
              <span className={styles.sliderValue}>{parsed.color}</span>
            </div>
          </div>
          {pickerOpen && (
            <ColorPickerPopover
              hex={parsed.color.startsWith('#') ? parsed.color : '#888888'}
              onChange={hex => updateField('color', hex)}
              onClose={() => setPickerOpen(false)}
              anchorRef={colorSwatchRef as React.RefObject<HTMLElement>}
            />
          )}
        </div>
      ) : (
        <div className={styles.textFallback}>
          <span className={styles.infoNote}>Contains CSS variable — edit as text</span>
          <input
            type="text"
            className={styles.textInput}
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            onBlur={e => onOverride(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
