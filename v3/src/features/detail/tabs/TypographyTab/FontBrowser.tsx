import { useState } from 'react'
import { useTypography, useTypographyActions } from '@/store'
import pairingsData from '@/core/typography/pairings.json'
import type { FontPairing } from '@/core/typography/types'
import { FontBrowserGrid } from './FontBrowserGrid'
import styles from './FontBrowser.module.css'

const PAIRINGS = pairingsData as FontPairing[]

export function FontBrowser() {
  const [mode, setMode] = useState<'heading' | 'body'>('heading')
  const [filter, setFilter] = useState('')
  const { pairing } = useTypography()
  const { setHeadingFont, setBodyFont } = useTypographyActions()

  const applyQuickPick = (p: FontPairing) => {
    setHeadingFont(p.heading, p.source)
    setBodyFont(p.body, p.source)
  }

  return (
    <div className={styles.browser}>
      <div className={styles.header}>
        <div className={styles.sectionTitle}>Font Browser</div>
        <div className={styles.modeSwitch}>
          <button
            className={`${styles.modeBtn} ${mode === 'heading' ? styles.active : ''}`}
            onClick={() => setMode('heading')}
            aria-pressed={mode === 'heading'}
          >
            Heading
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'body' ? styles.active : ''}`}
            onClick={() => setMode('body')}
            aria-pressed={mode === 'body'}
          >
            Body
          </button>
        </div>
      </div>

      {/* Quick picks */}
      <div className={styles.quickPicks} aria-label="Curated pairings">
        {PAIRINGS.slice(0, 20).map(p => (
          <button
            key={`${p.heading}-${p.body}`}
            className={styles.quickPick}
            onClick={() => applyQuickPick(p)}
            title={`${p.heading} + ${p.body}`}
          >
            <span className={styles.quickPickLabel}>{p.character}</span>
            {p.heading} / {p.body}
          </button>
        ))}
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.search}
          type="search"
          placeholder={`Search ${mode} fonts…`}
          value={filter}
          onChange={e => setFilter(e.target.value)}
          aria-label={`Search ${mode} fonts`}
        />
      </div>

      <FontBrowserGrid
        filter={filter}
        selectedHeading={pairing?.heading ?? null}
        selectedBody={pairing?.body ?? null}
        onSelectHeading={(name, source) => setHeadingFont(name, source)}
        onSelectBody={(name, source) => setBodyFont(name, source)}
        mode={mode}
      />
    </div>
  )
}
