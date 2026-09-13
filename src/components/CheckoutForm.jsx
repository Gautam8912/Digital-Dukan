import { useEffect, useMemo, useState } from 'react'
import { Copy, Check, MessageCircle, PackageCheck } from 'lucide-react'
import { validateCheckout } from '../utils/validation.js'
import { buildOrderMessage, openWhatsApp, whatsappLink } from '../utils/whatsapp.js'
import { formatINR } from '../utils/pricing.js'
import { loadCustomer, saveCustomer } from '../utils/storage.js'
import { useToast } from '../context/ToastContext.jsx'

/**
 * CheckoutForm — customer details + WhatsApp order dispatch.
 * No payment, no backend: a formatted message goes straight to the seller.
 */
export function CheckoutForm({ shop, items, totals, onDone, onClose }) {
  const saved = useMemo(() => loadCustomer(), [])
  const [form, setForm] = useState({
    name: saved.name || '',
    phone: saved.phone || '',
    address: saved.address || '',
    city: saved.city || '',
    pincode: saved.pincode || '',
    note: ''
  })
  const [errors, setErrors] = useState({})
  const [phase, setPhase] = useState('form') // form | sent
  const [copied, setCopied] = useState(false)
  const { push } = useToast()

  useEffect(() => {
    saveCustomer({ name: form.name, phone: form.phone, address: form.address, city: form.city, pincode: form.pincode })
  }, [form.name, form.phone, form.address, form.city, form.pincode])

  const cartItems = items.map((it) => ({ name: it.name, qty: it.qty, price: it.price }))

  const message = useMemo(
    () => buildOrderMessage({ shopName: shop.name, cartItems, totals, customer: form }),
    [shop.name, cartItems, totals, form]
  )

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const attemptSend = () => {
    const { errors: errs, valid } = validateCheckout(form)
    setErrors(errs)
    if (!valid) {
      push('Please fix the highlighted fields.', 'error')
      return
    }
    const opened = openWhatsApp(shop.phone, message)
    if (opened) {
      setPhase('sent')
    } else {
      // Popup blocked or WhatsApp unavailable → show fallback with copy option
      push('WhatsApp could not be opened — copy your order instead.', 'error')
      setPhase('fallback')
    }
  }

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      push('Order copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can fail on non-secure contexts; fall back to execCommand
      try {
        const ta = document.createElement('textarea')
        ta.value = message
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
        setCopied(true)
        push('Order copied!', 'success')
        setTimeout(() => setCopied(false), 2000)
      } catch {
        push('Could not copy — please select the message text manually.', 'error')
      }
    }
  }

  const waUrl = whatsappLink(shop.phone, message)

  if (phase === 'sent' || phase === 'fallback') {
    return (
      <div className="checkout-done">
        <div className="done-icon">
          <PackageCheck size={30} />
        </div>
        <h3>{phase === 'sent' ? 'Order sent to WhatsApp! 🎉' : 'Your order is ready to send'}</h3>
        <p>
          {phase === 'sent'
            ? 'The order opened in WhatsApp. Just press send and the seller receives all the details instantly.'
            : 'We could not open WhatsApp automatically. Copy the message below and paste it in the seller’s WhatsApp chat.'}
        </p>
        <pre className="order-preview">{message}</pre>
        <div className="checkout-done-actions">
          <button className="btn btn-ghost" onClick={copyMessage}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Order Message'}
          </button>
          {waUrl && (
            <a className="btn btn-wa" href={waUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} /> Open WhatsApp
            </a>
          )}
          <button
            className="btn btn-primary"
            onClick={() => {
              onDone && onDone()
            }}
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout">
      <h3 className="checkout-title">Your details</h3>
      <div className="field">
        <label className="field-label">Name *</label>
        <input value={form.name} onChange={set('name')} placeholder="Rahul Kumar" />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>
      <div className="field">
        <label className="field-label">Phone Number</label>
        <input value={form.phone} onChange={set('phone')} placeholder="98765 43210" inputMode="tel" />
        {errors.phone && <p className="field-error">{errors.phone}</p>}
      </div>
      <div className="field">
        <label className="field-label">Delivery Address *</label>
        <textarea value={form.address} onChange={set('address')} placeholder="House no, street, area" rows={2} />
        {errors.address && <p className="field-error">{errors.address}</p>}
      </div>
      <div className="checkout-row">
        <div className="field">
          <label className="field-label">City</label>
          <input value={form.city} onChange={set('city')} placeholder="Vijayawada" />
        </div>
        <div className="field">
          <label className="field-label">Pincode</label>
          <input value={form.pincode} onChange={set('pincode')} placeholder="520001" inputMode="numeric" />
          {errors.pincode && <p className="field-error">{errors.pincode}</p>}
        </div>
      </div>
      <div className="field">
        <label className="field-label">Order Note</label>
        <input value={form.note} onChange={set('note')} placeholder="Please call before delivery" />
      </div>

      <div className="checkout-total">
        <span>Total to pay via WhatsApp</span>
        <strong>{formatINR(totals.total)}</strong>
      </div>

      <button className="btn btn-wa btn-block btn-lg" onClick={attemptSend}>
        <MessageCircle size={18} /> Send Order to WhatsApp
      </button>
      <button className="btn btn-ghost btn-block" onClick={copyMessage}>
        {copied ? <Check size={15} /> : <Copy size={15} />} Copy Order Message
      </button>
      <p className="checkout-note">
        No online payment — you agree on price & payment directly with the seller on WhatsApp.
      </p>
      {onClose && (
        <button className="checkout-back" onClick={onClose}>
          ← Back to cart
        </button>
      )}
    </div>
  )
}
