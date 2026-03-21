import type { ComponentName } from '@/core/components/types'
import styles from './ComponentPreview.module.css'

interface ComponentPreviewProps {
  componentName: ComponentName
}

function ButtonPreview() {
  return (
    <div className={styles.previewRow}>
      <button className={styles.btnDefault}>Primary</button>
      <button className={styles.btnHover}>Hover</button>
      <button className={styles.btnDefault} disabled>Disabled</button>
    </div>
  )
}

function InputPreview() {
  return (
    <div className={styles.inputWrapper}>
      <input className={styles.inputField} placeholder="Placeholder text" readOnly />
      <input className={styles.inputFieldFocused} placeholder="Focused state" readOnly />
      <input className={styles.inputFieldError} placeholder="Error state" value="Invalid input" readOnly />
    </div>
  )
}

function CardPreview() {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Card Title</div>
      <div className={styles.cardBody}>Card body text goes here. A short description.</div>
      <div className={styles.cardFooter}>
        <span>Footer text</span>
      </div>
    </div>
  )
}

function BadgePreview() {
  return (
    <div className={styles.badgeRow}>
      <span className={styles.badge}>Default</span>
      <span
        className={styles.badge}
        style={{ background: 'var(--color-success-container)', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
      >
        Success
      </span>
      <span
        className={styles.badge}
        style={{ background: 'var(--color-error-container)', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
      >
        Error
      </span>
    </div>
  )
}

function TagPreview() {
  return (
    <div className={styles.tagRow}>
      {(['Design', 'System', 'Tokens'] as const).map((t) => (
        <span key={t} className={styles.tag}>
          {t}
          <button className={styles.tagRemove} aria-label={`Remove ${t}`}>×</button>
        </span>
      ))}
    </div>
  )
}

function TooltipPreview() {
  return (
    <div className={styles.tooltipWrapper}>
      <button className={styles.tooltipTrigger}>Hover me</button>
      <div className={styles.tooltip} role="tooltip">
        This is a tooltip with helpful context
      </div>
    </div>
  )
}

function AlertPreview() {
  return (
    <div className={styles.alertStack}>
      {(['info', 'warning', 'error', 'success'] as const).map((type) => (
        <div
          key={type}
          className={styles.alert}
          style={{
            background: `var(--color-${type}-container, #eee)`,
            border: `1px solid var(--color-${type}, #999)`,
          }}
        >
          {type}: This is an {type} alert message.
        </div>
      ))}
    </div>
  )
}

export function ComponentPreview({ componentName }: ComponentPreviewProps) {
  switch (componentName) {
    case 'button':
      return <ButtonPreview />
    case 'input':
      return <InputPreview />
    case 'card':
      return <CardPreview />
    case 'badge':
      return <BadgePreview />
    case 'tag':
      return <TagPreview />
    case 'tooltip':
      return <TooltipPreview />
    case 'alert':
      return <AlertPreview />
    default:
      return null
  }
}
