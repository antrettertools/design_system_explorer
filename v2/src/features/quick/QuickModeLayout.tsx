import { usePersonality } from '@/store'
import { PersonalityPicker } from './PersonalityPicker'
import { ColorDiscovery } from './ColorDiscovery'
import { SystemReveal } from './SystemReveal'
import styles from './QuickModeLayout.module.css'

export function QuickModeLayout() {
  const { step } = usePersonality()
  return (
    <div className={styles.layout}>
      {step === 1 && <PersonalityPicker />}
      {step === 2 && <ColorDiscovery />}
      {step === 3 && <SystemReveal />}
    </div>
  )
}
