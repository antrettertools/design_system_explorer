import { useColor } from '@/store'
import styles from './HarmonyHint.module.css'

export function HarmonyHint() {
  const { activeRecipe } = useColor()
  if (!activeRecipe) return null

  return (
    <div className={styles.hint} role="status" aria-live="polite">
      ⬤ {activeRecipe.label}
    </div>
  )
}
