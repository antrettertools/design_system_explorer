import { useSpacing } from '@/store'
import styles from './MiscSection.module.css'

const ICON_ORDER = ['xs', 'sm', 'md', 'lg', 'xl'] as const

export function MiscSection() {
  const { config } = useSpacing()

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Borders, Opacity, Icons & Layout</div>

      {/* Border widths */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Border Widths</div>
        {config.borderWidths.map((w, i) => (
          <div key={w} className={styles.tokenRow}>
            <span className={styles.tokenName}>--border-width-{i + 1}</span>
            <div style={{ height: `${w}px`, width: 60, background: 'var(--color-on-surface, #333)' }} />
            <span className={styles.tokenValue}>{w}px</span>
          </div>
        ))}
      </div>

      {/* Icon sizes */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Icon Sizes</div>
        <div className={styles.iconSizeRow}>
          {ICON_ORDER.map(step => {
            const size = config.iconSizes[step]
            return (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  className={styles.iconBox}
                  style={{ width: size, height: size }}
                  title={`icon-size-${step}: ${size}px`}
                />
                <span className={styles.iconLabel}>{step}</span>
                <span className={styles.iconLabel}>{size}px</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Opacity scale */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Opacity Scale</div>
        <div className={styles.opacityRow}>
          {config.opacityScale.map((opacity, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                className={styles.opacitySwatch}
                style={{ opacity }}
                title={`opacity: ${opacity}`}
              />
              <span className={styles.iconLabel}>
                {Math.round(opacity * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Z-index layers */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Z-Index Layers</div>
        {Object.entries(config.zIndex).map(([name, value]) => (
          <div key={name} className={styles.tokenRow}>
            <span className={styles.tokenName}>--z-{name}</span>
            <span className={styles.tokenValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* Breakpoints */}
      <div className={styles.subsection}>
        <div className={styles.subsectionLabel}>Breakpoints</div>
        <table className={styles.bpTable}>
          <tbody>
            {Object.entries(config.breakpoints).map(([name, value]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>≥ {value}px</td>
                <td className={styles.tokenName}>--breakpoint-{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
