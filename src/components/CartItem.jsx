import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatINR } from '../utils/pricing.js'
import { ProductPlaceholder } from './ProductPlaceholder.jsx'

export function CartItem({ item, onInc, onDec, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item-img">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <ProductPlaceholder name={item.name} />
        )}
      </div>
      <div className="cart-item-info">
        <p className="cart-item-name" title={item.name}>{item.name}</p>
        <p className="cart-item-price">
          {formatINR(item.price)} each
          {item.original > item.price && <s> {formatINR(item.original)}</s>}
        </p>
        <div className="cart-item-controls">
          <div className="qty-stepper qty-sm">
            <button onClick={() => onDec(item.id)} aria-label="Decrease">
              <Minus size={13} />
            </button>
            <span>{item.qty}</span>
            <button onClick={() => onInc(item.id)} aria-label="Increase">
              <Plus size={13} />
            </button>
          </div>
          <button className="cart-item-remove" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="cart-item-total">{formatINR(item.price * item.qty)}</div>
    </div>
  )
}
