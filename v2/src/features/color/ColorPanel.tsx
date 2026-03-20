import { usePrimitiveTokens } from '@/hooks/usePrimitiveTokens'
import { SemanticRolesPanel } from './SemanticRolesPanel'
import { ShadeScale } from './ShadeScale'
import { DataVizPalette } from './DataVizPalette'
import { ContrastGrid } from './ContrastGrid'
import { PreviewCard } from '@/components/layout/PreviewCard'
import styles from './ColorPanel.module.css'

export function ColorPanel() {
  const primitive = usePrimitiveTokens()

  return (
    <div className={styles.panel}>
      <SemanticRolesPanel />

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Shade Scales</h2>
        <PreviewCard>
          <ShadeScale
            label="Primary"
            hex={primitive.primary.color.hex}
            scale={primitive.primary.scale}
          />
          {primitive.secondary && (
            <ShadeScale
              label="Secondary"
              hex={primitive.secondary.color.hex}
              scale={primitive.secondary.scale}
            />
          )}
          {primitive.accents.map((a, i) => (
            <ShadeScale
              key={i}
              label={`Accent ${i + 1}`}
              hex={a.color.hex}
              scale={a.scale}
            />
          ))}
          <ShadeScale
            label="Neutral"
            scale={primitive.neutral}
          />
        </PreviewCard>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Data Viz Palette</h2>
        <PreviewCard>
          <DataVizPalette colors={primitive.dataViz} />
        </PreviewCard>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Contrast Grid</h2>
        <PreviewCard>
          <ContrastGrid />
        </PreviewCard>
      </section>
    </div>
  )
}
