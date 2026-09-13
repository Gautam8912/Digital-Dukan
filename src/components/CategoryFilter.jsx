import { useMemo } from 'react'

const DAY = 86400000

/**
 * CategoryFilter — horizontally scrollable pills.
 * Categories are derived from the products themselves;
 * "New Arrivals" and "Sale" appear only when they apply.
 */
export function CategoryFilter({ products, active, onChange }) {
  const categories = useMemo(() => {
    const set = new Set()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    const cats = Array.from(set)
    const hasSale = products.some((p) => p.discountPrice && p.discountPrice > 0 && p.discountPrice < Number(p.price))
    const hasNew = products.some((p) => Date.now() - (p.createdAt || 0) < 14 * DAY)
    return {
      cats,
      hasSale,
      hasNew
    }
  }, [products])

  const pills = useMemo(() => {
    const list = ['All', ...categories.cats]
    if (categories.hasNew) list.push('New Arrivals')
    if (categories.hasSale) list.push('Sale')
    return list
  }, [categories])

  const matches = (cat, p) => {
    if (cat === 'All') return true
    if (cat === 'New Arrivals') return Date.now() - (p.createdAt || 0) < 14 * DAY
    if (cat === 'Sale') return p.discountPrice && p.discountPrice > 0 && p.discountPrice < Number(p.price)
    return p.category === cat
  }

  return (
    <div className="cat-filter" role="tablist" aria-label="Product categories">
      {pills.map((c) => (
        <button
          key={c}
          role="tab"
          aria-selected={active === c}
          className={`cat-pill ${active === c ? 'active' : ''} ${c === 'Sale' ? 'pill-sale' : ''} ${c === 'New Arrivals' ? 'pill-new' : ''}`}
          onClick={() => onChange(c)}
        >
          {c}
          <span className="cat-count">{products.filter((p) => matches(c, p)).length}</span>
        </button>
      ))}
    </div>
  )
}
