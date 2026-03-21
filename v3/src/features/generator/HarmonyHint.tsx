import { useColor } from '@/store'
import styles from './HarmonyHint.module.css'

const MODEL_DESCRIPTIONS: Record<string, string> = {
  monochromatic: 'Monochromatic — all hues unified, varied lightness',
  analogous: 'Analogous — neighboring hues in OKLCH',
  complementary: 'Complementary — high-contrast opposites',
  'split-complementary': 'Split-complementary — base + two near-complements',
  triadic: 'Triadic — vibrant 120\u00b0 triangle',
  tetradic: 'Tetradic — rich 4-point balance',
  compound: 'Compound — analogous group + strong accent',
}

export function HarmonyHint() {
  const { slots, activeModel } = useColor()
  const hasLocked = slots.some(s => s.locked)
  if (!hasLocked || !activeModel) return null

  return (
    <div className={styles.hint} role="status" aria-live="polite">
      \u26ac Unlocked colors harmonizing \u2014 {MODEL_DESCRIPTIONS[activeModel] ?? activeModel}
    </div>
  )
}
