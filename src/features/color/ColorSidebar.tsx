import { useColor, useColorActions } from '@/store'
import { SidebarSection, ControlGroup, ControlLabel } from '@/components/layout/AppLayout'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { RadioGroup } from '@/components/controls/RadioGroup'
import { Slider } from '@/components/controls/Slider'
import { HarmonyWheel } from './HarmonyWheel'
import { getHarmonyColors } from '@/core/color/harmony'
import { HARMONY_MODELS } from '@/core/color/types'
import type { HarmonyModel, NeutralTint, SubBrandMode } from '@/core/color/types'
import type { StateColors } from '@/core/tokens/types'

const HARMONY_OPTIONS: Array<{ label: string; value: HarmonyModel }> = [
  { label: 'Complementary', value: 'complementary' },
  { label: 'Analogous', value: 'analogous' },
  { label: 'Triadic', value: 'triadic' },
  { label: 'Split-Comp', value: 'split' },
  { label: 'Tetradic', value: 'tetradic' },
  { label: 'Square', value: 'square' },
]

const TINT_OPTIONS: Array<{ label: string; value: NeutralTint }> = [
  { label: 'Pure', value: 'pure' },
  { label: 'Warm', value: 'warm' },
  { label: 'Cool', value: 'cool' },
  { label: 'Tinted', value: 'tinted' },
]

const SUB_BRAND_MODE_OPTIONS: Array<{ label: string; value: SubBrandMode }> = [
  { label: 'Auto', value: 'auto-harmony' },
  { label: 'From 2nd', value: 'auto-secondary' },
  { label: 'Manual', value: 'manual' },
]

const DATA_VIZ_COUNT_OPTIONS = [
  { label: '6', value: 6 },
  { label: '8', value: 8 },
  { label: '10', value: 10 },
  { label: '12', value: 12 },
]

export function ColorSidebar() {
  const color = useColor()
  const actions = useColorActions()

  const harmonyColors = getHarmonyColors(color.primaryHex, color.harmonyModel)

  return (
    <>
      {/* ── Brand Colors ── */}
      <SidebarSection title="Brand Colors" />
      <ControlGroup>
        <ControlLabel>Primary Brand</ControlLabel>
        <ColorPicker
          value={color.primaryHex}
          onChange={actions.setPrimaryHex}
          label="Primary brand color"
        />
        <input
          type="text"
          value={color.primaryName}
          onChange={(e) => actions.setPrimaryName(e.target.value)}
          placeholder="Color name"
          style={{
            width: '100%',
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-0)',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            padding: '6px 10px',
            outline: 'none',
          }}
        />
      </ControlGroup>

      <ControlGroup>
        <ControlLabel>Secondary Brand</ControlLabel>
        <ColorPicker
          value={color.secondaryHex}
          onChange={actions.setSecondaryHex}
          label="Secondary brand color"
        />
        <input
          type="text"
          value={color.secondaryName}
          onChange={(e) => actions.setSecondaryName(e.target.value)}
          placeholder="Color name"
          style={{
            width: '100%',
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-0)',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            padding: '6px 10px',
            outline: 'none',
          }}
        />
      </ControlGroup>

      {/* ── Sub-Brand Colors ── */}
      <SidebarSection title="Sub-Brand Colors" />
      {([0, 1, 2] as const).map((i) => {
        const slot = color.subBrand[i]
        return (
          <ControlGroup key={i}>
            <ControlLabel>Sub-Brand {i + 1}</ControlLabel>
            <RadioGroup
              options={SUB_BRAND_MODE_OPTIONS}
              value={slot.mode}
              onChange={(mode) => actions.setSubBrandMode(i, mode)}
            />
            {slot.mode === 'manual' && (
              <ColorPicker
                value={slot.manualHex}
                onChange={(hex) => actions.setSubBrandHex(i, hex)}
                label={`Sub-brand ${i + 1} color`}
              />
            )}
            <input
              type="text"
              value={slot.name}
              onChange={(e) => actions.setSubBrandName(i, e.target.value)}
              placeholder={`Sub-brand ${i + 1} name`}
              style={{
                width: '100%',
                background: 'var(--bg-2)',
                border: '1px solid var(--line-2)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-0)',
                fontFamily: 'var(--mono)',
                fontSize: 12,
                padding: '6px 10px',
                outline: 'none',
              }}
            />
          </ControlGroup>
        )
      })}

      {/* ── Harmony Model ── */}
      <SidebarSection title="Harmony Model" />
      <ControlGroup>
        <RadioGroup
          options={HARMONY_OPTIONS}
          value={color.harmonyModel}
          onChange={actions.setHarmonyModel}
          columns={2}
        />
      </ControlGroup>

      <ControlGroup>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <HarmonyWheel harmonyColors={harmonyColors} size={164} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {harmonyColors.map((c, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 24,
                borderRadius: 4,
                background: c,
                border: i === 0 ? '2px solid white' : '2px solid transparent',
              }}
              title={c}
            />
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.5, marginTop: 4 }}>
          {HARMONY_MODELS[color.harmonyModel].description}
        </div>
      </ControlGroup>

      {/* ── Neutral Tint ── */}
      <SidebarSection title="Neutral Tint" />
      <ControlGroup>
        <RadioGroup options={TINT_OPTIONS} value={color.neutralTint} onChange={actions.setNeutralTint} />
      </ControlGroup>

      {/* ── State Colors ── */}
      <SidebarSection title="State Colors" />
      <ControlGroup>
        <div style={{ fontSize: 10, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>
          {color.stateColorsLocked
            ? 'Manually overridden. Click reset to re-derive.'
            : 'Auto-derived to maximize distance from brand palette.'}
        </div>
        {(['success', 'warning', 'error', 'info'] as Array<keyof StateColors>).map((key) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: color.stateColors[key],
                flexShrink: 0,
              }}
            />
            <input
              type="color"
              value={color.stateColors[key]}
              onChange={(e) => actions.setStateColor(key, e.target.value)}
              style={{ width: 28, height: 28, padding: 2, cursor: 'pointer', border: 'none', background: 'none' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-1)', fontFamily: 'var(--mono)', flex: 1 }}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
              {color.stateColors[key]}
            </span>
          </div>
        ))}
        {color.stateColorsLocked && (
          <button
            style={{
              width: '100%',
              padding: '5px 10px',
              background: 'var(--bg-3)',
              border: '1px solid var(--line-2)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-2)',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              cursor: 'pointer',
              marginTop: 4,
            }}
            onClick={() => actions.lockStateColors(false)}
          >
            Reset to derived
          </button>
        )}
      </ControlGroup>

      {/* ── Data Viz ── */}
      <SidebarSection title="Data Viz Palette" />
      <ControlGroup>
        <ControlLabel>Color Count</ControlLabel>
        <RadioGroup
          options={DATA_VIZ_COUNT_OPTIONS.map((o) => ({ label: String(o.label), value: String(o.value) as string }))}
          value={String(color.dataVizCount)}
          onChange={(v) => actions.setDataVizCount(Number(v))}
        />
      </ControlGroup>
      <ControlGroup>
        <Slider
          label="Chroma (vividness)"
          value={color.dataVizChroma}
          min={0.08}
          max={0.25}
          step={0.01}
          displayValue={color.dataVizChroma.toFixed(2)}
          onChange={actions.setDataVizChroma}
        />
      </ControlGroup>
    </>
  )
}
