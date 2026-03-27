import type { PrimitiveTokens } from '@/core/tokens/types'
import styles from './ProductTemplate.module.css'

interface ProductTemplateProps { primitive: PrimitiveTokens }

const PRODUCTS = [
  { name: 'Minimal Tee', price: '$45', badge: null, rating: 4.8, reviews: 124 },
  { name: 'Canvas Jacket', price: '$189', badge: 'New', rating: 4.9, reviews: 38 },
  { name: 'Wool Trousers', price: '$220', badge: 'Sale', rating: 4.6, reviews: 67 },
  { name: 'Linen Shirt', price: '$98', badge: null, rating: 4.7, reviews: 201 },
  { name: 'Classic Cap', price: '$55', badge: 'Sale', rating: 4.5, reviews: 89 },
  { name: 'Canvas Bag', price: '$135', badge: 'New', rating: 5.0, reviews: 12 },
]

export function ProductTemplate({ primitive: _primitive }: ProductTemplateProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>PURA</div>
        <div className={styles.headerSearch}>
          <input className={styles.searchInput} placeholder="Search..." />
        </div>
        <div className={styles.headerIcons}>
          <span>♡ Wishlist</span>
          <span>⊕ Bag (3)</span>
        </div>
      </header>
      <div className={styles.categoryNav}>
        {['All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'].map((c, i) => (
          <button key={c} className={`${styles.categoryBtn} ${i === 0 ? styles.categoryBtnActive : ''}`}>{c}</button>
        ))}
      </div>
      <div className={styles.content}>
        <aside className={styles.filters}>
          <div className={styles.filterTitle}>Filter</div>
          {[
            { label: 'Size', opts: ['XS', 'S', 'M', 'L', 'XL'] },
            { label: 'Color', opts: ['Ivory', 'Sand', 'Navy', 'Black'] },
            { label: 'Price', opts: ['Under $50', '$50–$150', '$150+'] },
          ].map(group => (
            <div key={group.label} className={styles.filterGroup}>
              <div className={styles.filterGroupLabel}>{group.label}</div>
              {group.opts.map(opt => (
                <label key={opt} className={styles.filterOption}>
                  <input type="checkbox" className={styles.filterCheckbox} /> {opt}
                </label>
              ))}
            </div>
          ))}
        </aside>
        <div className={styles.productSection}>
          <div className={styles.productHeader}>
            <div className={styles.resultCount}>Showing 6 of 48 products</div>
            <select className={styles.sortSelect}>
              <option>Sort: Featured</option>
              <option>Price: Low to High</option>
              <option>Newest</option>
            </select>
          </div>
          <div className={styles.grid}>
            {PRODUCTS.map(product => (
              <div key={product.name} className={styles.productCard}>
                <div className={styles.productImage}>
                  {product.badge && (
                    <span className={`${styles.productBadge} ${product.badge === 'Sale' ? styles.badgeSale : styles.badgeNew}`}>
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productMeta}>
                    <span className={styles.productRating}>★ {product.rating}</span>
                    <span className={styles.productReviews}>({product.reviews})</span>
                  </div>
                  <div className={styles.productPrice}>{product.price}</div>
                  <button className={styles.addToCart}>Add to bag</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
