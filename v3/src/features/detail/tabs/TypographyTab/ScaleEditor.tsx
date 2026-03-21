import { useTypography } from '@/store'
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

export function ScaleEditor() {
  const { scale, pairing } = useTypography()
  if (!scale || !pairing) return null

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Type Scale</div>
      <div className={styles.ratioRow}>
        <span>Scale ratio:</span>
        <span className={styles.ratioValue}>{scale._ratio.toFixed(3)}</span>
        <span style={{ opacity: 0.5, fontSize: 10 }}>base 16px × ratio^n</span>
      </div>
      <div className={styles.scaleList} role="list">
        {SCALE_ORDER.map(key => {
          const step = scale[key] as TypeScaleStep | undefined | number
          if (!step || typeof step === 'number') return null
          const fontFamily = key === 'body' || key === 'small' || key === 'xs' || key === 'label'
            ? `"${pairing.body}", sans-serif`
            : `"${pairing.heading}", serif`
          return (
            <div key={key} className={styles.scaleRow} role="listitem">
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
