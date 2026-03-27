import type { PrimitiveTokens } from '@/core/tokens/types'
import styles from './DashboardTemplate.module.css'

interface DashboardTemplateProps {
  primitive: PrimitiveTokens
}

export function DashboardTemplate({ primitive: _primitive }: DashboardTemplateProps) {
  return (
    <div className={styles.layout}>
      {/* Sidebar nav */}
      <nav className={styles.sidebar}>
        <div className={styles.brand}>Acme Dashboard</div>
        <div className={styles.navSection}>
          <div className={styles.navLabel}>Main</div>
          {['Overview', 'Analytics', 'Reports', 'Customers', 'Products'].map((item, i) => (
            <div key={item} className={`${styles.navItem} ${i === 0 ? styles.navItemActive : ''}`}>
              {item}
            </div>
          ))}
        </div>
        <div className={styles.navSection}>
          <div className={styles.navLabel}>Settings</div>
          {['Account', 'Billing', 'Team'].map(item => (
            <div key={item} className={styles.navItem}>{item}</div>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <div className={styles.main}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.pageTitle}>Overview</div>
          <div className={styles.topBarActions}>
            <div className={styles.searchBox}>Search...</div>
            <button className={styles.primaryBtn}>New Report</button>
          </div>
        </div>

        {/* Metrics row */}
        <div className={styles.metrics}>
          {[
            { label: 'Total Revenue', value: '$48,295', delta: '+12%', positive: true },
            { label: 'Active Users', value: '3,842', delta: '+4%', positive: true },
            { label: 'Avg Order', value: '$124.50', delta: '-2%', positive: false },
            { label: 'Support Tickets', value: '18', delta: '+8%', positive: false },
          ].map(m => (
            <div key={m.label} className={styles.metricCard}>
              <div className={styles.metricLabel}>{m.label}</div>
              <div className={styles.metricValue}>{m.value}</div>
              <div className={`${styles.metricDelta} ${m.positive ? styles.positive : styles.negative}`}>
                {m.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Alert */}
        <div className={styles.alert}>
          <span className={styles.alertIcon}>ℹ</span>
          Your billing cycle renews in 7 days.
          <button className={styles.alertLink}>View billing</button>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div className={styles.tableTitle}>Recent Orders</div>
            <button className={styles.secondaryBtn}>Export</button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Product', 'Status', 'Amount'].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: '#1042', customer: 'Sara Chen', product: 'Pro Plan', status: 'success', amount: '$299' },
                { id: '#1041', customer: 'Marcus R.', product: 'Starter', status: 'warning', amount: '$49' },
                { id: '#1040', customer: 'Priya K.', product: 'Enterprise', status: 'success', amount: '$999' },
                { id: '#1039', customer: 'Tom Walsh', product: 'Pro Plan', status: 'error', amount: '$299' },
                { id: '#1038', customer: 'Aiko M.', product: 'Starter', status: 'success', amount: '$49' },
              ].map(row => (
                <tr key={row.id} className={styles.tr}>
                  <td className={styles.td}><span className={styles.mono}>{row.id}</span></td>
                  <td className={styles.td}>{row.customer}</td>
                  <td className={styles.td}>{row.product}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${styles[`badge_${row.status}` as keyof typeof styles]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className={styles.td}><strong>{row.amount}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
