import styles from './BlogTemplate.module.css'

const POSTS = [
  { tag: 'Design', title: 'How color theory changed the way we think about interfaces', date: 'March 2026', read: '5 min' },
  { tag: 'Typography', title: 'The quiet revolution of variable fonts in modern web design', date: 'March 2026', read: '7 min' },
  { tag: 'Product', title: 'Building for vibe coders: design systems that ship in minutes', date: 'February 2026', read: '4 min' },
]

export function BlogTemplate() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.logo}>The Journal</span>
        <div className={styles.navLinks}>
          {['Design', 'Typography', 'Product'].map(l => (
            <span key={l} className={styles.navLink}>{l}</span>
          ))}
        </div>
      </nav>
      <main className={styles.main}>
        <div className={styles.featured}>
          <div className={styles.featuredTag}>Featured</div>
          <h1 className={styles.featuredTitle}>
            The perceptual revolution: why OKLCH is replacing HSL
          </h1>
          <p className={styles.featuredExcerpt}>
            For decades, designers worked in RGB and HSL — color spaces that feel intuitive
            but are perceptually uneven. Here is why the future belongs to OKLCH.
          </p>
          <div className={styles.meta}>March 21, 2026 · 8 min read</div>
        </div>
        <div className={styles.postGrid}>
          {POSTS.map(post => (
            <article key={post.title} className={styles.postCard}>
              <div className={styles.postTag}>{post.tag}</div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <div className={styles.postMeta}>{post.date} · {post.read} read</div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
