import { useState } from 'react'
import {
  Home, Search, Settings, User, Heart, Star,
  Bell, Mail, Calendar, Clock, Camera, Image,
  File, Folder, Trash2, Pencil, Plus, Minus,
  Check, X, ArrowRight, ArrowLeft, ChevronDown, Menu,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import {
  HomeIcon as HeroHome, MagnifyingGlassIcon as HeroSearch,
  Cog6ToothIcon as HeroSettings, UserIcon as HeroUser,
  HeartIcon as HeroHeart, StarIcon as HeroStar,
  BellIcon as HeroBell, EnvelopeIcon as HeroMail,
  CalendarIcon as HeroCalendar, ClockIcon as HeroClock,
  CameraIcon as HeroCamera, PhotoIcon as HeroImage,
  DocumentIcon as HeroFile, FolderIcon as HeroFolder,
  TrashIcon as HeroTrash, PencilIcon as HeroEdit,
  PlusIcon as HeroPlus, MinusIcon as HeroMinus,
  CheckIcon as HeroCheck, XMarkIcon as HeroX,
  ArrowRightIcon as HeroArrowRight, ArrowLeftIcon as HeroArrowLeft,
  ChevronDownIcon as HeroChevronDown, Bars3Icon as HeroMenu,
} from '@heroicons/react/24/outline'
import {
  House as PhosphorHome, MagnifyingGlass as PhosphorSearch,
  Gear as PhosphorSettings, User as PhosphorUser,
  Heart as PhosphorHeart, Star as PhosphorStar,
  Bell as PhosphorBell, Envelope as PhosphorMail,
  Calendar as PhosphorCalendar, Clock as PhosphorClock,
  Camera as PhosphorCamera, Image as PhosphorImage,
  File as PhosphorFile, Folder as PhosphorFolder,
  Trash as PhosphorTrash, Pencil as PhosphorEdit,
  Plus as PhosphorPlus, Minus as PhosphorMinus,
  Check as PhosphorCheck, X as PhosphorX,
  ArrowRight as PhosphorArrowRight, ArrowLeft as PhosphorArrowLeft,
  CaretDown as PhosphorChevronDown, List as PhosphorMenu,
} from '@phosphor-icons/react'
import {
  IconHome as TablerHome, IconSearch as TablerSearch,
  IconSettings as TablerSettings, IconUser as TablerUser,
  IconHeart as TablerHeart, IconStar as TablerStar,
  IconBell as TablerBell, IconMail as TablerMail,
  IconCalendar as TablerCalendar, IconClock as TablerClock,
  IconCamera as TablerCamera, IconPhoto as TablerImage,
  IconFile as TablerFile, IconFolder as TablerFolder,
  IconTrash as TablerTrash, IconPencil as TablerEdit,
  IconPlus as TablerPlus, IconMinus as TablerMinus,
  IconCheck as TablerCheck, IconX as TablerX,
  IconArrowRight as TablerArrowRight, IconArrowLeft as TablerArrowLeft,
  IconChevronDown as TablerChevronDown, IconMenu2 as TablerMenu,
} from '@tabler/icons-react'
import {
  HomeIcon as RadixHome, MagnifyingGlassIcon as RadixSearch,
  GearIcon as RadixSettings, PersonIcon as RadixUser,
  HeartIcon as RadixHeart, StarIcon as RadixStar,
  BellIcon as RadixBell, EnvelopeClosedIcon as RadixMail,
  CalendarIcon as RadixCalendar, ClockIcon as RadixClock,
  CameraIcon as RadixCamera, ImageIcon as RadixImage,
  BoxIcon as RadixFile, BoxIcon as RadixFolder,
  TrashIcon as RadixTrash, Pencil1Icon as RadixEdit,
  PlusIcon as RadixPlus, MinusIcon as RadixMinus,
  CheckIcon as RadixCheck, Cross1Icon as RadixX,
  ArrowRightIcon as RadixArrowRight, ArrowLeftIcon as RadixArrowLeft,
  ChevronDownIcon as RadixChevronDown, HamburgerMenuIcon as RadixMenu,
} from '@radix-ui/react-icons'
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

type LucideIconComponent = React.ComponentType<LucideProps>
type GenericIconComponent = React.ComponentType<{ size?: number; width?: number; height?: number; strokeWidth?: number; weight?: string }>

const LUCIDE_ICON_MAP: Record<string, LucideIconComponent> = {
  home: Home, search: Search, settings: Settings, user: User,
  heart: Heart, star: Star, bell: Bell, mail: Mail,
  calendar: Calendar, clock: Clock, camera: Camera, image: Image,
  file: File, folder: Folder, trash: Trash2, edit: Pencil,
  plus: Plus, minus: Minus, check: Check, x: X,
  'arrow-right': ArrowRight, 'arrow-left': ArrowLeft,
  'chevron-down': ChevronDown, menu: Menu,
}

const HEROICONS_MAP: Record<string, GenericIconComponent> = {
  home: HeroHome, search: HeroSearch, settings: HeroSettings, user: HeroUser,
  heart: HeroHeart, star: HeroStar, bell: HeroBell, mail: HeroMail,
  calendar: HeroCalendar, clock: HeroClock, camera: HeroCamera, image: HeroImage,
  file: HeroFile, folder: HeroFolder, trash: HeroTrash, edit: HeroEdit,
  plus: HeroPlus, minus: HeroMinus, check: HeroCheck, x: HeroX,
  'arrow-right': HeroArrowRight, 'arrow-left': HeroArrowLeft,
  'chevron-down': HeroChevronDown, menu: HeroMenu,
}

const PHOSPHOR_MAP: Record<string, GenericIconComponent> = {
  home: PhosphorHome, search: PhosphorSearch, settings: PhosphorSettings, user: PhosphorUser,
  heart: PhosphorHeart, star: PhosphorStar, bell: PhosphorBell, mail: PhosphorMail,
  calendar: PhosphorCalendar, clock: PhosphorClock, camera: PhosphorCamera, image: PhosphorImage,
  file: PhosphorFile, folder: PhosphorFolder, trash: PhosphorTrash, edit: PhosphorEdit,
  plus: PhosphorPlus, minus: PhosphorMinus, check: PhosphorCheck, x: PhosphorX,
  'arrow-right': PhosphorArrowRight, 'arrow-left': PhosphorArrowLeft,
  'chevron-down': PhosphorChevronDown, menu: PhosphorMenu,
}

const TABLER_MAP: Record<string, GenericIconComponent> = {
  home: TablerHome, search: TablerSearch, settings: TablerSettings, user: TablerUser,
  heart: TablerHeart, star: TablerStar, bell: TablerBell, mail: TablerMail,
  calendar: TablerCalendar, clock: TablerClock, camera: TablerCamera, image: TablerImage,
  file: TablerFile, folder: TablerFolder, trash: TablerTrash, edit: TablerEdit,
  plus: TablerPlus, minus: TablerMinus, check: TablerCheck, x: TablerX,
  'arrow-right': TablerArrowRight, 'arrow-left': TablerArrowLeft,
  'chevron-down': TablerChevronDown, menu: TablerMenu,
}

const RADIX_MAP: Record<string, GenericIconComponent> = {
  home: RadixHome, search: RadixSearch, settings: RadixSettings, user: RadixUser,
  heart: RadixHeart, star: RadixStar, bell: RadixBell, mail: RadixMail,
  calendar: RadixCalendar, clock: RadixClock, camera: RadixCamera, image: RadixImage,
  file: RadixFile, folder: RadixFolder, trash: RadixTrash, edit: RadixEdit,
  plus: RadixPlus, minus: RadixMinus, check: RadixCheck, x: RadixX,
  'arrow-right': RadixArrowRight, 'arrow-left': RadixArrowLeft,
  'chevron-down': RadixChevronDown, menu: RadixMenu,
}

const LIBRARY_MAPS: Record<string, Record<string, GenericIconComponent | LucideIconComponent>> = {
  lucide: LUCIDE_ICON_MAP,
  heroicons: HEROICONS_MAP,
  phosphor: PHOSPHOR_MAP,
  tabler: TABLER_MAP,
  radix: RADIX_MAP,
}

function getLucideIcon(slug: string): LucideIconComponent | null {
  return LUCIDE_ICON_MAP[slug] ?? null
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

        <div className={styles.iconGrid}>
          {SLUGS.map((slug) => {
            const iconMap = LIBRARY_MAPS[iconLibrary]
            const Icon = iconMap?.[slug] as GenericIconComponent | undefined
            const sizeProps = iconLibrary === 'heroicons' || iconLibrary === 'radix'
              ? { width: iconSize, height: iconSize }
              : { size: iconSize }
            const strokeProps = iconLibrary === 'lucide'
              ? { strokeWidth: 1.5 }
              : iconLibrary === 'tabler'
              ? { stroke: 1.5 }
              : iconLibrary === 'phosphor'
              ? { weight: 'regular' as const }
              : {}
            return (
              <div key={slug} className={styles.iconCell} title={slug}>
                {Icon
                  ? <Icon {...sizeProps} {...strokeProps} />
                  : <span className={styles.iconMissing}>?</span>
                }
              </div>
            )
          })}
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
