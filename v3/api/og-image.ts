import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * GET /api/og-image?colors=hex1,hex2,...&name=My+Design
 *
 * Returns a 1200×630 SVG suitable for og:image tags.
 * - colors: comma-separated URL-encoded hex values (e.g. %23e8543a,%232563eb)
 * - name: design system name (optional, defaults to "Design System")
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const rawColors = typeof req.query.colors === 'string' ? req.query.colors : ''
  const name = typeof req.query.name === 'string'
    ? req.query.name.slice(0, 60)
    : 'Design System'

  // Parse and validate hex values
  const colors = rawColors
    .split(',')
    .map(c => c.trim())
    .filter(c => /^#[0-9a-fA-F]{6}$/.test(c))
    .slice(0, 8)

  if (colors.length === 0) {
    res.status(400).json({ error: 'Provide at least one valid hex color via ?colors=' })
    return
  }

  const W = 1200
  const H = 630
  const SWATCH_AREA_H = 360
  const SWATCH_Y = 170
  const SWATCH_GAP = 16
  const SWATCH_W = Math.floor((W - 80 - (colors.length - 1) * SWATCH_GAP) / colors.length)
  const SWATCH_H = SWATCH_AREA_H
  const SWATCH_R = 16

  const swatches = colors
    .map((hex, i) => {
      const x = 40 + i * (SWATCH_W + SWATCH_GAP)
      return `<rect x="${x}" y="${SWATCH_Y}" width="${SWATCH_W}" height="${SWATCH_H}" rx="${SWATCH_R}" fill="${hex}" />`
    })
    .join('\n    ')

  // Compute background from first color luminance — light or dark card
  const r = parseInt(colors[0].slice(1, 3), 16)
  const g = parseInt(colors[0].slice(3, 5), 16)
  const b = parseInt(colors[0].slice(5, 7), 16)
  const lum = (r * 299 + g * 587 + b * 114) / 1000
  const bgColor   = lum > 180 ? '#1a1a1a' : '#fafaf9'
  const textColor = lum > 180 ? '#f0f0ee' : '#1a1a1a'
  const subColor  = lum > 180 ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${bgColor}" />

  <!-- Title -->
  <text
    x="40" y="96"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="52" font-weight="800" letter-spacing="-1.5"
    fill="${textColor}"
  >${escapeXml(name)}</text>

  <!-- Subtitle -->
  <text
    x="40" y="140"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="22" font-weight="400"
    fill="${subColor}"
  >${colors.length} color${colors.length !== 1 ? 's' : ''} · dsygn.cloud</text>

  <!-- Swatches -->
  ${swatches}

  <!-- Bottom brand mark -->
  <text
    x="${W - 40}" y="${H - 28}"
    text-anchor="end"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="18" font-weight="700" letter-spacing="-0.3"
    fill="${subColor}"
  >dsygn.cloud</text>
</svg>`

  res.setHeader('Content-Type', 'image/svg+xml')
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
  res.status(200).send(svg)
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
