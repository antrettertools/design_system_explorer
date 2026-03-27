import { useState } from 'react'
import { useTypography, useTypographyActions } from '@/store'
import { Slider } from '@/components/controls/Slider'
import { Select } from '@/components/controls/Select'
import { ColorPicker } from '@/components/controls/ColorPicker'
import { FontBrowserGrid } from './FontBrowserGrid'
import { ContrastChecker } from './ContrastChecker'
import { getPairingCandidates } from '@/core/typography/fontDatabase'
import { loadFont } from '@/core/typography/fontLoader'
import { getFontByName } from '@/core/typography/fontDatabase'
import { MODULAR_RATIOS } from '@/core/typography/scale'
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

const SCALE_OPTIONS: Array<{ label: string; value: TypeScaleAlgorithm }> = [
  { label: 'Modular', value: 'modular' },
  { label: 'Linear', value: 'linear' },
  { label: 'Fluid (clamp)', value: 'fluid' },
]

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--chrome-text-subtle)',
  fontFamily: 'var(--chrome-font-mono)',
  padding: '12px 16px 6px',
  borderTop: '1px solid var(--chrome-border)',
  marginTop: 4,
}

const groupStyle: React.CSSProperties = {
  padding: '0 16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

export function TypographySidebar() {
  const typography = useTypography()
  const actions = useTypographyActions()

  const [activeRole, setActiveRole] = useState<FontRole>('heading')
  const [sourceFilter, setSourceFilter] = useState<'all' | FontSource>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | FontCategory>('all')
  const [search, setSearch] = useState('')

  const isHeading = activeRole === 'heading'
  const currentFamily = isHeading ? typography.headingFamily : typography.bodyFamily
  const currentFont = getFontByName(currentFamily)

  const handleSelect = (font: FontDefinition) => {
    loadFont(font)
    if (isHeading) actions.setHeadingFont(font.name, font.category)
    else actions.setBodyFont(font.name, font.category)
  }

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
      {/* Role switcher */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderRadius: 'var(--chrome-radius)',
          overflow: 'hidden',
          border: '1px solid var(--chrome-border)',
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
                  background: active ? 'rgba(232,168,48,0.08)' : 'var(--chrome-surface)',
                  border: 'none',
                  borderRight: role === 'heading' ? '1px solid var(--chrome-border)' : 'none',
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
                  color: active ? 'var(--chrome-accent)' : 'var(--chrome-text-subtle)',
                  fontFamily: 'var(--chrome-font-mono)',
                  marginBottom: 3,
                }}>
                  {role}
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: active ? 'var(--chrome-text)' : 'var(--chrome-text-subtle)',
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

      {/* Per-role controls */}
      <div style={sectionTitleStyle}>{isHeading ? 'Heading Settings' : 'Body Settings'}</div>
      <div style={groupStyle}>
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
      </div>

      {/* Pairing suggestions */}
      {suggestions.length > 0 && (
        <>
          <div style={sectionTitleStyle}>
            {isHeading ? 'Suggested Body Fonts' : 'Suggested Heading Fonts'}
          </div>
          <div style={groupStyle}>
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
                    borderRadius: 'var(--chrome-radius)',
                    background: 'var(--chrome-surface)',
                    border: '1px solid var(--chrome-border)',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--chrome-text)' }}>
                    {font.name}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--chrome-text-subtle)', fontFamily: 'var(--chrome-font-mono)' }}>
                    {font.category} · {font.source.substring(0, 2).toUpperCase()} → apply
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Font browser */}
      <div style={sectionTitleStyle}>Font Browser</div>
      <div style={{ padding: '0 16px 8px' }}>
        <input
          type="search"
          placeholder="Search fonts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: 'var(--chrome-radius)',
            border: '1px solid var(--chrome-border)',
            background: 'var(--chrome-surface)',
            color: 'var(--chrome-text)',
            fontSize: 12,
            outline: 'none',
            marginBottom: 8,
            fontFamily: 'var(--chrome-font-ui)',
          }}
        />

        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--chrome-text-subtle)', marginBottom: 4, fontFamily: 'var(--chrome-font-mono)' }}>
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

        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--chrome-text-subtle)', marginBottom: 4, fontFamily: 'var(--chrome-font-mono)' }}>
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

      {/* Type Scale */}
      <div style={sectionTitleStyle}>Type Scale</div>
      <div style={groupStyle}>
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
          onChange={(v) => actions.setScaleAlgorithm(v as TypeScaleAlgorithm)}
        />
        {typography.scaleAlgorithm === 'modular' && (
          <Select
            label="Ratio"
            value={String(typography.modularRatio)}
            options={MODULAR_RATIOS.map((o) => ({ label: o.label, value: String(o.value) }))}
            onChange={(v) => actions.setModularRatio(Number(v) as ModularRatio)}
          />
        )}
      </div>

      {/* Contrast Check */}
      <div style={sectionTitleStyle}>Contrast Check</div>
      <div style={groupStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--chrome-text-subtle)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Text</div>
            <ColorPicker value={typography.textColor} onChange={actions.setTextColor} label="Text color" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--chrome-text-subtle)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Background</div>
            <ColorPicker value={typography.bgColor} onChange={actions.setBgColor} label="Background color" />
          </div>
        </div>
        <ContrastChecker />
      </div>

      {/* Custom preview text */}
      <div style={sectionTitleStyle}>Preview Text</div>
      <div style={groupStyle}>
        <textarea
          rows={3}
          value={typography.customText}
          onChange={(e) => actions.setCustomText(e.target.value)}
          placeholder="Type custom preview text…"
          style={{
            width: '100%',
            background: 'var(--chrome-surface)',
            border: '1px solid var(--chrome-border)',
            borderRadius: 'var(--chrome-radius)',
            color: 'var(--chrome-text)',
            fontFamily: 'var(--chrome-font-mono)',
            fontSize: 12,
            padding: '8px 12px',
            outline: 'none',
            resize: 'vertical',
            minHeight: 72,
          }}
        />
      </div>
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
        border: `1px solid ${active ? 'var(--chrome-accent)' : 'var(--chrome-border)'}`,
        background: active ? 'rgba(232,168,48,0.1)' : 'transparent',
        color: active ? 'var(--chrome-accent)' : 'var(--chrome-text-subtle)',
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
