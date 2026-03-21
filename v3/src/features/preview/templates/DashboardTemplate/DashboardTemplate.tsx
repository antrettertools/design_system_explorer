import styles from './DashboardTemplate.module.css'

export function DashboardTemplate() {
  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>Acme</div>
        {['Dashboard', 'Analytics', 'Projects', 'Settings'].map(item => (
          <div key={item} className={`${styles.navItem} ${item === 'Dashboard' ? styles.active : ''}`}>
            {item}
          </div>
        ))}
      </div>
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.title}>Dashboard</div>
          <button className={styles.cta}>New project</button>
        </div>
        <div className={styles.statsGrid}>
          {[
            { label: 'Revenue', value: '$48,295', delta: '+12%' },
            { label: 'Users', value: '12,847', delta: '+8%' },
            { label: 'Conversion', value: '3.24%', delta: '+0.4%' },
            { label: 'Avg. session', value: '4m 32s', delta: '-2%' },
          ].map(stat => (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statDelta}>{stat.delta}</div>
            </div>
          ))}
        </div>
        <div className={styles.chartArea}>
          <div className={styles.chartTitle}>Revenue over time</div>
          <div className={styles.chartBars}>
            {[65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95, 65].map((h, i) => (
              <div key={i} className={styles.bar} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
