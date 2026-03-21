import { useState, useRef } from 'react'
import { converter } from 'culori'
import { useColor, useColorActions } from '@/store'
import { ColorPickerPopover } from '@/components/ui/ColorPickerPopover/ColorPickerPopover'
import styles from './ShadeScaleSection.module.css'

const toOklch = converter('oklch')

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const ROLE_LABELS: Record<string, string> = {
  brand: 'Brand',
  secondary: 'Secondary',
  accentA: 'Accent A',
  accentB: 'Accent B',
}

function isLightStep(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

function hexToOklchLabel(hex: string): string {
  const c = toOklch(hex)
  if (!c) return hex
  return `oklch(${(c.l ?? 0).toFixed(2)} ${(c.c ?? 0).toFixed(2)} ${Math.round(c.h ?? 0)})`
}

function getShadeSteps(role: string): Record<number, string> {
  const style = getComputedStyle(document.documentElement)
  const result: Record<number, string> = {}
  for (const step of SHADE_STEPS) {
    result[step] = style.getPropertyValue(`--color-${role}-${step}`).trim() || '#888'
  }
  return result
}

export function ShadeScaleSection() {
  const { slots } = useColor()
  const colorActions = useColorActions()
  const [openSlotId, setOpenSlotId] = useState<string | null>(null)
  const swatchRefs = useRef<Record<string, HTMLDivElement | null>>({})

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Shade Scales</div>
      {slots.map(slot => {
        const scale = getShadeSteps(slot.role)
        const oklchLabel = hexToOklchLabel(slot.hex)
        const anchorRef = { current: swatchRefs.current[slot.id] } as React.RefObject<HTMLElement>
        return (
          <div key={slot.id} className={styles.colorRow}>
            <div className={styles.colorHeader}>
              <div
                ref={el => { swatchRefs.current[slot.id] = el }}
                className={styles.colorSwatch}
                style={{ background: slot.hex }}
                onClick={() => setOpenSlotId(slot.id)}
                title={`Edit ${ROLE_LABELS[slot.role] ?? slot.role} color`}
              >
                <span className={styles.swatchEditIcon}>✎</span>
              </div>
              <div className={styles.colorInfo}>
                <span className={styles.roleName}>{ROLE_LABELS[slot.role] ?? slot.role}</span>
                <span className={styles.colorMeta}>{slot.hex.toUpperCase()} · {oklchLabel}</span>
              </div>
            </div>
            <div className={styles.scaleRow} role="list" aria-label={`${ROLE_LABELS[slot.role] ?? slot.role} shade scale`}>
              {SHADE_STEPS.map(step => {
                const stepHex = scale[step]
                const isLight = isLightStep(stepHex)
                return (
                  <div
                    key={step}
                    className={`${styles.scaleCell} ${isLight ? styles.scaleCellLight : ''}`}
                    style={{ background: stepHex }}
                    role="listitem"
                    title={`${slot.role}-${step}: ${stepHex}`}
                    onClick={() => { navigator.clipboard?.writeText(stepHex) }}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') navigator.clipboard?.writeText(stepHex) }}
                    aria-label={`Step ${step}: ${stepHex}`}
                  >
                    <div className={styles.scaleCellLabel}>
                      <span className={styles.scaleCellStep}>{step}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            {openSlotId === slot.id && (
              <ColorPickerPopover
                hex={slot.hex}
                onChange={hex => colorActions.overrideHex(slot.id, hex)}
                onClose={() => setOpenSlotId(null)}
                anchorRef={anchorRef}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
