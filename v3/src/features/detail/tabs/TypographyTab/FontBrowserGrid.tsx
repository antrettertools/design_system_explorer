import { useEffect, useRef, useState } from 'react'
import { createFontBrowserObserver, isFontLoaded } from '@/core/typography/fontLoader'
import pairingsData from '@/core/typography/pairings.json'
import type { FontPairing } from '@/core/typography/types'
import styles from './FontBrowserGrid.module.css'

const ALL_FONTS = (pairingsData as FontPairing[]).reduce<
  { name: string; source: FontPairing['source'] }[]
>((acc, p) => {
  if (!acc.find(f => f.name === p.heading)) acc.push({ name: p.heading, source: p.source })
  if (!acc.find(f => f.name === p.body)) acc.push({ name: p.body, source: p.source })
  return acc
}, [])

const PREVIEW_TEXT = 'Aa Bb Cc'

interface FontBrowserGridProps {
  filter: string
  selectedHeading: string | null
  selectedBody: string | null
  onSelectHeading: (name: string, source: FontPairing['source']) => void
  onSelectBody: (name: string, source: FontPairing['source']) => void
  mode: 'heading' | 'body'
}

export function FontBrowserGrid({ filter, selectedHeading, selectedBody, onSelectHeading, onSelectBody, mode }: FontBrowserGridProps) {
  const [loaded, setLoaded] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = filter
    ? ALL_FONTS.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))
    : ALL_FONTS

  useEffect(() => {
    const observer = createFontBrowserObserver(fontName => {
      setLoaded(prev => new Set([...prev, fontName]))
    })

    const cells = containerRef.current?.querySelectorAll('[data-font]')
    cells?.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [filtered.length])

  const handleSelect = (name: string, source: FontPairing['source']) => {
    if (mode === 'heading') onSelectHeading(name, source)
    else onSelectBody(name, source)
  }

  return (
    <div className={styles.grid} ref={containerRef}>
      {filtered.map(({ name, source }) => {
        const isLoaded = loaded.has(name) || isFontLoaded(name)
        const isSelected = mode === 'heading'
          ? selectedHeading === name
          : selectedBody === name

        return (
          <div
            key={name}
            className={`${styles.cell} ${isSelected ? styles.selected : ''}`}
            data-font={name}
            data-source={source}
            onClick={() => handleSelect(name, source)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelect(name, source) }}
            aria-pressed={isSelected}
            aria-label={`Select ${name} font`}
          >
            {isLoaded ? (
              <div
                className={styles.cellPreview}
                style={{ fontFamily: `"${name}", serif` }}
              >
                {PREVIEW_TEXT}
              </div>
            ) : (
              <div className={styles.skeleton} />
            )}
            <div className={styles.cellMeta}>
              <span className={styles.cellName}>{name}</span>
              <span className={styles.cellSource}>{source}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
