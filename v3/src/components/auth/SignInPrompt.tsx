import { useEffect } from 'react'
import { useUI, useUIActions } from '@/store'
import { useAuth } from '@/auth/useAuth'
import styles from './SignInPrompt.module.css'

const COPY = {
  save: {
    heading: 'Save your designs',
    sub: 'Sign in to save designs to the cloud and access them anywhere.',
  },
  export: {
    heading: 'Unlock all export formats',
    sub: 'Sign in to access Tailwind, SCSS, W3C JSON, Figma, and more.',
  },
  manual: {
    heading: 'Welcome to dsygn.cloud',
    sub: 'Sign in to save designs, export all formats, and share your system.',
  },
} as const

export function SignInPrompt() {
  const { signInPromptOpen, signInPromptReason } = useUI()
  const { closeSignInPrompt } = useUIActions()
  const { signInWithGitHub, signInWithGoogle } = useAuth()

  // Close on Escape
  useEffect(() => {
    if (!signInPromptOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSignInPrompt()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [signInPromptOpen, closeSignInPrompt])

  if (!signInPromptOpen) return null

  const { heading, sub } = COPY[signInPromptReason ?? 'manual']

  return (
    <>
      <div
        className={styles.overlay}
        onClick={closeSignInPrompt}
        aria-hidden="true"
      />
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
      >
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.sub}>{sub}</p>

        <div className={styles.buttons}>
          <button
            className={styles.oauthBtn}
            onClick={async () => { closeSignInPrompt(); await signInWithGitHub() }}
          >
            Continue with GitHub
          </button>
          <button
            className={`${styles.oauthBtn} ${styles.googleBtn}`}
            onClick={async () => { closeSignInPrompt(); await signInWithGoogle() }}
          >
            Continue with Google
          </button>
        </div>

        <button className={styles.skipBtn} onClick={closeSignInPrompt}>
          Not now
        </button>
      </div>
    </>
  )
}
