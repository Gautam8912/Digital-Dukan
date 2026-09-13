/**
 * whatsapp.js — WhatsApp deep-link helpers.
 * The order message is ALWAYS URL-encoded with encodeURIComponent().
 */
import { formatINR, cartTotals } from './pricing.js'

/** Returns a digit-only number suitable for wa.me, or null if invalid. */
export function normalizePhone(input) {
  const d = String(input || '').replace(/\D/g, '')
  if (!d) return null
  if (d.length === 10 && /^[6-9]/.test(d)) return '91' + d
  if (d.length === 12 && d.startsWith('91') && /^[6-9]/.test(d[2])) return d
  if (d.length === 12 && d.startsWith('0') && /^[6-9]/.test(d[3])) return '91' + d.slice(1)
  return null
}

export function whatsappLink(phone, message) {
  const p = normalizePhone(phone)
  if (!p) return null
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`
}

/**
 * Opens WhatsApp in a new tab.
 * Returns true when a window was opened, false when blocked/unavailable
 * (callers should then offer "Copy Order Message").
 */
export function openWhatsApp(phone, message) {
  const url = whatsappLink(phone, message)
  if (!url) return false
  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer')
    return Boolean(win)
  } catch {
    return false
  }
}

/**
 * Builds the formatted order text sent to the seller's WhatsApp.
 * cartItems: [{ name, qty, price (per unit, effective) }]
 * customer:  { name, phone, address, city, pincode, note }
 */
export function buildOrderMessage({ shopName, cartItems, totals, customer = {} }) {
  const lines = []
  lines.push(`Hi${shopName ? `! I want to place an order from *${shopName}*.` : '! I would like to place an order.'}`)
  lines.push('')
  lines.push('🛍️ *Order Details*')
  lines.push('')
  cartItems.forEach((it) => {
    lines.push(`• ${it.qty} × ${it.name} — ${formatINR(it.price * it.qty)}`)
  })
  lines.push('')
  if (totals && totals.discount > 0) {
    lines.push(`💸 Total savings: ${formatINR(totals.discount)}`)
    lines.push('')
  }
  lines.push('━━━━━━━━━━━━━━')
  lines.push(`💰 *Total: ${formatINR(totals ? totals.total : 0)}*`)
  lines.push('━━━━━━━━━━━━━━')
  lines.push('')
  if (customer.name) lines.push(`👤 Name: ${customer.name}`)
  if (customer.phone) lines.push(`📞 Phone: ${customer.phone}`)
  if (customer.address) lines.push(`📍 Address: ${customer.address}`)
  if (customer.city) lines.push(`🏙️ City: ${customer.city}${customer.pincode ? `, ${customer.pincode}` : ''}`)
  if (customer.note) lines.push(`📝 Note: ${customer.note}`)
  lines.push('')
  lines.push('Thank you! 🙏')
  return lines.join('\n')
}

/** Convenience wrapper: build + open. Returns { opened, message, url }. */
export function generateWhatsAppOrder({ shop, cartItems, totals, customer }) {
  const message = buildOrderMessage({
    shopName: shop ? shop.name : '',
    cartItems,
    totals,
    customer
  })
  const url = shop ? whatsappLink(shop.phone, message) : null
  const opened = url ? openWhatsApp(shop.phone, message) : false
  return { opened, message, url }
}

export function buildAskMessage(productName) {
  return `Hi, I want to know more about *${productName}*.`
}

export function buildShareMessage(storeUrl, shopName) {
  return `🛍️ Check out ${shopName || 'my dukaan'} on Digital Dukaan!\n\n${storeUrl}\n\n📱 Shop the full catalogue & order on WhatsApp.`
}

/** wa.me share link without a fixed recipient — user picks the chat. */
export function waShareLink(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

/** Opens WhatsApp's share chooser. Returns true when a window opened. */
export function shareOnWhatsApp(message) {
  try {
    const win = window.open(waShareLink(message), '_blank', 'noopener,noreferrer')
    return Boolean(win)
  } catch {
    return false
  }
}
