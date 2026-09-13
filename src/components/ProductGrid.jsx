import { ProductCard } from './ProductCard.jsx'

export function ProductGrid({ products, onOpen, onAdd }) {
  if (!products.length) return null
  return (
    <div className="p-grid">
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          onOpen={onOpen}
          onAdd={onAdd}
          style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
        />
      ))}
    </div>
  )
}
