import { useEffect, useRef } from 'react'

interface HarmonyWheelProps {
  harmonyColors: string[]
  /** Optional — secondary brand color shown as a distinct ◆ marker */
  secondaryHex?: string
  size?: number
}

/**
 * Canvas-based color harmony wheel.
 * Renders a hue/saturation disk and marks:
 *   • harmonyColors[0] = primary (larger white ring)
 *   • harmonyColors[1..n] = harmony positions (smaller rings)
 *   • secondaryHex = secondary brand (diamond marker, accent ring)
 */
export function HarmonyWheel({ harmonyColors, secondaryHex, size = 180 }: HarmonyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const r = size / 2 - 8
    const innerR = r * 0.22

    ctx.clearRect(0, 0, size, size)

    // ── Draw hue wheel ─────────────────────────────────────────
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = ((angle - 0.5) * Math.PI) / 180
      const endAngle = ((angle + 1.5) * Math.PI) / 180

      for (let ri = innerR; ri < r; ri += 1.5) {
        const saturation = (ri - innerR) / (r - innerR)
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, ri, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = `hsl(${angle}, ${saturation * 100}%, 50%)`
        ctx.fill()
      }
    }

    // Dark center
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(13,13,13,0.9)'
    ctx.fill()

    // ── Draw dashed lines from center to harmony positions ─────
    harmonyColors.forEach((hex, i) => {
      if (i === 0) return
      try {
        const { h, s } = hexToHsl(hex)
        const sat = Math.min(s, 1)
        const markerR = innerR + sat * (r - innerR)
        const mx = cx + markerR * Math.cos(((h - 90) * Math.PI) / 180)
        const my = cy + markerR * Math.sin(((h - 90) * Math.PI) / 180)
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(mx, my)
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.stroke()
        ctx.setLineDash([])
      } catch { /* ignore */ }
    })

    // ── Draw secondary brand dashed line ──────────────────────
    if (secondaryHex) {
      try {
        const { h, s } = hexToHsl(secondaryHex)
        const sat = Math.min(s, 1)
        const markerR = innerR + sat * (r - innerR)
        const mx = cx + markerR * Math.cos(((h - 90) * Math.PI) / 180)
        const my = cy + markerR * Math.sin(((h - 90) * Math.PI) / 180)
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(mx, my)
        ctx.strokeStyle = 'rgba(232,168,48,0.35)' // accent amber, subtle
        ctx.lineWidth = 1
        ctx.setLineDash([2, 4])
        ctx.stroke()
        ctx.setLineDash([])
      } catch { /* ignore */ }
    }

    // ── Draw harmony position markers ─────────────────────────
    harmonyColors.forEach((hex, i) => {
      try {
        const { h, s } = hexToHsl(hex)
        const sat = Math.min(s, 1)
        const markerR = innerR + sat * (r - innerR)
        const mx = cx + markerR * Math.cos(((h - 90) * Math.PI) / 180)
        const my = cy + markerR * Math.sin(((h - 90) * Math.PI) / 180)

        const radius = i === 0 ? 9 : 6.5
        ctx.beginPath()
        ctx.arc(mx, my, radius, 0, Math.PI * 2)
        ctx.fillStyle = hex
        ctx.fill()
        ctx.strokeStyle = i === 0 ? '#fff' : 'rgba(255,255,255,0.55)'
        ctx.lineWidth = i === 0 ? 2.5 : 1.5
        ctx.stroke()
      } catch { /* ignore */ }
    })

    // ── Draw secondary brand marker (diamond shape) ───────────
    if (secondaryHex) {
      try {
        const { h, s } = hexToHsl(secondaryHex)
        const sat = Math.min(s, 1)
        const markerR = innerR + sat * (r - innerR)
        const mx = cx + markerR * Math.cos(((h - 90) * Math.PI) / 180)
        const my = cy + markerR * Math.sin(((h - 90) * Math.PI) / 180)
        const d = 7 // half-size of diamond

        ctx.beginPath()
        ctx.moveTo(mx, my - d)
        ctx.lineTo(mx + d, my)
        ctx.lineTo(mx, my + d)
        ctx.lineTo(mx - d, my)
        ctx.closePath()
        ctx.fillStyle = secondaryHex
        ctx.fill()
        ctx.strokeStyle = '#e8a830' // accent amber ring
        ctx.lineWidth = 2
        ctx.stroke()
      } catch { /* ignore */ }
    }
  }, [harmonyColors, secondaryHex, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ borderRadius: '50%', display: 'block' }}
    />
  )
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const n = parseInt(hex.replace('#', ''), 16)
  let r = ((n >> 16) & 0xff) / 255
  let g = ((n >> 8) & 0xff) / 255
  let b = (n & 0xff) / 255

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
