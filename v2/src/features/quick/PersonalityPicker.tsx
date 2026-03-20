import { ARCHETYPES } from '@/core/personality/archetypes'
import { usePersonalityActions, useColorActions } from '@/store'
import { initialCandidate } from '@/core/color/candidates'
import styles from './PersonalityPicker.module.css'

export function PersonalityPicker() {
  const actions = usePersonalityActions()
  const colorActions = useColorActions()

  const handleSelect = (id: keyof typeof ARCHETYPES) => {
    const seed = Date.now()
    const candidate = initialCandidate(id)
    actions.setArchetype(id)
    actions.setCandidates([{ hex: candidate.hex, locked: false, oklch: candidate.oklch }])
    actions.initCycleSequence(seed)
    colorActions.setPrimary(candidate.hex)
    actions.setStep(2)
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1 className={styles.title}>What kind of product are you designing?</h1>
        <p className={styles.subtitle}>Pick a personality — you can explore and override everything later.</p>
      </div>
      <div className={styles.grid}>
        {Object.values(ARCHETYPES).map(archetype => (
          <button key={archetype.id} className={styles.card} onClick={() => handleSelect(archetype.id)}>
            <div className={styles.cardName}>{archetype.name}</div>
            <div className={styles.cardDesc}>{archetype.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
