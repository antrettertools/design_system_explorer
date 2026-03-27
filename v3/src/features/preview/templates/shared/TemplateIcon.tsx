/**
 * TemplateIcon — renders an icon from the currently selected icon library.
 * Mirrors the icon maps in IconLibrarySection so templates stay in sync with
 * the user's chosen icon set.
 */

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
import { useComponents } from '@/store'
import type { IconLibraryName } from '@/core/components/types'

export type IconSlug =
  | 'home' | 'search' | 'settings' | 'user' | 'heart' | 'star'
  | 'bell' | 'mail' | 'calendar' | 'clock' | 'camera' | 'image'
  | 'file' | 'folder' | 'trash' | 'edit' | 'plus' | 'minus'
  | 'check' | 'x' | 'arrow-right' | 'arrow-left' | 'chevron-down' | 'menu'

type GenericIcon = React.ComponentType<{
  size?: number; width?: number; height?: number
  strokeWidth?: number; weight?: string
  className?: string; style?: React.CSSProperties
}>
type LucideIcon = React.ComponentType<LucideProps>

const LUCIDE_MAP: Record<IconSlug, LucideIcon> = {
  home: Home, search: Search, settings: Settings, user: User,
  heart: Heart, star: Star, bell: Bell, mail: Mail,
  calendar: Calendar, clock: Clock, camera: Camera, image: Image,
  file: File, folder: Folder, trash: Trash2, edit: Pencil,
  plus: Plus, minus: Minus, check: Check, x: X,
  'arrow-right': ArrowRight, 'arrow-left': ArrowLeft,
  'chevron-down': ChevronDown, menu: Menu,
}

const HEROICONS_MAP: Record<IconSlug, GenericIcon> = {
  home: HeroHome as GenericIcon, search: HeroSearch as GenericIcon,
  settings: HeroSettings as GenericIcon, user: HeroUser as GenericIcon,
  heart: HeroHeart as GenericIcon, star: HeroStar as GenericIcon,
  bell: HeroBell as GenericIcon, mail: HeroMail as GenericIcon,
  calendar: HeroCalendar as GenericIcon, clock: HeroClock as GenericIcon,
  camera: HeroCamera as GenericIcon, image: HeroImage as GenericIcon,
  file: HeroFile as GenericIcon, folder: HeroFolder as GenericIcon,
  trash: HeroTrash as GenericIcon, edit: HeroEdit as GenericIcon,
  plus: HeroPlus as GenericIcon, minus: HeroMinus as GenericIcon,
  check: HeroCheck as GenericIcon, x: HeroX as GenericIcon,
  'arrow-right': HeroArrowRight as GenericIcon, 'arrow-left': HeroArrowLeft as GenericIcon,
  'chevron-down': HeroChevronDown as GenericIcon, menu: HeroMenu as GenericIcon,
}

const PHOSPHOR_MAP: Record<IconSlug, GenericIcon> = {
  home: PhosphorHome as GenericIcon, search: PhosphorSearch as GenericIcon,
  settings: PhosphorSettings as GenericIcon, user: PhosphorUser as GenericIcon,
  heart: PhosphorHeart as GenericIcon, star: PhosphorStar as GenericIcon,
  bell: PhosphorBell as GenericIcon, mail: PhosphorMail as GenericIcon,
  calendar: PhosphorCalendar as GenericIcon, clock: PhosphorClock as GenericIcon,
  camera: PhosphorCamera as GenericIcon, image: PhosphorImage as GenericIcon,
  file: PhosphorFile as GenericIcon, folder: PhosphorFolder as GenericIcon,
  trash: PhosphorTrash as GenericIcon, edit: PhosphorEdit as GenericIcon,
  plus: PhosphorPlus as GenericIcon, minus: PhosphorMinus as GenericIcon,
  check: PhosphorCheck as GenericIcon, x: PhosphorX as GenericIcon,
  'arrow-right': PhosphorArrowRight as GenericIcon, 'arrow-left': PhosphorArrowLeft as GenericIcon,
  'chevron-down': PhosphorChevronDown as GenericIcon, menu: PhosphorMenu as GenericIcon,
}

const TABLER_MAP: Record<IconSlug, GenericIcon> = {
  home: TablerHome as GenericIcon, search: TablerSearch as GenericIcon,
  settings: TablerSettings as GenericIcon, user: TablerUser as GenericIcon,
  heart: TablerHeart as GenericIcon, star: TablerStar as GenericIcon,
  bell: TablerBell as GenericIcon, mail: TablerMail as GenericIcon,
  calendar: TablerCalendar as GenericIcon, clock: TablerClock as GenericIcon,
  camera: TablerCamera as GenericIcon, image: TablerImage as GenericIcon,
  file: TablerFile as GenericIcon, folder: TablerFolder as GenericIcon,
  trash: TablerTrash as GenericIcon, edit: TablerEdit as GenericIcon,
  plus: TablerPlus as GenericIcon, minus: TablerMinus as GenericIcon,
  check: TablerCheck as GenericIcon, x: TablerX as GenericIcon,
  'arrow-right': TablerArrowRight as GenericIcon, 'arrow-left': TablerArrowLeft as GenericIcon,
  'chevron-down': TablerChevronDown as GenericIcon, menu: TablerMenu as GenericIcon,
}

const RADIX_MAP: Record<IconSlug, GenericIcon> = {
  home: RadixHome as GenericIcon, search: RadixSearch as GenericIcon,
  settings: RadixSettings as GenericIcon, user: RadixUser as GenericIcon,
  heart: RadixHeart as GenericIcon, star: RadixStar as GenericIcon,
  bell: RadixBell as GenericIcon, mail: RadixMail as GenericIcon,
  calendar: RadixCalendar as GenericIcon, clock: RadixClock as GenericIcon,
  camera: RadixCamera as GenericIcon, image: RadixImage as GenericIcon,
  file: RadixFile as GenericIcon, folder: RadixFolder as GenericIcon,
  trash: RadixTrash as GenericIcon, edit: RadixEdit as GenericIcon,
  plus: RadixPlus as GenericIcon, minus: RadixMinus as GenericIcon,
  check: RadixCheck as GenericIcon, x: RadixX as GenericIcon,
  'arrow-right': RadixArrowRight as GenericIcon, 'arrow-left': RadixArrowLeft as GenericIcon,
  'chevron-down': RadixChevronDown as GenericIcon, menu: RadixMenu as GenericIcon,
}

const LIBRARY_MAPS: Record<IconLibraryName, Record<IconSlug, GenericIcon | LucideIcon>> = {
  lucide: LUCIDE_MAP,
  heroicons: HEROICONS_MAP,
  phosphor: PHOSPHOR_MAP,
  tabler: TABLER_MAP,
  radix: RADIX_MAP,
}

export interface TemplateIconProps {
  slug: IconSlug
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function TemplateIcon({ slug, size = 16, className, style }: TemplateIconProps) {
  const { iconLibrary } = useComponents()
  const map = LIBRARY_MAPS[iconLibrary] ?? LUCIDE_MAP
  const IconComponent = map[slug]
  if (!IconComponent) return null

  const sizeProps = iconLibrary === 'heroicons' || iconLibrary === 'radix'
    ? { width: size, height: size }
    : { size }

  const extraProps = iconLibrary === 'lucide' || iconLibrary === 'tabler'
    ? { strokeWidth: 1.5 }
    : iconLibrary === 'phosphor'
    ? { weight: 'regular' as const }
    : {}

  return <IconComponent {...sizeProps} {...extraProps} className={className} style={style} />
}
