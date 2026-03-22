import { useColor } from '@/store'
import type { ComponentName } from '@/core/components/types'
import styles from './ComponentPreview.module.css'

interface ComponentPreviewProps {
  componentName: ComponentName
}

function ButtonPreview() {
  return (
    <div className={styles.previewSection}>
      <div className={styles.previewRow}>
        <button className={styles.btnPrimary}>Primary</button>
        <button className={styles.btnPrimaryHover}>Hover</button>
        <button className={styles.btnPrimary} disabled>Disabled</button>
      </div>
      <div className={styles.previewRow}>
        <button className={styles.btnSecondary}>Secondary</button>
        <button className={styles.btnSecondaryHover}>Hover</button>
        <button className={styles.btnSecondary} disabled>Disabled</button>
      </div>
      <div className={styles.previewRow}>
        <button className={styles.btnGhost}>Ghost</button>
        <button className={styles.btnGhostHover}>Hover</button>
        <button className={styles.btnGhost} disabled>Disabled</button>
      </div>
      <div className={styles.previewRow}>
        <button className={styles.btnDestructive}>Destructive</button>
        <button className={styles.btnDestructiveHover}>Hover</button>
        <button className={styles.btnDestructive} disabled>Disabled</button>
      </div>
    </div>
  )
}

function InputPreview() {
  return (
    <div className={styles.inputWrapper}>
      <input className={styles.inputField} placeholder="Default state" readOnly />
      <input className={styles.inputFieldFocused} placeholder="Focused state" readOnly />
      <input className={styles.inputFieldError} placeholder="Error state" value="Invalid input" readOnly />
    </div>
  )
}

function CardPreview() {
  return (
    <div className={styles.previewSection}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Card Title</div>
        <div className={styles.cardBody}>A short description of this card's content.</div>
        <div className={styles.cardFooter}>Footer text</div>
      </div>
      <div className={styles.cardElevated}>
        <div className={styles.cardTitle}>Elevated Card</div>
        <div className={styles.cardBody}>Uses shadow-md for depth.</div>
        <div className={styles.cardFooter}>Footer text</div>
      </div>
    </div>
  )
}

function BadgePreview() {
  const { slots } = useColor()
  const hasSecondary = slots.some(s => s.role === 'secondary')
  const hasAccentA   = slots.some(s => s.role === 'accentA')
  const hasAccentB   = slots.some(s => s.role === 'accentB')

  return (
    <div className={styles.badgeSection}>
      {/* Brand & palette variants */}
      <div className={styles.badgeGroup}>
        <span className={styles.badgeBrand}>Brand</span>
        <span className={styles.badgeNeutral}>Neutral</span>
        {hasSecondary && <span className={styles.badgeSecondary}>Secondary</span>}
        {hasAccentA   && <span className={styles.badgeAccentA}>Accent A</span>}
        {hasAccentB   && <span className={styles.badgeAccentB}>Accent B</span>}
      </div>
      {/* State variants */}
      <div className={styles.badgeGroup}>
        <span className={styles.badgeError}>Error</span>
        <span className={styles.badgeWarning}>Warning</span>
        <span className={styles.badgeSuccess}>Success</span>
        <span className={styles.badgeInfo}>Info</span>
      </div>
    </div>
  )
}

function TagPreview() {
  const { slots } = useColor()
  const hasSecondary = slots.some(s => s.role === 'secondary')
  const hasAccentA   = slots.some(s => s.role === 'accentA')
  const hasAccentB   = slots.some(s => s.role === 'accentB')

  return (
    <div className={styles.badgeSection}>
      <div className={styles.badgeGroup}>
        {(['Design', 'System', 'Tokens'] as const).map((t) => (
          <span key={t} className={styles.tagDefault}>
            {t} <button className={styles.tagRemove} aria-label={`Remove ${t}`}>×</button>
          </span>
        ))}
        <span className={styles.tagNeutral}>
          Neutral <button className={styles.tagRemove} aria-label="Remove">×</button>
        </span>
      </div>
      {(hasSecondary || hasAccentA || hasAccentB) && (
        <div className={styles.badgeGroup}>
          {hasSecondary && (
            <span className={styles.tagSecondary}>
              Secondary <button className={styles.tagRemove} aria-label="Remove">×</button>
            </span>
          )}
          {hasAccentA && (
            <span className={styles.tagAccentA}>
              Accent A <button className={styles.tagRemove} aria-label="Remove">×</button>
            </span>
          )}
          {hasAccentB && (
            <span className={styles.tagAccentB}>
              Accent B <button className={styles.tagRemove} aria-label="Remove">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function TooltipPreview() {
  return (
    <div className={styles.tooltipSection}>
      <div className={styles.tooltipGroup}>
        <div className={styles.tooltipDark} role="tooltip">Dark tooltip — use on light backgrounds</div>
        <div className={styles.tooltipLight} role="tooltip">Light tooltip — use on dark backgrounds</div>
      </div>
    </div>
  )
}

function AlertPreview() {
  return (
    <div className={styles.alertStack}>
      {(['info', 'success', 'warning', 'error'] as const).map((type) => (
        <div key={type} className={styles.alert} style={{
          background: `var(--color-${type}-container)`,
          borderLeft: `4px solid var(--color-${type})`,
        }}>
          <span className={styles.alertIcon} style={{ color: `var(--color-${type})` }}>
            {type === 'info' ? 'ℹ' : type === 'success' ? '✓' : type === 'warning' ? '⚠' : '✕'}
          </span>
          <span className={styles.alertText}>
            <strong style={{ textTransform: 'capitalize' }}>{type}:</strong> This is an example {type} alert.
          </span>
        </div>
      ))}
    </div>
  )
}

export function ComponentPreview({ componentName }: ComponentPreviewProps) {
  switch (componentName) {
    case 'button':  return <ButtonPreview />
    case 'input':   return <InputPreview />
    case 'card':    return <CardPreview />
    case 'badge':   return <BadgePreview />
    case 'tag':     return <TagPreview />
    case 'tooltip': return <TooltipPreview />
    case 'alert':   return <AlertPreview />
    default:        return null
  }
}
