import { useState } from 'react'
import { useTypography, useTypographyActions } from '@/store'
import { SidebarSection, ControlGroup } from '@/components/layout/AppLayout'
import { Slider } from '@/components/controls/Slider'
import { Select } from '@/components/controls/Select'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { FontBrowserGrid } from './FontBrowserGrid'
import { ContrastChecker } from './ContrastChecker'
import { getPairingCandidates } from '@/core/typography/fontDatabase'
import { loadFont } from '@/core/typography/fontLoader'
import { getFontByName } from '@/core/typography/fontDatabase'
import type { FontDefinition, FontCategory, FontSource, ModularRatio, TypeScaleAlgorithm } from '@/core/tokens/types'
import type { FontRole } from './FontBrowserGrid'

const SOURCE_OPTIONS: Array<{ label: string; value: 'all' | FontSource }> = [
  { label: 'All', value: 'all' },
  { label: 'Google', value: 'google' },
  { label: 'Fontshare', value: 'fontshare' },
  { label: 'System', value: 'system' },
]

const CATEGORY_OPTIONS: Array<{ label: string; value: 'all' | FontCategory }> = [
  { label: 'All', value: 'all' },
  { label: 'Sans', value: 'sans' },
  { label: 'Serif', value: 'serif' },
  { label: 'Mono', value: 'mono' },
]

const AXIS_LABELS: Record<string, string> = {
  wght: 'Weight',
  wdth: 'Width',
  slnt: 'Slant',
  ital: 'Italic',
  opsz: 'Optical Size',
  GRAD: 'Grade',
}

const RATIO_OPTIONS: Array<{ label: string; value: ModularRatio }> = [
  { label: 'Major Second (1.125×)', value: 1.125 },
  { label: 'Minor Third (1.2×)',    value: 1.2 },
  { label: 'Major Third (1.25×)',   value: 1.25 },
  { label: 'Perfect Fourth (1.333×)', value: 1.333 },
  { label: 'Augmented Fourth (1.414×)', value: 1.414 },
  { label: 'Perfect Fifth (1.5×)', value: 1.5 },
  { label: 'Golden Ratio (1.618×)', value: 1.618 },
]

const SCALE_OPTIONS: Array<{ label: string; value: TypeScaleAlgorithm }> = [
  { label: 'Modular', value: 'modular' },
  { label: 'Linear', value: 'linear' },
  { label: 'Fluid (clamp)', value: 'fluid' },
]

export function TypographySidebar() {
  const typography = useTypography()
  const actions = useTypographyActions()

  // ── Local UI state ─────────────────────────────────────────────
  const [activeRole, setActiveRole] = useState<FontRole>('heading')
  const [sourceFilter, setSourceFilter] = useState<'all' | FontSource>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | FontCategory>('all')
  const [search, setSearch] = useState('')

  // ── Derived values ─────────────────────────────────────────────
  const isHeading = activeRole === 'heading'
  const currentFamily = isHeading ? typography.headingFamily : typography.bodyFamily
  const currentFont = getFontByName(currentFamily)

  const handleSelect = (font: FontDefinition) => {
    loadFont(font)
    if (isHeading) actions.setHeadingFont(font.name, font.category)
    else actions.setBodyFont(font.name, font.category)
  }

  // Pairing suggestions: suggest a font for the OTHER role
  const suggestions = getPairingCandidates(currentFamily)
    .filter((f) => {
      const otherFamily = isHeading ? typography.bodyFamily : typography.headingFamily
      return f.name !== otherFamily
    })
    .slice(0, 3)

  const applyPairing = (font: FontDefinition) => {
    loadFont(font)
    if (isHeading) actions.setBodyFont(font.name, font.category)
    else actions.setHeadingFont(font.name, font.category)
  }

  return (
    <>
      {/* ── Role switcher ──────────────────────────────────── */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}>
          {(['heading', 'body'] as FontRole[]).map((role) => {
            const family = role === 'heading' ? typography.headingFamily : typography.bodyFamily
            const active = activeRole === role
            return (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                type="button"
                style={{
                  padding: '8px 10px',
                  background: active ? 'var(--accent-bg)' : 'var(--bg-2)',
                  border: 'none',
                  borderRight: role === 'heading' ? '1px solid var(--line)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: active ? 'var(--accent)' : 'var(--text-3)',
                  fontFamily: 'var(--mono)',
                  marginBottom: 3,
                }}>
                  {role}
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: active ? 'var(--text-0)' : 'var(--text-2)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {family}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Per-role controls ──────────────────────────────── */}
      <SidebarSection title={isHeading ? 'Heading Settings' : 'Body Settings'} />
      <ControlGroup>
        {isHeading ? (
          <>
            <Slider
              label="Weight"
              value={typography.headingWeight}
              min={100} max={900} step={100}
              displayValue={String(typography.headingWeight)}
              onChange={actions.setHeadingWeight}
            />
            <Slider
              label="Line Height"
              value={typography.headingLineHeight}
              min={0.9} max={1.8} step={0.05}
              displayValue={typography.headingLineHeight.toFixed(2)}
              onChange={actions.setHeadingLineHeight}
            />
            <Slider
              label="Letter Spacing"
              value={typography.headingLetterSpacing}
              min={-0.1} max={0.2} step={0.005}
              displayValue={`${typography.headingLetterSpacing.toFixed(3)}em`}
              onChange={actions.setHeadingLetterSpacing}
            />
            {/* Heading variable axes */}
            {currentFont?.variable && currentFont.axes && Object.entries(currentFont.axes)
              .filter(([tag]) => tag !== 'wght')
              .map(([tag, range]) => {
                if (!range) return null
                return (
                  <Slider
                    key={tag}
                    label={AXIS_LABELS[tag] ?? tag.toUpperCase()}
                    value={typography.headingExtraAxes[tag] ?? range.default}
                    min={range.min} max={range.max} step={1}
                    displayValue={String(typography.headingExtraAxes[tag] ?? range.default)}
                    onChange={(v) => actions.setHeadingExtraAxis(tag, v)}
                  />
                )
              })}
          </>
        ) : (
          <>
            <Slider
              label="Weight"
              value={typography.bodyWeight}
              min={100} max={900} step={100}
              displayValue={String(typography.bodyWeight)}
              onChange={actions.setBodyWeight}
            />
            <Slider
              label="Line Height"
              value={typography.bodyLineHeight}
              min={1.1} max={2.2} step={0.05}
              displayValue={typography.bodyLineHeight.toFixed(2)}
              onChange={actions.setBodyLineHeight}
            />
            <Slider
              label="Letter Spacing"
              value={typography.bodyLetterSpacing}
              min={-0.05} max={0.2} step={0.005}
              displayValue={`${typography.bodyLetterSpacing.toFixed(3)}em`}
              onChange={actions.setBodyLetterSpacing}
            />
            {/* Body variable axes */}
            {currentFont?.variable && currentFont.axes && Object.entries(currentFont.axes)
              .filter(([tag]) => tag !== 'wght')
              .map(([tag, range]) => {
                if (!range) return null
                return (
                  <Slider
                    key={tag}
                    label={AXIS_LABELS[tag] ?? tag.toUpperCase()}
                    value={typography.bodyExtraAxes[tag] ?? range.default}
                    min={range.min} max={range.max} step={1}
                    displayValue={String(typography.bodyExtraAxes[tag] ?? range.default)}
                    onChange={(v) => actions.setBodyExtraAxis(tag, v)}
                  />
                )
              })}
          </>
        )}
      </ControlGroup>

      {/* ── Pairing suggestions ────────────────────────────── */}
      {suggestions.length > 0 && (
        <>
          <SidebarSection title={isHeading ? 'Suggested Body Fonts' : 'Suggested Heading Fonts'} />
          <ControlGroup>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {suggestions.map((font) => (
                <button
                  key={font.name}
                  onClick={() => applyPairing(font)}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--line)',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>
                    {font.name}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                    {font.category} · {font.source.substring(0, 2).toUpperCase()} → apply
                  </span>
                </button>
              ))}
            </div>
          </ControlGroup>
        </>
      )}

      {/* ── Font browser ───────────────────────────────────── */}
      <SidebarSection title="Font Browser" />
      <div style={{ padding: '0 16px 8px' }}>
        {/* Search */}
        <input
          type="search"
          placeholder="Search fonts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line-2)',
            background: 'var(--bg-2)',
            color: 'var(--text-0)',
            fontSize: 12,
            outline: 'none',
            marginBottom: 8,
            fontFamily: 'var(--sans)',
          }}
        />

        {/* Source filter */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4, fontFamily: 'var(--mono)' }}>
            Source
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {SOURCE_OPTIONS.map((opt) => (
              <FilterPill
                key={opt.value}
                active={sourceFilter === opt.value}
                onClick={() => setSourceFilter(opt.value)}
              >
                {opt.label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4, fontFamily: 'var(--mono)' }}>
            Category
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {CATEGORY_OPTIONS.map((opt) => (
              <FilterPill
                key={opt.value}
                active={categoryFilter === opt.value}
                onClick={() => setCategoryFilter(opt.value)}
              >
                {opt.label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Grid */}
        <FontBrowserGrid
          role={activeRole}
          selectedHeading={typography.headingFamily}
          selectedBody={typography.bodyFamily}
          sourceFilter={sourceFilter}
          categoryFilter={categoryFilter}
          search={search}
          onSelect={handleSelect}
        />
      </div>

      {/* ── Type Scale ─────────────────────────────────────── */}
      <SidebarSection title="Type Scale" />
      <ControlGroup>
        <Slider
          label="Body Base Size"
          value={typography.fontSize}
          min={12} max={24} step={1}
          displayValue={`${typography.fontSize}px`}
          onChange={actions.setFontSize}
        />
        <Select
          label="Scale Algorithm"
          value={typography.scaleAlgorithm}
          options={SCALE_OPTIONS}
          onChange={actions.setScaleAlgorithm}
        />
        {typography.scaleAlgorithm === 'modular' && (
          <Select
            label="Ratio"
            value={String(typography.modularRatio)}
            options={RATIO_OPTIONS.map((o) => ({ label: o.label, value: String(o.value) }))}
            onChange={(v) => actions.setModularRatio(Number(v) as ModularRatio)}
          />
        )}
      </ControlGroup>

      {/* ── Accessibility ──────────────────────────────────── */}
      <SidebarSection title="Contrast Check" />
      <ControlGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Text</div>
            <ColorPicker value={typography.textColor} onChange={actions.setTextColor} label="Text color" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Background</div>
            <ColorPicker value={typography.bgColor} onChange={actions.setBgColor} label="Background color" />
          </div>
        </div>
        <ContrastChecker />
      </ControlGroup>

      {/* ── Custom preview text ────────────────────────────── */}
      <SidebarSection title="Preview Text" />
      <ControlGroup>
        <textarea
          rows={3}
          value={typography.customText}
          onChange={(e) => actions.setCustomText(e.target.value)}
          placeholder="Type custom preview text…"
          style={{
            width: '100%',
            background: 'var(--bg-2)',
            border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-0)',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            padding: '8px 12px',
            outline: 'none',
            resize: 'vertical',
            minHeight: 72,
          }}
        />
      </ControlGroup>
    </>
  )
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '3px 9px',
        borderRadius: 20,
        border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
        background: active ? 'var(--accent-bg)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-3)',
        fontSize: 11,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  )
}
