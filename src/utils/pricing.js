/**
 * pricing.js — price, discount and total calculations.
 */

export function effectivePrice(product) {
  const base = Number(product && product.price) || 0
  const disc = Number(product && product.discountPrice) || 0
  return disc > 0 && disc < base ? disc : base
}

export function originalPrice(product) {
  const base = Number(product && product.price) || 0
  const disc = Number(product && product.discountPrice) || 0
  return disc > 0 ? base : base
}

export function discountPercent(product) {
  const base = Number(product && product.price) || 0
  const disc = Number(product && product.discountPrice) || 0
  if (base <= 0 || disc <= 0 || disc >= base) return 0
  return Math.round(((base - disc) / base) * 100)
}

export function itemLineTotal(product, qty) {
  return effectivePrice(product) * (Number(qty) || 1)
}

/**
 * items: [{ qty, original, price }] where
 *   original = list price of one unit
 *   price    = effective price of one unit
 */
export function cartTotals(items = []) {
  let subtotal = 0
  let total = 0
  let count = 0
  for (const it of items) {
    const q = Number(it.qty) || 0
    subtotal += (Number(it.original) || 0) * q
    total += (Number(it.price) || 0) * q
    count += q
  }
  return { subtotal, total, discount: Math.max(0, subtotal - total), count }
}

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

export function formatINR(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '₹0'
  return '₹' + inr.format(v)
}
