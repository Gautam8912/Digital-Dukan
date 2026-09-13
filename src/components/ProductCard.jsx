import { Plus } from 'lucide-react'
import { effectivePrice, formatINR, discountPercent } from '../utils/pricing.js'
import { ProductPlaceholder } from './ProductPlaceholder.jsx'

export function ProductCard({ product, onOpen, onAdd }) {
  const out = product.stock === 'out'
  const pct = discountPercent(product)
  const price = effectivePrice(product)

  const handleAdd = (e) => {
    e.stopPropagation()
    const img = e.currentTarget.closest('.p-card')?.querySelector('.p-card-img img')
    if (onAdd) onAdd(product, img)
  }

  return (
    <article className="p-card" onClick={() => onOpen && onOpen(product)} role="button" tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen && onOpen(product)
        }
      }}
    >
      <div className="p-card-img">
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <ProductPlaceholder name={product.name} />
        )}
        {pct > 0 && !out && <span className="p-badge">{pct}% OFF</span>}
        {out && <span className="p-badge p-badge-out">SOLD OUT</span>}
        <span className="p-card-shine" aria-hidden="true" />
      </div>
      <div className="p-card-body">
        <h4 className="p-card-name" title={product.name}>{product.name}</h4>
        {product.description && <p className="p-card-desc">{product.description}</p>}
        <div className="p-card-row">
          <div className="p-card-prices">
            {pct > 0 && <s className="p-price-old">{formatINR(product.price)}</s>}
            <strong className="p-price">{formatINR(price)}</strong>
          </div>
          <button
            className="p-add"
            disabled={out}
            onClick={handleAdd}
            aria-label={out ? 'Sold out' : `Add ${product.name} to cart`}
          >
            {out ? '—' : <Plus size={16} strokeWidth={2.5} />}
          </button>
        </div>
        {!out && (
          <button className="p-add-label" disabled={out} onClick={handleAdd}>
            Add to Cart
          </button>
        )}
      </div>
    </article>
  )
}
