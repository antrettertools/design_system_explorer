import { useComponents, useComponentsActions, useStore } from '@/store'
import { ICON_LIBRARIES, deriveIconSizeMap } from '@/core/components/icons'
import styles from './IconLibrarySection.module.css'

// Minimal SVG path data for 24 common icon concepts (drawn on 24×24 viewBox)
const PLACEHOLDER_PATHS: string[] = [
  // home, search, settings, user, heart, star, bell, mail
  'M3 12l9-9 9 9v9H15v-5h-6v5H3z',
  'M21 21l-4.35-4.35M16.5 10.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0z',
  'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.24-9 5v1h18v-1c0-2.76-4-5-9-5z',
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'M15 17H20L18.59 15.59C18.21 15.21 18 14.7 18 14.17V11C18 7.93 15.93 5.36 13 4.62V4C13 3.45 12.55 3 12 3C11.45 3 11 3.45 11 4V4.62C8.07 5.36 6 7.93 6 11V14.17C6 14.7 5.79 15.21 5.41 15.59L4 17H9M12 21C13.1 21 14 20.1 14 19H10C10 20.1 10.9 21 12 21Z',
  'M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z',
  // calendar, clock, camera, image, file, folder, trash, edit
  'M19 3H18V1H16V3H8V1H6V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z',
  'M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z',
  'M20 5H16.83L15 3H9L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5ZM12 18C9.24 18 7 15.76 7 13S9.24 8 12 8 17 10.24 17 13 14.76 18 12 18ZM12 10C10.34 10 9 11.34 9 13S10.34 16 12 16 15 14.66 15 13 13.66 10 12 10Z',
  'M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z',
  'M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z',
  'M10 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8C22 6.9 21.1 6 20 6H12L10 4Z',
  'M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z',
  'M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z',
  // plus, minus, check, x, arrow-right, arrow-left, chevron-down, menu
  'M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z',
  'M19 13H5V11H19V13Z',
  'M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z',
  'M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z',
  'M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z',
  'M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z',
  'M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z',
  'M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z',
]

// Per-library stroke style hints for placeholder rendering
const LIBRARY_STYLE: Record<string, { strokeWidth: number; round: boolean }> = {
  lucide:    { strokeWidth: 1.5, round: true },
  heroicons: { strokeWidth: 1.5, round: false },
  phosphor:  { strokeWidth: 1.5, round: true },
  tabler:    { strokeWidth: 2, round: false },
  radix:     { strokeWidth: 1.5, round: false },
}

export function IconLibrarySection() {
  const { iconLibrary } = useComponents()
  const { setIconLibrary } = useComponentsActions()
  const spacing = useStore((s) => s.spacing)
  const sizeMap = deriveIconSizeMap(spacing.config)
  const selectedMeta = ICON_LIBRARIES.find((l) => l.name === iconLibrary)!
  const styleHint = LIBRARY_STYLE[iconLibrary]

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
        <p className={styles.previewLabel}>
          {selectedMeta.label} — preview at 24px (md size)
        </p>
        <div className={styles.iconGrid}>
          {PLACEHOLDER_PATHS.map((path, i) => (
            <div key={i} className={styles.iconSlot} title={selectedMeta.previewSlugs[i]}>
              <svg
                className={styles.iconPlaceholder}
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={styleHint.strokeWidth}
                strokeLinecap={styleHint.round ? 'round' : 'square'}
                strokeLinejoin={styleHint.round ? 'round' : 'miter'}
              >
                <path d={path} />
              </svg>
            </div>
          ))}
        </div>
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
