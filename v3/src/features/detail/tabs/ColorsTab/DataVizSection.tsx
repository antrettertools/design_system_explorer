import { useColor, useColorActions } from '@/store'
import { generateDataVizPalette } from '@/core/color/dataViz'
import styles from './DataVizSection.module.css'

const DEMO_HEIGHTS = [80, 55, 70, 40, 90, 60, 45, 75]

export function DataVizSection() {
  const { slots, dataVizN } = useColor()
  const { setDataVizN } = useColorActions()
  const brandHex = slots.find(s => s.role === 'brand')?.hex ?? '#888888'
  const palette = generateDataVizPalette(brandHex, dataVizN)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Data Visualization — Categorical Palette</div>

      <div className={styles.nControl}>
        <label htmlFor="dataviz-n">Colors:</label>
        <select
          id="dataviz-n"
          value={dataVizN}
          onChange={e => setDataVizN(Number(e.target.value))}
        >
          {[4, 6, 8, 10, 12, 16, 20].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span style={{ fontSize: 10, opacity: 0.6 }}>
          OKLCH-equidistant · L≈0.65 · C≈0.15
        </span>
      </div>

      <div className={styles.palette} role="list" aria-label={`${dataVizN}-color data viz palette`}>
        {palette.map((hex, i) => (
          <div
            key={i}
            className={styles.paletteCell}
            style={{ background: hex }}
            role="listitem"
            title={`Series ${i + 1}: ${hex}`}
            onClick={() => navigator.clipboard?.writeText(hex)}
            aria-label={`Series ${i + 1}: ${hex}`}
          />
        ))}
      </div>

      <div className={styles.chart} aria-label="Sample bar chart preview">
        {palette.slice(0, 8).map((hex, i) => (
          <div
            key={i}
            className={styles.bar}
            style={{
              background: hex,
              height: `${DEMO_HEIGHTS[i % DEMO_HEIGHTS.length]}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
