import { PreviewCard } from '@/components/layout/PreviewCard'
import { ShadeScale } from './ShadeScale'
import { DataVizPalette } from './DataVizPalette'
import { ContrastGrid } from './ContrastGrid'
import { HarmonyWheel } from './HarmonyWheel'
import { HARMONY_MODELS } from '@/core/color/types'
import { getHarmonyColors } from '@/core/color/harmony'
import { getOnColor } from '@/core/color/scales'
import { useColor } from '@/store'
import { useTokens } from '@/hooks/useTokens'
import type { StateColors } from '@/core/tokens/types'

export function ColorPanel() {
  const color = useColor()
  const tokens = useTokens()

  // Live harmony colors including primary — these are the positions the model defines
  const harmonyColors = getHarmonyColors(color.primaryHex, color.harmonyModel)

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
            badge={
              sb.mode === 'manual'
                ? 'Manual'
                : sb.mode === 'auto-harmony'
                ? 'Auto · Primary'
                : 'Auto · Secondary'
            }
          />
        ))}
      </PreviewCard>

      {/* ── Harmony View ── */}
      <PreviewCard
        title={`Color Harmony — ${HARMONY_MODELS[color.harmonyModel].name}`}
        subtitle="— positions derived from primary"
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-2)',
            marginBottom: 20,
            lineHeight: 1.6,
            maxWidth: 560,
          }}
        >
          {HARMONY_MODELS[color.harmonyModel].description}
        </div>

        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Wheel */}
          <div style={{ flexShrink: 0 }}>
            <HarmonyWheel
              harmonyColors={harmonyColors}
              secondaryHex={color.secondaryHex}
              size={200}
            />
          </div>

          {/* Color strips */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-3)',
                fontFamily: 'var(--mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Harmony positions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {harmonyColors.map((hex, i) => {
                const onColor = getOnColor(hex)
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: hex,
                      borderRadius: 8,
                      padding: '8px 14px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: onColor,
                        opacity: 0.65,
                        fontFamily: 'var(--mono)',
                        minWidth: 60,
                      }}
                    >
                      {i === 0 ? 'Primary' : `+${HARMONY_MODELS[color.harmonyModel].angles[i - 1]}°`}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: onColor,
                        fontFamily: 'var(--mono)',
                        flex: 1,
                      }}
                    >
                      {hex}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Secondary brand position note */}
            <div
              style={{
                marginTop: 12,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px dashed var(--line)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: color.secondaryHex,
                  border: '2px solid var(--accent)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
                Secondary brand ({color.secondaryHex}) — independent position
              </span>
            </div>
          </div>
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
      <PreviewCard title="Contrast Analysis" subtitle="— WCAG 2.x on white and dark background">
        <ContrastGrid tokens={tokens} />
      </PreviewCard>
    </>
  )
}
