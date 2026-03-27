import { useState } from 'react'
import { ChevronDown, ChevronUp, Lock, LockOpen } from 'lucide-react'
import { useTypography, useTypographyActions } from '@/store'
import styles from './ScaleEditor.module.css'
import type { TypeScale, TypeScaleStep } from '@/core/typography/types'

const SCALE_ORDER: (keyof TypeScale)[] = ['display', 'h1', 'h2', 'h3', 'h4', 'body', 'small', 'xs', 'label']

const SPECIMEN_STRINGS: Partial<Record<keyof TypeScale, string>> = {
  display: 'Display — The quick brown fox',
  h1: 'Heading 1 — jumps over the lazy dog',
  h2: 'Heading 2 — Pack my box',
  h3: 'Heading 3 — with five dozen',
  h4: 'Heading 4 — liquor jugs',
  body: 'Body — How vexingly quick daft zebras jump',
  small: 'Small — The five boxing wizards',
  xs: 'XS — jump quickly',
  label: 'LABEL',
}

const RATIO_PRESETS = [
  { label: '1.125', value: 1.125, name: 'Minor 2nd' },
  { label: '1.250', value: 1.25,  name: 'Major 2nd' },
  { label: '1.333', value: 1.333, name: 'Perfect 4th' },
  { label: '1.414', value: 1.414, name: 'Aug 4th' },
  { label: '1.500', value: 1.5,   name: 'Perfect 5th' },
]

function isPreset(ratio: number): boolean {
  return RATIO_PRESETS.some(p => Math.abs(p.value - ratio) < 0.001)
}

export function ScaleEditor() {
  const { scale, pairing, stepOverrides, stepLocks } = useTypography()
  const typographyActions = useTypographyActions()
  const [expandedRows, setExpandedRows] = useState<Set<keyof TypeScale>>(new Set())
  const [customRatio, setCustomRatio] = useState('')

  if (!scale || !pairing) return null

  function toggleRow(key: keyof TypeScale) {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const currentRatio = scale._ratio
  const showCustom = !isPreset(currentRatio)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Type Scale</div>

      <div className={styles.ratioRow}>
        <span>Scale ratio:</span>
        <div className={styles.presetGroup}>
          {RATIO_PRESETS.map(preset => (
            <button
              key={preset.value}
              className={`${styles.presetBtn} ${Math.abs(currentRatio - preset.value) < 0.001 ? styles.presetActive : ''}`}
              onClick={() => { setCustomRatio(''); typographyActions.setScaleRatio(preset.value) }}
              title={preset.name}
            >
              {preset.label}
            </button>
          ))}
          <input
            type="number"
            className={`${styles.customRatioInput} ${showCustom ? styles.customRatioActive : ''}`}
            placeholder="Custom"
            min="1.0"
            max="2.0"
            step="0.001"
            value={showCustom ? currentRatio.toFixed(3) : customRatio}
            onChange={e => setCustomRatio(e.target.value)}
            onBlur={e => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) typographyActions.setScaleRatio(v)
            }}
          />
        </div>
        <span className={styles.hint}>base 16px × ratio^n</span>
      </div>

      <div className={styles.scaleList} role="list">
        {SCALE_ORDER.map(key => {
          const step = scale[key] as TypeScaleStep | undefined | number
          if (!step || typeof step === 'number') return null
          const fontFamily = key === 'body' || key === 'small' || key === 'xs' || key === 'label'
            ? `"${pairing.body}", sans-serif`
            : `"${pairing.heading}", serif`
          const isExpanded = expandedRows.has(key)
          const isOverridden = !!stepOverrides?.[key]
          const isLocked = !!stepLocks?.[key]
          return (
            <div key={key} className={`${styles.scaleRow} ${isOverridden ? styles.overridden : ''}`} role="listitem">
              <button
                className={styles.expandBtn}
                onClick={() => toggleRow(key)}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${step.label} row`}
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <span className={styles.stepLabel}>{step.label}</span>
              <div
                className={styles.specimen}
                style={{
                  fontFamily,
                  fontSize: `${Math.min(step.size, 28)}px`,
                  fontWeight: step.weight,
                  lineHeight: step.lineHeight,
                  letterSpacing: step.letterSpacing,
                }}
              >
                {SPECIMEN_STRINGS[key] ?? key}
              </div>
              <div className={styles.meta}>
                <span className={styles.metaItem}>{Math.round(step.size)}px</span>
                <span className={styles.metaItem}>{step.weight}</span>
                <span className={styles.metaItem}>lh {step.lineHeight}</span>
              </div>
              <button
                className={`${styles.lockBtn} ${isLocked ? styles.lockBtnActive : ''}`}
                onClick={() => typographyActions.toggleStepLock(key)}
                title={isLocked ? `Unlock ${step.label}` : `Lock ${step.label}`}
                aria-label={isLocked ? `Unlock ${step.label}` : `Lock ${step.label}`}
              >
                {isLocked ? <Lock size={12} /> : <LockOpen size={12} />}
              </button>
              {isExpanded && (
                <div className={styles.expandedControls} onClick={e => e.stopPropagation()}>
                  <label className={styles.overrideLabel}>
                    Size (px)
                    <input
                      type="number"
                      className={styles.overrideInput}
                      min="8"
                      max="200"
                      step="1"
                      defaultValue={Math.round(step.size)}
                      onBlur={e => typographyActions.overrideStep(key, { size: Number(e.target.value) })}
                    />
                  </label>
                  <label className={styles.overrideLabel}>
                    Weight
                    <input
                      type="number"
                      className={styles.overrideInput}
                      min="100"
                      max="900"
                      step="100"
                      defaultValue={step.weight}
                      onBlur={e => typographyActions.overrideStep(key, { weight: Number(e.target.value) })}
                    />
                  </label>
                  <label className={styles.overrideLabel}>
                    Line-height
                    <input
                      type="number"
                      className={styles.overrideInput}
                      min="1"
                      max="3"
                      step="0.05"
                      defaultValue={step.lineHeight}
                      onBlur={e => typographyActions.overrideStep(key, { lineHeight: Number(e.target.value) })}
                    />
                  </label>
                  <button
                    className={styles.resetStepBtn}
                    onClick={() => { typographyActions.resetStep(key); toggleRow(key) }}
                  >
                    ↺ reset
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
