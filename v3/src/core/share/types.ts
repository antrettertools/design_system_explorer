import { z } from 'zod'
import type { ColorSlot } from '../color/types'
import type { FontPairing, TypeScale, TypeScaleStep } from '../typography/types'

// ─── Runtime validation schema ───────────────────────────────────────────────
// Used by decodeShare to reject malformed share URLs before they reach the store.
// Kept separate from the TypeScript interface so both can evolve independently.

const colorSlotSchema = z.object({
  id: z.string(),
  role: z.string(),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  locked: z.boolean(),
  name: z.string().optional(),
})

const fontPairingSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  source: z.enum(['google', 'fontshare', 'bunny']),
  character: z.enum(['editorial', 'expressive', 'technical', 'geometric', 'humanist']),
  harmonyAffinity: z.array(z.string()),
})

const typographyLocksSchema = z.object({
  heading: z.boolean(),
  body: z.boolean(),
  scale: z.boolean(),
})

const typeScaleStepPartialSchema = z.object({
  size: z.number().optional(),
  weight: z.number().optional(),
  lineHeight: z.number().optional(),
  letterSpacing: z.string().optional(),
})

export const shareSnapshotSchema = z.object({
  v: z.literal(3),
  colors: z.array(colorSlotSchema).min(1).max(8),
  harmonyModel: z.string().nullable(),
  pairing: fontPairingSchema,
  typographyLocks: typographyLocksSchema,
  scaleRatio: z.number().min(1.0).max(2.0),
  mode: z.enum(['generator', 'detail']),
  activeTab: z.string().nullable(),
  theme: z.enum(['white', 'light', 'dark']),
  // Optional Phase 2 fields
  spacingBaseUnit: z.union([z.literal(4), z.literal(8)]).optional(),
  shadowMode: z.enum(['colored', 'neutral']).optional(),
  // Optional Phase 3 fields
  stepOverrides: z.record(typeScaleStepPartialSchema).optional(),
  stepLocks: z.record(z.boolean()).optional(),
})

// ─── TypeScript type ─────────────────────────────────────────────────────────

export interface ShareSnapshot {
  v: 3
  colors: ColorSlot[]
  harmonyModel: string | null // stores recipe id (e.g. 'triadic-accent'); legacy HarmonyModelName strings degrade gracefully to null on load
  pairing: FontPairing
  typographyLocks: {
    heading: boolean
    body: boolean
    scale: boolean
  }
  scaleRatio: number
  mode: 'generator' | 'detail'
  activeTab: string | null
  theme: 'white' | 'light' | 'dark'
  // Phase 2 — optional so v3 shares without them still decode
  spacingBaseUnit?: 4 | 8
  shadowMode?: 'colored' | 'neutral'
  // Phase 3 — per-step typography overrides and locks
  stepOverrides?: Partial<Record<keyof TypeScale, Partial<TypeScaleStep>>>
  stepLocks?: Partial<Record<keyof TypeScale, boolean>>
}
