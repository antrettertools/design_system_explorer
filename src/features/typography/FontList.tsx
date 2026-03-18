import { useState } from 'react'
import { getFontsByCategory } from '@/core/typography/fontDatabase'
import { loadFont } from '@/core/typography/fontLoader'
import { useTypography, useTypographyActions } from '@/store'
import { RadioGroup } from '@/components/controls/RadioGroup'
import type { FontCategory, FontDefinition } from '@/core/tokens/types'
import styles from './FontList.module.css'

type FilterCategory = 'all' | FontCategory

const FILTER_OPTIONS: Array<{ label: string; value: FilterCategory }> = [
  { label: 'All', value: 'all' },
  { label: 'Sans', value: 'sans' },
  { label: 'Serif', value: 'serif' },
  { label: 'Mono', value: 'mono' },
]

export function FontList() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterCategory>('all')
  const { fontFamily } = useTypography()
  const { setFont } = useTypographyActions()

  const filtered = getFontsByCategory(filter).filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelect = (font: FontDefinition) => {
    loadFont(font)
    setFont(font.name, font.category)
  }

  return (
    <>
      <input
        type="search"
        className={styles.searchInput}
        placeholder="Search fonts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <RadioGroup options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      <div className={styles.list}>
        {filtered.slice(0, 80).map((font) => (
          <div
            key={font.name}
            className={`${styles.item}${font.name === fontFamily ? ` ${styles.selected}` : ''}`}
            onClick={() => handleSelect(font)}
          >
            <div>
              <div className={styles.itemName}>{font.name}</div>
              <div className={styles.itemMeta}>{font.source}</div>
            </div>
            <div className={styles.tags}>
              {font.variable && <span className={`${styles.tag} ${styles.tagVar}`}>VAR</span>}
              <span
                className={`${styles.tag} ${
                  font.category === 'mono'
                    ? styles.tagMono
                    : font.category === 'serif'
                      ? styles.tagSerif
                      : styles.tagSans
                }`}
              >
                {font.category.toUpperCase()}
              </span>
              <span className={`${styles.tag} ${styles.tagSrc}`}>
                {font.source.substring(0, 3).toUpperCase()}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '16px 20px', fontSize: 11, color: 'var(--text-3)' }}>
            No fonts match "{search}"
          </div>
        )}
      </div>
    </>
  )
}
