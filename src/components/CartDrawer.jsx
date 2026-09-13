import { useEffect, useState } from 'react'
import { X, ShoppingBag, Trash2, ArrowRight, MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { formatINR } from '../utils/pricing.js'
import { normalizePhone } from '../utils/whatsapp.js'
import { CartItem } from './CartItem.jsx'
import { CheckoutForm } from './CheckoutForm.jsx'
import { EmptyState } from './EmptyState.jsx'

/**
 * CartDrawer — slide-in cart with built-in checkout.
 * stage: 'cart' | 'checkout' | 'done'
 */
export function CartDrawer({ open, onClose, shop, onBrowse }) {
  const { items, inc, dec, remove, clear, totals } = useCart()
  const [stage, setStage] = useState('cart')
  const phoneOk = Boolean(normalizePhone(shop && shop.phone))

  useEffect(() => {
    if (open) {
      setStage((s) => (s === 'done' ? 'cart' : s))
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`cd-wrap ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="cd-scrim" onClick={onClose} />
      <aside className="cd-panel" role="dialog" aria-label="Your cart">
        <div className="cd-head">
          <h2>
            <ShoppingBag size={18} /> {stage === 'checkout' ? 'Checkout' : 'Your Cart'}
            {stage === 'cart' && items.length > 0 && <span className="cd-count">{totals.count}</span>}
          </h2>
          <button className="cd-close" onClick={onClose} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        <div className="cd-body">
          {stage === 'done' ? (
            <div className="cd-done">
              <div className="cd-done-emoji">🎉</div>
              <h3>Order dispatched!</h3>
              <p>WhatsApp has opened with your order. Hit send and the seller is on it. 🙏</p>
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  clear()
                  setStage('cart')
                  onClose()
                }}
              >
                Start a new order
              </button>
            </div>
          ) : stage === 'checkout' ? (
            <CheckoutForm
              shop={shop}
              items={items}
              totals={totals}
              onClose={() => setStage('cart')}
              onDone={() => {
                setStage('done')
              }}
            />
          ) : items.length === 0 ? (
            <EmptyState
              compact
              emoji="🛒"
              title="Your cart is empty."
              subtitle="Add a few goodies and watch this space fill up."
              action={{ label: 'Explore Products', onClick: () => { onClose(); onBrowse && onBrowse() } }}
            />
          ) : (
            <>
              <div className="cd-items">
                {items.map((it) => (
                  <CartItem key={it.id} item={it} onInc={inc} onDec={dec} onRemove={remove} />
                ))}
              </div>
              <div className="cd-remove-all">
                <button onClick={() => { clear() }} className="link-danger">
                  <Trash2 size={13} /> Remove all items
                </button>
              </div>
              <div className="cd-totals">
                <div className="cd-total-row">
                  <span>Subtotal</span>
                  <span>{formatINR(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="cd-total-row save">
                    <span>Discount</span>
                    <span>− {formatINR(totals.discount)}</span>
                  </div>
                )}
                <div className="cd-total-row grand">
                  <span>Total</span>
                  <strong>{formatINR(totals.total)}</strong>
                </div>
              </div>
              {phoneOk ? (
                <button className="btn btn-wa btn-block btn-lg cd-order-btn" onClick={() => setStage('checkout')}>
                  <MessageCircle size={18} /> Order on WhatsApp <ArrowRight size={16} />
                </button>
              ) : (
                <p className="cd-no-phone">
                  ⚠️ This shop hasn’t added a WhatsApp number yet, so orders can’t be sent.
                </p>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
