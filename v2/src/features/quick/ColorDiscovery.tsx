import { useEffect } from 'react'
import { usePersonality, usePersonalityActions, useColorActions } from '@/store'
import { candidateFromHue } from '@/core/color/candidates'
import { ColorCandidateCard } from './ColorCandidateCard'
import styles from './ColorDiscovery.module.css'

export function ColorDiscovery() {
  const personality = usePersonality()
  const actions = usePersonalityActions()
  const colorActions = useColorActions()

  const archetype = personality.archetype ?? 'professional'
  const { cycleSequence, cycleIndex, locked } = personality

  const currentCandidates = locked.map((lockedHex, i) => {
    if (lockedHex !== null) return { hex: lockedHex, locked: true }
    const hueIdx = (cycleIndex + i) % Math.max(cycleSequence.length, 1)
    const hue = cycleSequence[hueIdx] ?? 0
    return { hex: candidateFromHue(hue, archetype).hex, locked: false }
  })

  const lockedCount = locked.filter(h => h !== null).length

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        actions.advanceCycle()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const lockedHexes = locked.filter((h): h is string => h !== null)
        if (lockedHexes.length > 0) {
          colorActions.setPrimary(lockedHexes[0])
          colorActions.setSecondary(lockedHexes[1] ?? null)
          colorActions.setAccents(lockedHexes.slice(2))
          actions.setStep(3)
        }
      } else if (e.key === '+' || e.key === '=') {
        actions.addCard()
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        const lastLockedIdx = [...locked].map((h, i) => ({ h, i })).reverse().find(x => x.h !== null)
        if (lastLockedIdx) actions.unlockColor(lastLockedIdx.i)
      } else {
        const idx = parseInt(e.key) - 1
        if (!isNaN(idx) && idx >= 0 && idx < currentCandidates.length && !currentCandidates[idx].locked) {
          actions.lockColor(idx, currentCandidates[idx].hex)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const handleBuild = () => {
    const lockedHexes = locked.filter((h): h is string => h !== null)
    if (lockedHexes.length === 0) return
    colorActions.setPrimary(lockedHexes[0])
    colorActions.setSecondary(lockedHexes[1] ?? null)
    colorActions.setAccents(lockedHexes.slice(2))
    actions.setStep(3)
  }

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Find your colors</h1>
        <p className={styles.subtitle}>
          Press <kbd>Space</kbd> to cycle · <kbd>1–{currentCandidates.length}</kbd> to lock · <kbd>+</kbd> to add a card
        </p>
      </div>
      <div className={styles.cards}>
        {currentCandidates.map((card, i) => (
          <ColorCandidateCard
            key={i}
            hex={card.hex}
            locked={card.locked}
            index={i}
            onLock={actions.lockColor}
            onUnlock={actions.unlockColor}
          />
        ))}
      </div>
      <div className={styles.footer}>
        <button className={styles.buildBtn} onClick={handleBuild} disabled={lockedCount === 0}>
          Build System →
        </button>
        {lockedCount > 0 && (
          <p className={styles.hint}>{lockedCount} color{lockedCount > 1 ? 's' : ''} locked · Press Enter to build</p>
        )}
      </div>
    </div>
  )
}
