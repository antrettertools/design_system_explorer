import { PreviewCard } from '@/components/layout/PreviewCard'
import { ShadeScale } from './ShadeScale'
import { DataVizPalette } from './DataVizPalette'
import { ContrastGrid } from './ContrastGrid'
import { HARMONY_MODELS } from '@/core/color/types'
import { useColor } from '@/store'
import { useTokens } from '@/hooks/useTokens'
import type { StateColors } from '@/core/tokens/types'

export function ColorPanel() {
  const color = useColor()
  const tokens = useTokens()

  return (
    <>
      {/* ── Brand Foundation ── */}
      <PreviewCard
        title="Brand Foundation"
        subtitle="— 2 primary brand colors"
      >
        <ShadeScale
          label={`Primary — ${tokens.primaryBrand.name}`}
          hex={tokens.primaryBrand.hex}
          scale={tokens.primaryBrand.scale}
          badge="Primary"
        />
        <ShadeScale
          label={`Secondary — ${tokens.secondaryBrand.name}`}
          hex={tokens.secondaryBrand.hex}
          scale={tokens.secondaryBrand.scale}
          badge="Secondary"
        />
      </PreviewCard>

      {/* ── Sub-Brand Colors ── */}
      <PreviewCard
        title="Sub-Brand Colors"
        subtitle="— 3 supporting brand colors"
      >
        {tokens.subBrandColors.map((sb, i) => (
          <ShadeScale
            key={i}
            label={`${sb.name} — Sub ${i + 1}`}
            hex={sb.hex}
            scale={sb.scale}
            badge={sb.mode === 'manual' ? 'Manual' : sb.mode === 'auto-harmony' ? 'Auto' : 'From 2nd'}
          />
        ))}
      </PreviewCard>

      {/* ── Harmony View ── */}
      <PreviewCard
        title={`Color Harmony — ${HARMONY_MODELS[color.harmonyModel].name}`}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-2)',
            marginBottom: 16,
            lineHeight: 1.6,
            maxWidth: 600,
          }}
        >
          {HARMONY_MODELS[color.harmonyModel].description}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[tokens.primaryBrand.hex, tokens.secondaryBrand.hex].map((hex, i) => (
            <ColorCard key={i} hex={hex} label={i === 0 ? 'Primary' : 'Secondary'} />
          ))}
        </div>
      </PreviewCard>

      {/* ── State Colors ── */}
      <PreviewCard
        title="State Colors"
        subtitle="— derived to harmonize with brand palette"
      >
        {(['success', 'warning', 'error', 'info'] as Array<keyof StateColors>).map((key) => (
          <ShadeScale
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            hex={tokens.stateColors[key]}
            scale={tokens.stateScales[key]}
          />
        ))}
      </PreviewCard>

      {/* ── Neutral Scale ── */}
      <PreviewCard title="Neutral Scale" subtitle={`— ${tokens.neutral.tint} tint`}>
        <ShadeScale
          label="Neutral"
          hex={tokens.neutral.scale[500]}
          scale={tokens.neutral.scale}
        />
      </PreviewCard>

      {/* ── Data Viz Palette ── */}
      <PreviewCard
        title="Data Visualization Palette"
        subtitle="— OKLCH perceptually equidistant"
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-2)',
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Colors are equally spaced in OKLCH space — no single series visually dominates.
          Each has a dark variant (for dark backgrounds) and a light variant (for light
          backgrounds). Colorblind simulations shown below.
        </div>
        <DataVizPalette colors={tokens.dataVizPalette} showColorblind={true} />
      </PreviewCard>

      {/* ── Contrast Grid ── */}
      <PreviewCard title="Contrast Analysis" subtitle="— WCAG 2.x">
        <ContrastGrid tokens={tokens} />
      </PreviewCard>
    </>
  )
}

function ColorCard({ hex, label }: { hex: string; label: string }) {
  const import_chroma = (h: string) => {
    // Simple inline contrast calculation
    const n = parseInt(h.replace('#', ''), 16)
    const r = ((n >> 16) & 0xff) / 255
    const g = ((n >> 8) & 0xff) / 255
    const b = (n & 0xff) / 255
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 0.5 ? '#111111' : '#ffffff'
  }
  const onColor = import_chroma(hex)

  return (
    <div
      style={{
        background: hex,
        borderRadius: 10,
        padding: '16px 20px',
        minWidth: 120,
        minHeight: 72,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div style={{ fontSize: 10, color: onColor, opacity: 0.7, fontFamily: 'var(--mono)' }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: onColor, fontFamily: 'var(--mono)' }}>
        {hex}
      </div>
    </div>
  )
}
