import { useColor, useColorActions } from '@/store'
import type { HarmonyModel, NeutralTint } from '@/core/color/types'
import { getHarmonyColors } from '@/core/color/harmony'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { RadioGroup } from '@/components/controls/RadioGroup'
import { Slider } from '@/components/controls/Slider'
import { HarmonyWheel } from './HarmonyWheel'
import styles from './ColorSidebar.module.css'

const HARMONY_OPTIONS: Array<{ label: string; value: HarmonyModel }> = [
  { label: 'Complementary', value: 'complementary' },
  { label: 'Analogous', value: 'analogous' },
  { label: 'Triadic', value: 'triadic' },
  { label: 'Split-Comp', value: 'split-complementary' },
  { label: 'Monochrome', value: 'monochromatic' },
]

const TINT_OPTIONS: Array<{ label: string; value: NeutralTint }> = [
  { label: 'Pure', value: 'pure' },
  { label: 'Warm', value: 'warm' },
  { label: 'Cool', value: 'cool' },
  { label: 'Tinted', value: 'tinted' },
]

export function ColorSidebar() {
  const color = useColor()
  const actions = useColorActions()

  const harmonyColors = getHarmonyColors(color.primaryHex, color.harmonyModel)

  return (
    <div className={styles.sidebar}>
      {/* Brand Colors */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Brand Colors</div>
        <div className={styles.controlGroup}>
          <div className={styles.controlLabel}>Primary</div>
          <ColorPicker
            value={color.primaryHex}
            onChange={actions.setPrimary}
            label="Primary brand color"
          />
        </div>
        <div className={styles.controlGroup}>
          <div className={styles.controlLabel}>Secondary</div>
          <ColorPicker
            value={color.secondaryHex ?? '#888888'}
            onChange={(hex) => actions.setSecondary(hex)}
            label="Secondary brand color"
          />
          {color.secondaryHex && (
            <button className={styles.clearBtn} onClick={() => actions.setSecondary(null)}>
              Clear secondary
            </button>
          )}
        </div>
      </div>

      {/* Harmony Model */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Harmony Model</div>
        <div className={styles.controlGroup}>
          <RadioGroup
            options={HARMONY_OPTIONS}
            value={color.harmonyModel}
            onChange={(v) => actions.setHarmonyModel(v as HarmonyModel)}
            columns={2}
          />
        </div>
        <div className={styles.wheelContainer}>
          <HarmonyWheel
            harmonyColors={harmonyColors}
            secondaryHex={color.secondaryHex}
            size={164}
          />
        </div>
        <div className={styles.harmonySwatches}>
          {harmonyColors.map((c, i) => (
            <div
              key={i}
              className={styles.harmonySwatch}
              style={{
                background: c,
                outline: i === 0 ? '2px solid white' : 'none',
              }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Neutral Tint */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Neutral Tint</div>
        <div className={styles.controlGroup}>
          <RadioGroup
            options={TINT_OPTIONS}
            value={color.neutralTint}
            onChange={(v) => actions.setNeutralTint(v as NeutralTint)}
          />
        </div>
      </div>

      {/* Data Viz */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Data Viz Palette</div>
        <div className={styles.controlGroup}>
          <Slider
            label="Color Count"
            value={color.dataVizCount}
            min={4}
            max={12}
            step={1}
            displayValue={String(color.dataVizCount)}
            onChange={actions.setDataVizCount}
          />
          <Slider
            label="Chroma (vividness)"
            value={color.dataVizChroma}
            min={0.08}
            max={0.25}
            step={0.01}
            displayValue={color.dataVizChroma.toFixed(2)}
            onChange={actions.setDataVizChroma}
          />
        </div>
      </div>
    </div>
  )
}
