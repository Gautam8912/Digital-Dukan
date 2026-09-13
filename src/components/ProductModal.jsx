import { useEffect, useState } from 'react'
import { X, Minus, Plus, ShoppingCart } from 'lucide-react'
import { effectivePrice, formatINR, discountPercent } from '../utils/pricing.js'
import { buildAskMessage } from '../utils/whatsapp.js'
import { ProductPlaceholder } from './ProductPlaceholder.jsx'
import { WhatsAppButton } from './WhatsAppButton.jsx'

export function ProductModal({ product, shop, onClose, onAdd }) {
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setQty(1)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [product, onClose])

  if (!product) return null

  const out = product.stock === 'out'
  const pct = discountPercent(product)

  const specs = [
    product.size && ['Size', product.size],
    product.color && ['Colour', product.color],
    product.material && ['Material', product.material],
    product.sku && ['SKU', product.sku],
    product.category && ['Category', product.category]
  ].filter(Boolean)

  return (
    <div className="modal-backdrop pm-backdrop" onClick={onClose}>
      <div className="pm-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="pm-scroll">
          <div className="pm-media">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <ProductPlaceholder name={product.name} big />
            )}
            {pct > 0 && !out && <span className="p-badge pm-badge">{pct}% OFF</span>}
            {out && <span className="p-badge p-badge-out pm-badge">SOLD OUT</span>}
          </div>
          <div className="pm-body">
            <h2 className="pm-name">{product.name}</h2>
            <div className="pm-prices">
              {pct > 0 && <s>{formatINR(product.price)}</s>}
              <strong>{formatINR(effectivePrice(product))}</strong>
              {pct > 0 && <span className="pm-save">You save {formatINR((Number(product.price) - effectivePrice(product)) * qty)}</span>}
            </div>
            <p className={`pm-stock ${out ? 'pm-stock-out' : ''}`}>
              {out ? '⛔ Currently out of stock' : '✅ In stock & ready to ship'}
            </p>
            {product.description && <p className="pm-desc">{product.description}</p>}

            {specs.length > 0 && (
              <ul className="pm-specs">
                {specs.map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </li>
                ))}
              </ul>
            )}

            {!out && (
              <div className="pm-actions">
                <div className="qty-stepper">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                    <Minus size={15} />
                  </button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase quantity">
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  className="btn btn-primary pm-add"
                  onClick={() => {
                    const img = document.querySelector('.pm-media img')
                    onAdd(product, qty, img)
                    onClose()
                  }}
                >
                  <ShoppingCart size={16} /> Add to Cart · {formatINR(effectivePrice(product) * qty)}
                </button>
              </div>
            )}

            {shop && (
              <div className="pm-ask">
                <WhatsAppButton
                  phone={shop.phone}
                  message={buildAskMessage(product.name)}
                  label={`Ask Seller about “${product.name.length > 24 ? product.name.slice(0, 24) + '…' : product.name}”`}
                  block
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
