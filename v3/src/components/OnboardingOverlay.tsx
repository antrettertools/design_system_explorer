import { useEffect, useState } from 'react'
import styles from './OnboardingOverlay.module.css'

const STORAGE_KEY = 'dsygn_onboarded'
const AUTO_DISMISS_MS = 5000

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false)
  const isTouch = typeof window !== 'undefined'
    && window.matchMedia('(pointer: coarse)').matches

  useEffect(() => {
    // Only show if user hasn't seen the overlay before
    if (localStorage.getItem(STORAGE_KEY)) return
    setVisible(true)

    const timer = setTimeout(() => dismiss(), AUTO_DISMISS_MS)

    function dismiss() {
      setVisible(false)
      localStorage.setItem(STORAGE_KEY, '1')
      clearTimeout(timer)
    }

    const handleKey = () => dismiss()
    const handleClick = () => dismiss()

    document.addEventListener('keydown', handleKey, { once: true })
    document.addEventListener('click', handleClick, { once: true })

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={styles.overlay} aria-live="polite" role="status">
      <div className={styles.card}>
        {isTouch ? (
          <p className={styles.line1}>
            Tap <strong className={styles.kbd}>Generate</strong> for a new palette.
          </p>
        ) : (
          <p className={styles.line1}>
            Hit <kbd className={styles.kbd}>space</kbd> to generate.
          </p>
        )}
        <p className={styles.line2}>
          Sign in to save. <strong className={styles.price}>€29</strong> for the full kit.
        </p>
        <p className={styles.hint}>{isTouch ? 'Tap anywhere to dismiss' : 'Click anywhere to dismiss'}</p>
      </div>
    </div>
  )
}
