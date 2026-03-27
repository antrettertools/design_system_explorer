import { useRef, useState } from 'react'
import { useEffects, useEffectsActions } from '@/store'
import { ColorPickerPopover } from '@/components/ui/ColorPickerPopover/ColorPickerPopover'
import styles from './FocusRingSection.module.css'

export function FocusRingSection() {
  const { config } = useEffects()
  const effectsActions = useEffectsActions()
  const { focusRing } = config
  const [pickerOpen, setPickerOpen] = useState(false)
  const colorSwatchRef = useRef<HTMLDivElement>(null)

  const focusStyle = {
    outline: `${focusRing.width} solid ${focusRing.color}`,
    outlineOffset: focusRing.offset,
  }

  const widthValue = parseFloat(focusRing.width) || 2
  const offsetValue = parseFloat(focusRing.offset) || 2

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Focus Ring</div>
      <div className={styles.card}>
        <div className={styles.preview}>
          <span className={styles.previewLabel}>Unfocused →</span>
          <button className={styles.focusedBtn}>Click me</button>
          <span className={styles.previewLabel}>← Focused ↓</span>
          <button className={styles.focusedBtn} style={focusStyle}>Focused</button>
        </div>

        <div className={styles.controlsGrid}>
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>--focus-ring-color</span>
            <div className={styles.colorField}>
              <div
                ref={colorSwatchRef}
                className={styles.colorSwatch}
                style={{ background: focusRing.color }}
                onClick={() => setPickerOpen(true)}
                title="Edit focus ring color"
              />
              <span className={styles.colorValue}>{focusRing.color}</span>
            </div>
          </div>

          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>--focus-ring-width</span>
            <div className={styles.sliderField}>
              <input
                type="range"
                min="1"
                max="4"
                step="0.5"
                value={widthValue}
                className={styles.slider}
                onChange={e => effectsActions.setFocusRing({ width: e.target.value + 'px' })}
              />
              <span className={styles.sliderValue}>{focusRing.width}</span>
            </div>
          </div>

          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>--focus-ring-offset</span>
            <div className={styles.sliderField}>
              <input
                type="range"
                min="0"
                max="4"
                step="0.5"
                value={offsetValue}
                className={styles.slider}
                onChange={e => effectsActions.setFocusRing({ offset: e.target.value + 'px' })}
              />
              <span className={styles.sliderValue}>{focusRing.offset}</span>
            </div>
          </div>
        </div>
      </div>

      {pickerOpen && (
        <ColorPickerPopover
          hex={focusRing.color}
          onChange={hex => effectsActions.setFocusRing({ color: hex })}
          onClose={() => setPickerOpen(false)}
          anchorRef={colorSwatchRef as React.RefObject<HTMLElement>}
        />
      )}
    </div>
  )
}
