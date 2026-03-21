import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { useComponents, useComponentsActions, useStore } from '@/store'
import { ICON_LIBRARIES, deriveIconSizeMap } from '@/core/components/icons'
import styles from './IconLibrarySection.module.css'

const SLUGS = ICON_LIBRARIES[0].previewSlugs

const SIZE_OPTIONS = [
  { label: 'XS', value: 12 },
  { label: 'SM', value: 16 },
  { label: 'MD', value: 20 },
  { label: 'LG', value: 24 },
  { label: 'XL', value: 32 },
]

function getLucideIcon(slug: string): React.ComponentType<{ size?: number; strokeWidth?: number }> | null {
  const name = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  const icon = (LucideIcons as Record<string, unknown>)[name]
  return typeof icon === 'function' ? icon as React.ComponentType<{ size?: number; strokeWidth?: number }> : null
}

export function IconLibrarySection() {
  const { iconLibrary } = useComponents()
  const { setIconLibrary } = useComponentsActions()
  const spacing = useStore((s) => s.spacing)
  const sizeMap = deriveIconSizeMap(spacing.config)
  const selectedMeta = ICON_LIBRARIES.find((l) => l.name === iconLibrary)!
  const [iconSize, setIconSize] = useState(20)

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Icon Library</h2>

      <div className={styles.libraryGrid}>
        {ICON_LIBRARIES.map((lib) => (
          <button
            key={lib.name}
            className={`${styles.libraryBtn} ${iconLibrary === lib.name ? styles.libraryBtnSelected : ''}`}
            onClick={() => setIconLibrary(lib.name)}
            aria-pressed={iconLibrary === lib.name}
          >
            {lib.label}
          </button>
        ))}
      </div>

      <div className={styles.previewArea}>
        <div className={styles.previewHeader}>
          <p className={styles.previewLabel}>
            {selectedMeta.label} — {SLUGS.length} icons
          </p>
          <div className={styles.sizeSelector}>
            {SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.sizeBtn} ${iconSize === opt.value ? styles.sizeBtnActive : ''}`}
                onClick={() => setIconSize(opt.value)}
                aria-pressed={iconSize === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {iconLibrary === 'lucide' ? (
          <div className={styles.iconGrid}>
            {SLUGS.map((slug) => {
              const Icon = getLucideIcon(slug)
              return (
                <div key={slug} className={styles.iconCell} title={slug}>
                  {Icon
                    ? <Icon size={iconSize} strokeWidth={1.5} />
                    : <span className={styles.iconMissing}>?</span>
                  }
                </div>
              )
            })}
          </div>
        ) : (
          <div className={styles.libraryPlaceholder}>
            <span className={styles.libraryPlaceholderTitle}>{selectedMeta.label} not installed</span>
            <span className={styles.libraryPlaceholderHint}>
              Run <code>npm install {selectedMeta.packageName}</code> to use this library
            </span>
          </div>
        )}
      </div>

      <div>
        <p className={styles.description}>
          Icon size tokens — mapped to visual conventions, not spacing multipliers
        </p>
        <table className={styles.sizeMappingTable}>
          <thead>
            <tr>
              <th>Token</th>
              <th>Size</th>
              <th>CSS variable</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {(Object.entries(sizeMap) as [string, number][]).map(([key, px]) => (
              <tr key={key}>
                <td>icon-{key}</td>
                <td>{px}px</td>
                <td>var(--icon-size-{key})</td>
                <td>
                  <span
                    className={styles.sizePreview}
                    style={{ width: Math.min(px, 32), height: Math.min(px, 32) }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
