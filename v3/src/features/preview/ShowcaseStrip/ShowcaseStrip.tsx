import { useUI, useUIActions } from '@/store'
import type { ShowcaseTemplate } from '@/store/ui'
import styles from './ShowcaseStrip.module.css'

const TEMPLATES: { id: ShowcaseTemplate; label: string }[] = [
  { id: 'landing',   label: 'Landing'   },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'blog',      label: 'Blog'      },
  { id: 'system',    label: 'System'    },
]

export function ShowcaseStrip() {
  const { showcaseTemplate } = useUI()
  const { setShowcaseTemplate, copyShareLink } = useUIActions()

  const handleFullscreen = () => {
    window.open(
      `${window.location.origin}${window.location.pathname}${window.location.hash}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleShare = () => {
    void copyShareLink()
  }

  return (
    <div className={styles.strip} role="toolbar" aria-label="Preview template">
      <div className={styles.chips}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            className={`${styles.chip} ${showcaseTemplate === t.id ? styles.active : ''}`}
            onClick={() => setShowcaseTemplate(t.id)}
            aria-pressed={showcaseTemplate === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button
          className={styles.iconBtn}
          onClick={handleShare}
          aria-label="Copy share link"
          title="Copy share link"
        >
          <ShareIcon />
        </button>
        <button
          className={styles.iconBtn}
          onClick={handleFullscreen}
          aria-label="Fullscreen preview"
          title="Fullscreen preview"
        >
          <FullscreenIcon />
        </button>
      </div>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM4 6a2 2 0 1 1 0 4A2 2 0 0 1 4 6zm8 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM5.8 7.4l4.4-2.8M5.8 8.6l4.4 2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
