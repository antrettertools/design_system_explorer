import React from 'react'
import { Home, Search, Settings, User, Heart, Star } from 'lucide-react'
import {
  HomeIcon as HeroHome, MagnifyingGlassIcon as HeroSearch,
  Cog6ToothIcon as HeroSettings, UserIcon as HeroUser,
  HeartIcon as HeroHeart, StarIcon as HeroStar,
} from '@heroicons/react/24/outline'
import {
  House as PhosphorHome, MagnifyingGlass as PhosphorSearch,
  Gear as PhosphorSettings, User as PhosphorUser,
  Heart as PhosphorHeart, Star as PhosphorStar,
} from '@phosphor-icons/react'
import {
  IconHome as TablerHome, IconSearch as TablerSearch,
  IconSettings as TablerSettings, IconUser as TablerUser,
  IconHeart as TablerHeart, IconStar as TablerStar,
} from '@tabler/icons-react'
import {
  HomeIcon as RadixHome, MagnifyingGlassIcon as RadixSearch,
  GearIcon as RadixSettings, PersonIcon as RadixUser,
  HeartIcon as RadixHeart, StarIcon as RadixStar,
} from '@radix-ui/react-icons'
import { useComponents, useComponentsActions, useStore } from '@/store'
import { ICON_LIBRARIES } from '@/core/components/icons'
import type { ComponentName, ComponentVariantKey } from '@/core/components/types'
import styles from './ComponentsSummaryCard.module.css'

type IconComp = React.ComponentType<{ size?: number | string; width?: number | string; height?: number | string; strokeWidth?: number | string }>

const PREVIEW_ICONS: Record<string, IconComp[]> = {
  lucide:    [Home, Search, Settings, User, Heart, Star],
  heroicons: [HeroHome, HeroSearch, HeroSettings, HeroUser, HeroHeart, HeroStar],
  phosphor:  [PhosphorHome, PhosphorSearch, PhosphorSettings, PhosphorUser, PhosphorHeart, PhosphorStar],
  tabler:    [TablerHome, TablerSearch, TablerSettings, TablerUser, TablerHeart, TablerStar],
  radix:     [RadixHome, RadixSearch, RadixSettings, RadixUser, RadixHeart, RadixStar],
}

const COMPONENT_ORDER: ComponentName[] = ['button', 'input', 'card', 'badge', 'tag', 'tooltip', 'alert']

const ALL_VARIANT_KEYS: Record<ComponentName, ComponentVariantKey[]> = {
  button:  ['button', 'button-secondary', 'button-ghost', 'button-destructive'],
  input:   ['input'],
  card:    ['card'],
  badge:   ['badge', 'badge-neutral', 'badge-error', 'badge-warning', 'badge-success', 'badge-info', 'badge-secondary', 'badge-accent-a', 'badge-accent-b'],
  tag:     ['tag', 'tag-neutral', 'tag-secondary', 'tag-accent-a', 'tag-accent-b'],
  tooltip: ['tooltip', 'tooltip-light'],
  alert:   ['alert'],
}

const SLOT_VARIANT_ROLES: Record<ComponentName, { role: string; key: ComponentVariantKey }[]> = {
  button: [], input: [], card: [],
  badge: [
    { role: 'secondary', key: 'badge-secondary' },
    { role: 'accentA',   key: 'badge-accent-a' },
    { role: 'accentB',   key: 'badge-accent-b' },
  ],
  tag: [
    { role: 'secondary', key: 'tag-secondary' },
    { role: 'accentA',   key: 'tag-accent-a' },
    { role: 'accentB',   key: 'tag-accent-b' },
  ],
  tooltip: [], alert: [],
}

/** Tiny inline specimen rendered with actual CSS component vars */
function MiniSpecimen({ comp }: { comp: ComponentName }) {
  switch (comp) {
    case 'button':
      return (
        <button className={styles.specimenBtn}>
          Action
        </button>
      )
    case 'input':
      return (
        <input
          className={styles.specimenInput}
          placeholder="Text…"
          readOnly
        />
      )
    case 'card':
      return (
        <div className={styles.specimenCard}>
          <div className={styles.specimenCardTitle}>Title</div>
          <div className={styles.specimenCardBody}>Card content here.</div>
        </div>
      )
    case 'badge':
      return (
        <div className={styles.specimenBadgeGroup}>
          <span className={styles.specimenBadge}>Brand</span>
          <span className={styles.specimenBadgeNeutral}>Neutral</span>
        </div>
      )
    case 'tag':
      return (
        <div className={styles.specimenTagGroup}>
          <span className={styles.specimenTag}>Design <span className={styles.specimenTagX}>×</span></span>
          <span className={styles.specimenTagNeutral}>System <span className={styles.specimenTagX}>×</span></span>
        </div>
      )
    case 'tooltip':
      return (
        <div className={styles.specimenTooltip}>
          Tooltip text
        </div>
      )
    case 'alert':
      return (
        <div className={styles.specimenAlert}>
          <span className={styles.specimenAlertIcon}>ℹ</span>
          <span>Info alert message</span>
        </div>
      )
    default:
      return null
  }
}

export function ComponentsSummaryCard() {
  const { iconLibrary, overrides } = useComponents()
  const { setIconLibrary } = useComponentsActions()
  const slots = useStore(s => s.color.slots)

  const icons = PREVIEW_ICONS[iconLibrary] ?? PREVIEW_ICONS.lucide
  const sizeProps = (iconLibrary === 'heroicons' || iconLibrary === 'radix')
    ? { width: 16, height: 16 }
    : { size: 16 }
  const strokeProps = iconLibrary === 'lucide' ? { strokeWidth: 1.5 } : {}

  const slotRoles = new Set(slots.map(s => s.role))
  function overrideCountFor(comp: ComponentName): number {
    const validKeys = ALL_VARIANT_KEYS[comp].filter(k => {
      const slotDep = SLOT_VARIANT_ROLES[comp].find(sv => sv.key === k)
      return !slotDep || slotRoles.has(slotDep.role as never)
    })
    return validKeys.reduce((sum, vk) => sum + Object.keys(overrides[vk] ?? {}).length, 0)
  }

  const totalOverrides = COMPONENT_ORDER.reduce((sum, c) => sum + overrideCountFor(c), 0)

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Components</div>

      <div className={styles.card}>
        {/* Icon library row */}
        <div className={styles.row}>
          <div className={styles.rowMeta}>
            <span className={styles.rowRole}>Icon Library</span>
            <span className={styles.rowName}>
              {ICON_LIBRARIES.find(l => l.name === iconLibrary)?.label ?? iconLibrary}
            </span>
          </div>

          <div className={styles.iconStrip}>
            {icons.map((Icon, i) => (
              <div key={i} className={styles.iconCell}>
                <Icon {...sizeProps} {...strokeProps} />
              </div>
            ))}
          </div>

          <div className={styles.libraryToggle}>
            {ICON_LIBRARIES.map(lib => (
              <button
                key={lib.name}
                className={`${styles.libBtn} ${iconLibrary === lib.name ? styles.libBtnActive : ''}`}
                onClick={() => setIconLibrary(lib.name)}
                aria-pressed={iconLibrary === lib.name}
                title={lib.label}
              >
                {lib.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        {/* Component specimens strip */}
        <div className={styles.specimensRow}>
          {COMPONENT_ORDER.map(comp => {
            const count = overrideCountFor(comp)
            return (
              <div
                key={comp}
                className={`${styles.specimenCell} ${count > 0 ? styles.specimenCellOverridden : ''}`}
                title={count > 0 ? `${count} token${count === 1 ? '' : 's'} overridden` : undefined}
              >
                <div className={styles.specimenContent}>
                  <MiniSpecimen comp={comp} />
                </div>
                <div className={styles.specimenFooter}>
                  <span className={styles.specimenLabel}>{comp}</span>
                  {count > 0 && <span className={styles.specimenCount}>{count}</span>}
                </div>
              </div>
            )
          })}
          {totalOverrides > 0 && (
            <div className={styles.totalHintCell}>
              <span className={styles.totalHint}>{totalOverrides} override{totalOverrides === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
