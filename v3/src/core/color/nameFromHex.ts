/**
 * Returns a human-readable color name for a given hex value.
 * Low-chroma colours get neutral names; high-chroma colours get hue names.
 */

interface HslResult {
  h: number  // 0-360
  s: number  // 0-1
  l: number  // 0-1
}

function hexToHsl(hex: string): HslResult | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const r = parseInt(m[1].slice(0, 2), 16) / 255
  const g = parseInt(m[1].slice(2, 4), 16) / 255
  const b = parseInt(m[1].slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s, l }
}

// Ordered by hue angle — covers the full 360° wheel
const HUE_NAMES: Array<{ max: number; name: string }> = [
  { max:  15, name: 'Crimson'    },
  { max:  25, name: 'Red'        },
  { max:  35, name: 'Vermillion' },
  { max:  50, name: 'Orange'     },
  { max:  60, name: 'Amber'      },
  { max:  70, name: 'Gold'       },
  { max:  80, name: 'Yellow'     },
  { max:  95, name: 'Lime'       },
  { max: 115, name: 'Green'      },
  { max: 140, name: 'Emerald'    },
  { max: 158, name: 'Jade'       },
  { max: 175, name: 'Teal'       },
  { max: 190, name: 'Cyan'       },
  { max: 210, name: 'Sky'        },
  { max: 230, name: 'Azure'      },
  { max: 248, name: 'Blue'       },
  { max: 262, name: 'Indigo'     },
  { max: 278, name: 'Violet'     },
  { max: 295, name: 'Purple'     },
  { max: 315, name: 'Plum'       },
  { max: 330, name: 'Fuchsia'    },
  { max: 345, name: 'Rose'       },
  { max: 360, name: 'Crimson'    },
]

function hueName(h: number): string {
  return HUE_NAMES.find(e => h < e.max)?.name ?? 'Crimson'
}

export function nameFromHex(hex: string): string {
  const hsl = hexToHsl(hex)
  if (!hsl) return 'Color'

  const { h, s, l } = hsl

  // Near-white / near-black — neutral names by lightness
  if (l > 0.92) return 'Snow'
  if (l < 0.08) return 'Onyx'

  // Low saturation — neutral names
  if (s < 0.08) {
    if (l > 0.80) return 'Chalk'
    if (l > 0.65) return 'Silver'
    if (l > 0.45) return 'Stone'
    if (l > 0.28) return 'Slate'
    return 'Charcoal'
  }

  // Moderate saturation — muted modifier
  const base = hueName(h)
  if (s < 0.25) return `Dusty ${base}`
  if (s < 0.45) return `Muted ${base}`

  // High saturation — pure hue name
  return base
}
