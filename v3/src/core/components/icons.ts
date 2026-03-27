import type { IconLibraryMeta, IconLibraryName, IconSizeMap } from './types'
import type { SpacingConfig } from '@/core/spacing/types'

// Common icon slugs used for preview across all libraries.
// We render inline SVG paths for these — no icon package install needed in Phase 3.
const COMMON_SLUGS = [
  'home', 'search', 'settings', 'user', 'heart', 'star',
  'bell', 'mail', 'calendar', 'clock', 'camera', 'image',
  'file', 'folder', 'trash', 'edit', 'plus', 'minus',
  'check', 'x', 'arrow-right', 'arrow-left', 'chevron-down', 'menu',
]

export const ICON_LIBRARIES: IconLibraryMeta[] = [
  {
    name: 'lucide',
    label: 'Lucide',
    packageName: 'lucide-react',
    previewSlugs: COMMON_SLUGS,
  },
  {
    name: 'heroicons',
    label: 'Heroicons',
    packageName: '@heroicons/react',
    previewSlugs: COMMON_SLUGS,
  },
  {
    name: 'phosphor',
    label: 'Phosphor',
    packageName: '@phosphor-icons/react',
    previewSlugs: COMMON_SLUGS,
  },
  {
    name: 'tabler',
    label: 'Tabler',
    packageName: '@tabler/icons-react',
    previewSlugs: COMMON_SLUGS,
  },
  {
    name: 'radix',
    label: 'Radix Icons',
    packageName: '@radix-ui/react-icons',
    previewSlugs: COMMON_SLUGS,
  },
]

// Icon sizes are fixed optical sizing values (12/16/20/24/32 px).
// They are NOT derived from spacing multipliers because icons have their own
// optical conventions that differ from layout spacing.
export function deriveIconSizeMap(_spacing: SpacingConfig): IconSizeMap {
  return {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  }
}

export function getLibraryMeta(name: IconLibraryName): IconLibraryMeta {
  const lib = ICON_LIBRARIES.find((l) => l.name === name)
  if (!lib) throw new Error(`Unknown icon library: ${name}`)
  return lib
}
