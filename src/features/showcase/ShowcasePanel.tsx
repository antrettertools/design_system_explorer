import type { CSSProperties } from 'react'
import { useTokens } from '@/hooks/useTokens'
import { useFont } from '@/hooks/useFont'
import { useComponents } from '@/store'
import { shadowToCss } from '@/core/shadow/presets'

/**
 * A live mock marketing/landing page rendered entirely with the current
 * design tokens. Every value — type scale, color, spacing, radius, elevation
 * — comes from useTokens() so the page updates instantly as you edit settings.
 */
export function ShowcasePanel() {
  const tokens = useTokens()
  const { fontFamilyStack, variationSettings } = useFont()
  const components = useComponents()

  // ── Token aliases ────────────────────────────────────────────
  const primary    = tokens.primaryBrand.hex
  const secondary  = tokens.secondaryBrand.hex
  const sub0       = tokens.subBrandColors[0]?.hex ?? tokens.primaryBrand.scale[400]
  const success    = tokens.stateColors.success
  const warning    = tokens.stateColors.warning
  const error      = tokens.stateColors.error
  const info       = tokens.stateColors.info
  const ts         = tokens.typeScale
  const rs         = tokens.radiusScale
  const dv         = tokens.dataVizPalette

  const smShadow   = shadowToCss(tokens.elevation.sm)
  const mdShadow   = shadowToCss(tokens.elevation.md)
  const lgShadow   = shadowToCss(tokens.elevation.lg)

  // ── Spacing helper (maps 1-based index → spacingScale value) ─
  const spacingArr = Object.values(tokens.spacingScale)
  const sp = (i: number): number =>
    spacingArr[Math.max(0, Math.min(i - 1, spacingArr.length - 1))] ?? tokens.spacingBase * i
  const px = (i: number) => `${sp(i)}px`

  // ── Font ─────────────────────────────────────────────────────
  const fontBase: CSSProperties = {
    fontFamily: fontFamilyStack,
    ...(variationSettings ? { fontVariationSettings: variationSettings } : {}),
    lineHeight: tokens.lineHeight,
  }

  // ── Button factory ───────────────────────────────────────────
  const btnSize = components.size
  const btnStyle = components.buttonStyle
  const bPad = btnSize === 'sm' ? `${px(2)} ${px(4)}`
             : btnSize === 'lg' ? `${px(3)} ${px(7)}`
             :                    `${px(2)} ${px(5)}`
  const bFontSize = btnSize === 'sm' ? ts.xs : btnSize === 'lg' ? ts.md : ts.sm
  const bRadius = `${components.radius}px`

  const btn = (
    hex: string,
    ghost = false,
  ): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: px(2),
    padding: bPad,
    borderRadius: bRadius,
    fontSize: bFontSize,
    fontWeight: 600,
    fontFamily: fontFamilyStack,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    ...(btnStyle === 'filled' && !ghost
      ? { background: hex, color: '#fff', border: 'none', boxShadow: smShadow }
      : btnStyle === 'outline' || ghost
      ? { background: 'transparent', color: ghost ? 'var(--text-1)' : hex,
          border: `2px solid ${ghost ? 'var(--line-2)' : hex}` }
      : { background: 'transparent', color: hex, border: 'none' }),
  })

  // ── Card ─────────────────────────────────────────────────────
  const card: CSSProperties = {
    background: 'var(--bg-1)',
    border: '1px solid var(--line)',
    borderRadius: `${rs.lg}px`,
    padding: px(6),
    boxShadow: mdShadow,
  }

  // ── Feature data ─────────────────────────────────────────────
  const features = [
    { icon: '◆', accent: primary, title: 'Token-first workflow',
      body: 'Define once, use everywhere. Color, type, spacing, and shadow all flow from one source of truth.' },
    { icon: '◈', accent: secondary, title: 'Perceptual color science',
      body: 'Shade scales built in Oklab — equal-feeling steps, built-in colorblind simulation, WCAG-AA checked.' },
    { icon: '◉', accent: sub0, title: 'Export to any format',
      body: 'CSS variables, Tailwind config, W3C design tokens, or JSON. One click, every platform.' },
  ]

  const stats = [
    { value: '12k+', label: 'Teams using Typeset', colorIdx: 0 },
    { value: '98%',  label: 'Design consistency',  colorIdx: 1 },
    { value: '3×',   label: 'Faster token handoff', colorIdx: 2 },
    { value: '40+',  label: 'Export integrations',  colorIdx: 3 },
  ]

  const stateItems = [
    { label: 'Success', color: success, icon: '✓' },
    { label: 'Warning', color: warning, icon: '⚠' },
    { label: 'Error',   color: error,   icon: '✕' },
    { label: 'Info',    color: info,    icon: 'i' },
  ]

  return (
    <div style={{ ...fontBase, overflowY: 'auto', height: '100%', background: 'var(--bg-0)' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--line)',
        padding: `${px(3)} ${px(7)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: smShadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: px(2) }}>
          <div style={{ width: 26, height: 26, borderRadius: bRadius, background: primary, flexShrink: 0 }} />
          <span style={{ fontSize: ts.md, fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>
            {tokens.primaryBrand.name}
          </span>
        </div>

        <div style={{ display: 'flex', gap: px(5), alignItems: 'center' }}>
          {['Features', 'Pricing', 'Docs', 'Blog'].map(link => (
            <span key={link} style={{ fontSize: ts.sm, color: 'var(--text-2)', fontWeight: 500, cursor: 'pointer' }}>
              {link}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: px(2) }}>
          <button style={btn(primary, true)}>Sign in</button>
          <button style={btn(primary)}>Get started</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{
        padding: `${px(10)} ${px(7)} ${px(9)}`,
        background: `linear-gradient(145deg, var(--bg-0) 0%, ${primary}12 50%, ${secondary}10 100%)`,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: px(5),
      }}>
        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: px(2),
          padding: `${px(1)} ${px(3)}`,
          borderRadius: `${rs.full}px`,
          background: `${primary}1a`,
          border: `1px solid ${primary}40`,
          fontSize: ts.xs,
          fontWeight: 600,
          color: primary,
          letterSpacing: '0.05em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: primary, display: 'inline-block' }} />
          Now in public beta · v2.0
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: ts['4xl'],
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          color: 'var(--text-0)',
          maxWidth: 700,
          margin: 0,
        }}>
          Design systems that{' '}
          <span style={{ color: primary }}>scale with your team</span>
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: ts.md,
          color: 'var(--text-2)',
          lineHeight: tokens.lineHeight,
          maxWidth: 520,
          margin: 0,
        }}>
          Define your tokens once and ship consistent, beautiful products across
          every platform — from web to mobile to documentation.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: px(3), flexWrap: 'wrap', justifyContent: 'center' }}>
          <button style={btn(primary)}>Start for free →</button>
          <button style={btn(primary, true)}>View demo</button>
        </div>

        {/* Mock screenshot */}
        <div style={{
          width: '100%',
          maxWidth: 860,
          height: 300,
          borderRadius: `${rs.xl}px`,
          background: 'var(--bg-2)',
          border: '1px solid var(--line)',
          boxShadow: lgShadow,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Mock toolbar */}
          <div style={{
            background: 'var(--bg-3)',
            borderBottom: '1px solid var(--line)',
            padding: `${px(2)} ${px(3)}`,
            display: 'flex',
            alignItems: 'center',
            gap: px(2),
            flexShrink: 0,
          }}>
            {['#ff5f57','#ffbd2e','#28c840'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
            ))}
            <div style={{
              flex: 1,
              height: 20,
              borderRadius: `${rs.sm}px`,
              background: 'var(--bg-2)',
              border: '1px solid var(--line)',
              marginLeft: px(2),
            }} />
          </div>

          {/* Mock UI content — two columns */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{
              width: 160,
              background: 'var(--bg-1)',
              borderRight: '1px solid var(--line)',
              padding: px(3),
              display: 'flex',
              flexDirection: 'column',
              gap: px(2),
              flexShrink: 0,
            }}>
              {[
                { label: 'Typography', active: false },
                { label: 'Color', active: false },
                { label: 'Spacing', active: false },
                { label: 'Components', active: false },
                { label: 'Showcase', active: true },
              ].map(({ label, active }) => (
                <div key={label} style={{
                  padding: `${px(1)} ${px(2)}`,
                  borderRadius: bRadius,
                  fontSize: ts.xs,
                  fontWeight: active ? 600 : 400,
                  background: active ? `${primary}20` : 'transparent',
                  color: active ? primary : 'var(--text-3)',
                  cursor: 'pointer',
                }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Main content area — data viz preview */}
            <div style={{
              flex: 1,
              padding: px(4),
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'auto auto',
              gap: px(3),
              alignContent: 'start',
            }}>
              {dv.slice(0, 8).map((c, i) => (
                <div key={i} style={{
                  borderRadius: `${rs.base}px`,
                  background: `${c.dark}22`,
                  borderLeft: `3px solid ${c.dark}`,
                  padding: `${px(2)} ${px(3)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  <div style={{ width: '60%', height: 6, borderRadius: 3, background: c.dark, opacity: 0.7 }} />
                  <div style={{ width: '40%', height: 4, borderRadius: 2, background: 'var(--line-2)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ───────────────────────────────────── */}
      <section style={{ padding: `${px(9)} ${px(7)}`, background: 'var(--bg-0)' }}>
        <div style={{ textAlign: 'center', marginBottom: px(7) }}>
          <span style={{
            display: 'inline-block',
            fontSize: ts.xs,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: secondary,
            marginBottom: px(2),
          }}>
            Why teams choose us
          </span>
          <h2 style={{
            fontSize: ts['3xl'],
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-0)',
            margin: 0,
          }}>
            Everything you need to ship faster
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: px(5),
          maxWidth: 960,
          margin: '0 auto',
        }}>
          {features.map((f, i) => (
            <div key={i} style={card}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: `${rs.md}px`,
                background: `${f.accent}22`,
                color: f.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: ts.xl,
                marginBottom: px(4),
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontSize: ts.md,
                fontWeight: 700,
                color: 'var(--text-0)',
                margin: `0 0 ${px(2)} 0`,
                letterSpacing: '-0.01em',
              }}>
                {f.title}
              </h3>
              <p style={{ fontSize: ts.sm, color: 'var(--text-2)', lineHeight: tokens.lineHeight, margin: 0 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ROW ───────────────────────────────────────── */}
      <section style={{
        padding: `${px(7)} ${px(7)}`,
        background: 'var(--bg-1)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: px(5),
          maxWidth: 960,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          {stats.map(({ value, label, colorIdx }) => (
            <div key={label}>
              <div style={{
                fontSize: ts['3xl'],
                fontWeight: 800,
                color: dv[colorIdx % dv.length]?.dark ?? primary,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                marginBottom: px(2),
              }}>
                {value}
              </div>
              <div style={{ fontSize: ts.sm, color: 'var(--text-2)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SPLIT CONTENT ───────────────────────────────────── */}
      <section style={{
        padding: `${px(9)} ${px(7)}`,
        background: 'var(--bg-0)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: px(8),
        alignItems: 'center',
        maxWidth: 960,
        margin: '0 auto',
      }}>
        {/* Bar chart illustration */}
        <div style={{
          borderRadius: `${rs.xl}px`,
          background: 'var(--bg-1)',
          border: '1px solid var(--line)',
          boxShadow: lgShadow,
          overflow: 'hidden',
          aspectRatio: '4 / 3',
          padding: px(5),
          display: 'flex',
          flexDirection: 'column',
          gap: px(3),
        }}>
          {/* Mini chart header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: ts.sm, fontWeight: 600, color: 'var(--text-0)' }}>Token adoption</div>
              <div style={{ fontSize: ts.xs, color: 'var(--text-3)' }}>Last 6 months</div>
            </div>
            <div style={{
              padding: `2px ${px(2)}`,
              borderRadius: `${rs.full}px`,
              background: `${success}20`,
              border: `1px solid ${success}40`,
              fontSize: ts.xs,
              color: success,
              fontWeight: 600,
            }}>
              ↑ 24%
            </div>
          </div>

          {/* Bar chart */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            gap: px(2),
            paddingTop: px(2),
          }}>
            {[0.42, 0.61, 0.55, 0.78, 0.69, 0.91].map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                  <div style={{
                    width: '100%',
                    height: `${h * 100}%`,
                    borderRadius: `${rs.sm}px ${rs.sm}px 0 0`,
                    background: dv[i % dv.length]?.dark ?? primary,
                    opacity: 0.85,
                  }} />
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-3)' }}>
                  {['Jan','Feb','Mar','Apr','May','Jun'][i]}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: px(4), justifyContent: 'center' }}>
            {[
              { label: 'Color', color: dv[0]?.dark ?? primary },
              { label: 'Type', color: dv[1]?.dark ?? secondary },
              { label: 'Space', color: dv[2]?.dark ?? sub0 },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: ts.xs, color: 'var(--text-3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Text content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: px(4) }}>
          <span style={{
            fontSize: ts.xs,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: primary,
          }}>
            Built for scale
          </span>
          <h2 style={{
            fontSize: ts['2xl'],
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-0)',
            lineHeight: 1.2,
            margin: 0,
          }}>
            Token decisions that flow through every layer
          </h2>
          <p style={{ fontSize: ts.sm, color: 'var(--text-2)', lineHeight: tokens.lineHeight, margin: 0 }}>
            Your type scale, color system, spacing rhythm, and elevation model all derive from a
            single source of truth. Change the base and watch every element update instantly.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: px(2) }}>
            {[
              'Perceptually uniform shade scales',
              'WCAG-AA contrast enforcement',
              'Dark mode tokens out of the box',
              'Variable font axis control',
            ].map((text) => (
              <li key={text} style={{ display: 'flex', alignItems: 'center', gap: px(2), fontSize: ts.sm, color: 'var(--text-1)' }}>
                <span style={{ color: success, fontSize: ts.md, flexShrink: 0, lineHeight: 1 }}>✓</span>
                {text}
              </li>
            ))}
          </ul>

          <button style={{ ...btn(primary), alignSelf: 'flex-start' }}>Learn more →</button>
        </div>
      </section>

      {/* ── DATA VIZ PALETTE ROW ────────────────────────────── */}
      <section style={{
        padding: `${px(7)} ${px(7)}`,
        background: 'var(--bg-1)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ marginBottom: px(4) }}>
            <span style={{
              fontSize: ts.xs,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
            }}>
              Data Visualization Palette
            </span>
          </div>
          <div style={{ display: 'flex', gap: px(3), flexWrap: 'wrap' }}>
            {dv.map((c) => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(1) }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: `${rs.base}px`,
                  background: c.dark,
                  boxShadow: smShadow,
                }} />
                <span style={{ fontSize: ts.xs - 1, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.2 }}>
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ─────────────────────────────────────── */}
      <section style={{
        padding: `${px(9)} ${px(7)}`,
        background: 'var(--bg-0)',
      }}>
        <div style={{
          maxWidth: 720,
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: px(4),
        }}>
          <div style={{ width: 3, height: 40, background: secondary, borderRadius: `${rs.full}px` }} />
          <blockquote style={{
            fontSize: ts.xl,
            fontWeight: 500,
            color: 'var(--text-0)',
            lineHeight: 1.5,
            margin: 0,
            fontStyle: 'italic',
            letterSpacing: '-0.01em',
          }}>
            "Typeset cut our design handoff time in half. Every token is consistent,
            every shade is perceptually balanced — and our engineers love the CSS output."
          </blockquote>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: px(1) }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: `${rs.full}px`,
              background: `${secondary}28`,
              border: `2px solid ${secondary}60`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: ts.sm,
              color: secondary,
              fontWeight: 700,
            }}>
              AK
            </div>
            <span style={{ fontSize: ts.sm, fontWeight: 600, color: 'var(--text-0)' }}>Alex Kim</span>
            <span style={{ fontSize: ts.xs, color: 'var(--text-3)' }}>Head of Design, Acme Corp</span>
          </div>
        </div>
      </section>

      {/* ── FORM + STATE COLORS ─────────────────────────────── */}
      <section style={{
        padding: `${px(9)} ${px(7)}`,
        background: `linear-gradient(145deg, ${primary}12 0%, ${secondary}10 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: px(5),
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: ts['2xl'],
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-0)',
          margin: 0,
        }}>
          Ready to build your design system?
        </h2>
        <p style={{ fontSize: ts.sm, color: 'var(--text-2)', margin: 0 }}>
          Join 12,000+ designers and engineers who ship faster with Typeset.
        </p>

        {/* Email form */}
        <div style={{ display: 'flex', gap: px(2), maxWidth: 460, width: '100%' }}>
          <input
            readOnly
            placeholder="your@email.com"
            style={{
              flex: 1,
              padding: `${px(2)} ${px(4)}`,
              borderRadius: bRadius,
              border: '1px solid var(--line-2)',
              background: 'var(--bg-1)',
              color: 'var(--text-0)',
              fontSize: ts.sm,
              fontFamily: fontFamilyStack,
              outline: 'none',
            }}
          />
          <button style={btn(primary)}>Subscribe</button>
        </div>

        {/* Success state banner */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: px(2),
          padding: `${px(2)} ${px(4)}`,
          borderRadius: `${rs.base}px`,
          background: `${success}18`,
          border: `1px solid ${success}50`,
          fontSize: ts.xs,
          color: success,
          fontWeight: 500,
        }}>
          <span>✓</span> You're on the list — check your inbox!
        </div>

        {/* State color pills */}
        <div style={{ display: 'flex', gap: px(3), flexWrap: 'wrap', justifyContent: 'center' }}>
          {stateItems.map(({ label, color, icon }) => (
            <div key={label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: px(2),
              padding: `${px(2)} ${px(3)}`,
              borderRadius: `${rs.base}px`,
              background: `${color}18`,
              border: `1px solid ${color}40`,
              fontSize: ts.xs,
              color,
              fontWeight: 500,
            }}>
              <span style={{
                width: 16,
                height: 16,
                borderRadius: `${rs.full}px`,
                background: `${color}28`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 700,
              }}>
                {icon}
              </span>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── TYPOGRAPHY SPECIMEN ──────────────────────────────── */}
      <section style={{
        padding: `${px(8)} ${px(7)}`,
        background: 'var(--bg-1)',
        borderTop: '1px solid var(--line)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: px(3) }}>
          <span style={{
            fontSize: ts.xs,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
          }}>
            Type Specimen · {tokens.fontFamily}
          </span>

          {[
            { size: ts['4xl'],  weight: 800, text: 'Heading Display', letterSpacing: '-0.03em' },
            { size: ts['2xl'],  weight: 700, text: 'Heading Large',   letterSpacing: '-0.02em' },
            { size: ts.xl,      weight: 600, text: 'Heading Medium',  letterSpacing: '-0.01em' },
            { size: ts.md,      weight: 500, text: 'Subheading',      letterSpacing: '0' },
            { size: ts.sm,      weight: 400, text: 'Body text — The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.', letterSpacing: '0' },
            { size: ts.xs,      weight: 400, text: 'Caption — small text for labels, tooltips, and supplementary details.', letterSpacing: '0.02em' },
          ].map(({ size, weight, text, letterSpacing }, i) => (
            <div key={i} style={{
              fontSize: size,
              fontWeight: weight,
              color: i < 4 ? 'var(--text-0)' : 'var(--text-2)',
              lineHeight: i < 4 ? 1.15 : tokens.lineHeight,
              letterSpacing,
              paddingBottom: px(3),
              borderBottom: i < 5 ? '1px solid var(--line)' : 'none',
            }}>
              {text}
            </div>
          ))}

          {/* Neutral scale swatches */}
          <div style={{ marginTop: px(3) }}>
            <div style={{ fontSize: ts.xs, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: px(2) }}>
              Neutral Scale
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const).map((step) => (
                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{
                    height: 32,
                    borderRadius: `${rs.sm}px`,
                    background: tokens.neutral.scale[step],
                    border: step < 200 ? '1px solid var(--line)' : 'none',
                  }} />
                  <div style={{ fontSize: 8, textAlign: 'center', color: 'var(--text-3)' }}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{
        background: primary,
        padding: `${px(6)} ${px(7)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: px(2) }}>
          <div style={{ width: 20, height: 20, borderRadius: `${rs.sm}px`, background: 'rgba(255,255,255,0.9)' }} />
          <span style={{ fontSize: ts.sm, fontWeight: 700, color: '#fff' }}>
            {tokens.primaryBrand.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: px(5) }}>
          {['Privacy', 'Terms', 'Contact', 'Status'].map(link => (
            <span key={link} style={{ fontSize: ts.xs, color: 'rgba(255,255,255,0.65)', cursor: 'pointer' }}>
              {link}
            </span>
          ))}
        </div>
        <span style={{ fontSize: ts.xs, color: 'rgba(255,255,255,0.45)' }}>
          © {new Date().getFullYear()} {tokens.primaryBrand.name}
        </span>
      </footer>

    </div>
  )
}
