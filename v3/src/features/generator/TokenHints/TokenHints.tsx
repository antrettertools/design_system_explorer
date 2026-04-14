import { useEffect, useState } from 'react'
import { useColor, useTypography } from '@/store'
import styles from './TokenHints.module.css'

type TokenRow = {
  name: string
  label: string
  type: 'color' | 'font' | 'text'
}

const TOKEN_ROWS: TokenRow[] = [
  { name: '--color-brand-500',  label: 'color-brand-500',  type: 'color' },
  { name: '--color-accent-500', label: 'color-accent-500', type: 'color' },
  { name: '--font-heading',     label: 'font-heading',     type: 'font' },
  { name: '--font-body',        label: 'font-body',        type: 'font' },
  { name: '--radius-md',        label: 'radius-md',        type: 'text' },
  { name: '--shadow-md',        label: 'shadow-md',        type: 'text' },
]

function readTokens(): Record<string, string> {
  const style = getComputedStyle(document.documentElement)
  const out: Record<string, string> = {}
  for (const { name } of TOKEN_ROWS) {
    out[name] = style.getPropertyValue(name).trim()
  }
  return out
}

export function TokenHints() {
  const { slots } = useColor()
  const { pairing } = useTypography()
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setValues(readTokens())
    })
    return () => cancelAnimationFrame(id)
  }, [slots, pairing])

  return (
    <div className={styles.zone} aria-label="Generated tokens preview">
      <div className={styles.header}>
        <span className={styles.headerLabel}>Output tokens</span>
        <span className={styles.headerHint}>CSS custom properties</span>
      </div>
      <div className={styles.rows}>
        {TOKEN_ROWS.map(({ name, label, type }) => {
          const val = values[name] ?? ''
          return (
            <div key={name} className={styles.row}>
              <span className={styles.tokenName}>--{label}</span>
              <span className={styles.tokenValue}>
                {type === 'color' && val && (
                  <span
                    className={styles.swatch}
                    style={{ background: val }}
                    aria-hidden="true"
                  />
                )}
                <span className={styles.valueText}>
                  {type === 'text' && name === '--shadow-md' ? (val ? 'see token' : '…') : (val || '…')}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
