import { TemplateIcon } from '../shared/TemplateIcon'
import type { IconSlug } from '../shared/TemplateIcon'
import { PreviewFooter } from '../shared/PreviewFooter'
import styles from './DashboardTemplate.module.css'

const NAV_ITEMS: { slug: IconSlug; label: string; active?: boolean; badge?: number }[] = [
  { slug: 'home',     label: 'Overview',  active: true },
  { slug: 'search',   label: 'Analytics' },
  { slug: 'folder',   label: 'Projects' },
  { slug: 'user',     label: 'Team' },
  { slug: 'bell',     label: 'Alerts',   badge: 3 },
  { slug: 'settings', label: 'Settings' },
]

const STATS = [
  { label: 'Total Revenue',  value: '$84,295', delta: '+12.4%', positive: true },
  { label: 'Active Users',   value: '24,847',  delta: '+8.1%',  positive: true },
  { label: 'Conversion',     value: '3.24%',   delta: '+0.6%',  positive: true },
  { label: 'Bounce Rate',    value: '41.2%',   delta: '+3.2%',  positive: false },
]

const BAR_DATA = [
  { h: 65, month: 'Jan' }, { h: 42, month: 'Feb' }, { h: 78, month: 'Mar' },
  { h: 55, month: 'Apr' }, { h: 88, month: 'May' }, { h: 62, month: 'Jun' },
  { h: 72, month: 'Jul' }, { h: 48, month: 'Aug' }, { h: 82, month: 'Sep' },
  { h: 58, month: 'Oct' }, { h: 92, month: 'Nov' }, { h: 68, month: 'Dec' },
]

const CHANNELS = [
  { name: 'Organic', pct: 48, dv: 1 },
  { name: 'Paid',    pct: 27, dv: 2 },
  { name: 'Direct',  pct: 15, dv: 3 },
  { name: 'Referral',pct: 10, dv: 4 },
]

const PROJECTS = [
  { name: 'Homepage redesign',    team: 'Design',      pct: 85, status: 'success' },
  { name: 'API v3 migration',     team: 'Engineering', pct: 40, status: 'warning' },
  { name: 'Mobile app v2',        team: 'Product',     pct: 62, status: 'success' },
  { name: 'Database failover',    team: 'Infra',       pct: 15, status: 'error'   },
  { name: 'Design system docs',   team: 'Design',      pct: 90, status: 'success' },
]

const TABS = ['Overview', 'Revenue', 'Users', 'Settings']

type ActivityItem = { state: 'success' | 'error' | 'warning' | 'info'; msg: string; time: string }

const ACTIVITY: ActivityItem[] = [
  { state: 'success', msg: 'Design tokens exported — CSS + W3C',    time: '2 min ago' },
  { state: 'info',    msg: 'New palette generated — Triadic scheme', time: '8 min ago' },
  { state: 'warning', msg: 'Contrast ratio below 4.5:1 on body',    time: '15 min ago' },
  { state: 'error',   msg: 'Export failed — ZIP generation error',  time: '1 hr ago' },
  { state: 'success', msg: 'Design saved to cloud',                 time: '2 hr ago' },
]

export function DashboardTemplate() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.page}>

        {/* ── SIDEBAR ──────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>Palette Co.</div>
          <nav className={styles.sidebarNav}>
            {NAV_ITEMS.map(item => (
              <div
                key={item.slug}
                className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>
                  <TemplateIcon slug={item.slug} size={15} />
                </span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={styles.navBadge}>{item.badge}</span>
                )}
              </div>
            ))}
          </nav>
          <div className={styles.sidebarUser}>
            <div className={styles.userAvatar}>
              <TemplateIcon slug="user" size={13} />
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>Alex Morgan</div>
              <div className={styles.userRole}>Admin</div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ─────────────────────────────────────────── */}
        <div className={styles.main}>

          {/* TOP BAR */}
          <div className={styles.topbar}>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbBase}>Workspace</span>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>Overview</span>
            </div>
            <div className={styles.topbarActions}>
              <button className={styles.actionBtn}>
                <TemplateIcon slug="calendar" size={13} />
                <span>Last 30 days</span>
                <TemplateIcon slug="chevron-down" size={12} />
              </button>
              <button className={styles.primaryBtn}>
                <TemplateIcon slug="plus" size={13} />
                <span>New report</span>
              </button>
            </div>
          </div>

          {/* PALETTE STRIP */}
          <div className={styles.paletteStrip}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div
                key={n}
                className={styles.paletteStripSegment}
                style={{ background: `var(--color-dataviz-${n}, var(--color-interactive))` }}
              />
            ))}
          </div>

          {/* PAGE TITLE + TABS */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Analytics</h1>
            <div className={styles.tabs}>
              {TABS.map((t, i) => (
                <div key={t} className={`${styles.tab} ${i === 0 ? styles.tabActive : ''}`}>{t}</div>
              ))}
            </div>
          </div>

          {/* ALERT BANNER */}
          <div className={styles.alertBanner}>
            <TemplateIcon slug="bell" size={13} />
            <span>
              <strong>Scheduled maintenance</strong> on March 28 — export services may be briefly unavailable.
            </span>
          </div>

          {/* KPI STATS */}
          <div className={styles.statsGrid}>
            {STATS.map(stat => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statValue}>{stat.value}</div>
                <div
                  className={styles.statDelta}
                  style={{ color: stat.positive ? 'var(--color-success, #16a34a)' : 'var(--color-error, #dc2626)' }}
                >
                  {stat.delta}
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS ROW */}
          <div className={styles.chartsRow}>

            {/* BAR CHART */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div className={styles.chartTitle}>Monthly Revenue</div>
                <div className={styles.chartLegend}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className={styles.legendItem}>
                      <div
                        className={styles.legendDot}
                        style={{ background: `var(--color-dataviz-${n}, var(--color-interactive))` }}
                      />
                      <span>Q{n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.chartBars}>
                {BAR_DATA.map((d, i) => (
                  <div key={d.month} className={styles.barCol}>
                    <div
                      className={styles.bar}
                      style={{
                        height: `${d.h}%`,
                        background: `var(--color-dataviz-${(Math.floor(i / 3) % 4) + 1}, var(--color-interactive))`,
                      }}
                    />
                    <div className={styles.barLabel}>{d.month.slice(0, 1)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHANNEL BREAKDOWN */}
            <div className={styles.miniCard}>
              <div className={styles.chartTitle}>Channel Split</div>
              <div className={styles.channelList}>
                {CHANNELS.map(c => (
                  <div key={c.name} className={styles.channelRow}>
                    <div className={styles.channelName}>{c.name}</div>
                    <div className={styles.channelTrack}>
                      <div
                        className={styles.channelFill}
                        style={{
                          width: `${c.pct}%`,
                          background: `var(--color-dataviz-${c.dv}, var(--color-interactive))`,
                        }}
                      />
                    </div>
                    <div className={styles.channelPct}>{c.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* PROJECTS TABLE */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <span className={styles.chartTitle}>Active Projects</span>
              <span className={styles.tableBadge}>{PROJECTS.length}</span>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  {['Project', 'Team', 'Progress', 'Status'].map(h => (
                    <th key={h} className={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map(p => (
                  <tr key={p.name} className={styles.tr}>
                    <td className={styles.tdName}>{p.name}</td>
                    <td className={styles.td}>{p.team}</td>
                    <td className={styles.td}>
                      <div className={styles.progressRow}>
                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${p.pct}%`,
                              background: p.status === 'success'
                                ? 'var(--color-success, #16a34a)'
                                : p.status === 'warning'
                                  ? 'var(--color-warning, #d97706)'
                                  : 'var(--color-error, #dc2626)',
                            }}
                          />
                        </div>
                        <span className={styles.progressPct}>{p.pct}%</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background: `var(--color-${p.status}-container)`,
                          color: `var(--color-${p.status})`,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FORM + ACTIVITY ROW */}
          <div className={styles.bottomRow}>

            {/* FORM ELEMENTS CARD */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Form Elements</div>
              <div className={styles.formGroup}>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Full name</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    placeholder="Jane Smith"
                    readOnly
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    className={styles.formInput}
                    type="email"
                    placeholder="jane@company.com"
                    readOnly
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Role</label>
                  <select className={styles.formSelect} defaultValue="Designer">
                    <option>Designer</option>
                    <option>Developer</option>
                    <option>Manager</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <div className={styles.checkboxRow}>
                    <label className={styles.checkboxLabel}>
                      <input className={styles.checkboxInput} type="checkbox" defaultChecked readOnly />
                      Notify me
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input className={styles.checkboxInput} type="checkbox" readOnly />
                      Marketing emails
                    </label>
                  </div>
                </div>

                <button className={styles.formSubmitBtn}>Save changes</button>

              </div>
            </div>

            {/* ACTIVITY FEED CARD */}
            <div className={styles.chartCard}>
              <div className={styles.chartTitle}>Activity Feed</div>
              <div className={styles.activityList}>
                {ACTIVITY.map((item, i) => (
                  <div key={i} className={styles.activityItem}>
                    <div
                      className={styles.activityDot}
                      style={{ background: `var(--color-${item.state})` }}
                    />
                    <span className={styles.activityMsg}>{item.msg}</span>
                    <span className={styles.activityTime}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
      <PreviewFooter />
    </div>
  )
}
