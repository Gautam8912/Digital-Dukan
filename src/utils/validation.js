/**
 * validation.js — shared field validators. Each returns the clean value or null.
 */

export const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0

/** Indian mobile: 10 digits starting 6-9, or with country code 91. */
export function validatePhone(input) {
  const d = String(input || '').replace(/\D/g, '')
  if (!d) return null
  if (d.length === 10 && /^[6-9]/.test(d)) return d
  if (d.length === 12 && d.startsWith('91') && /^[6-9]/.test(d[2])) return d
  if (d.length === 11 && d.startsWith('0') && /^[6-9]/.test(d[2])) return '91' + d.slice(1)
  return null
}

export function validatePrice(input) {
  if (input === '' || input === null || input === undefined) return null
  const n = Number(input)
  if (!Number.isFinite(n) || n <= 0) return null
  if (n > 10000000) return null
  return Math.round(n * 100) / 100
}

export function validateDiscountPrice(input, basePrice) {
  if (input === '' || input === null || input === undefined) return null
  const n = Number(input)
  if (!Number.isFinite(n) || n <= 0) return null
  if (basePrice && n >= basePrice) return null
  return Math.round(n * 100) / 100
}

export function validatePincode(input) {
  const d = String(input || '').trim()
  if (!d) return null
  return /^[1-9]\d{5}$/.test(d) ? d : null
}

export function validateProduct(p = {}) {
  const errors = {}
  if (!isNonEmpty(p.name)) errors.name = 'Product name is required.'
  else if (p.name.length > 80) errors.name = 'Keep the name under 80 characters.'
  const price = validatePrice(p.price)
  if (price === null) errors.price = 'Enter a valid price (greater than 0).'
  if (p.discountPrice !== '' && p.discountPrice != null && p.discountPrice !== undefined && String(p.discountPrice).trim() !== '') {
    if (validateDiscountPrice(p.discountPrice, price) === null) {
      errors.discountPrice = 'Discount price must be lower than the price.'
    }
  }
  if (!isNonEmpty(p.category)) errors.category = 'Pick or type a category.'
  return { errors, valid: Object.keys(errors).length === 0 }
}

export function validateCheckout(c = {}) {
  const errors = {}
  if (!isNonEmpty(c.name)) errors.name = 'Please enter your name.'
  if (!isNonEmpty(c.address)) errors.address = 'Delivery address is required.'
  if (c.phone && validatePhone(c.phone) === null) errors.phone = 'Enter a valid 10-digit mobile number.'
  if (c.pincode && validatePincode(c.pincode) === null) errors.pincode = 'Enter a valid 6-digit pincode.'
  return { errors, valid: Object.keys(errors).length === 0 }
}

export function validateShop(s = {}) {
  const errors = {}
  if (!isNonEmpty(s.name)) errors.name = 'Shop name is required.'
  const phone = validatePhone(s.phone)
  if (!phone) errors.phone = 'Enter a valid WhatsApp number (10 digits or with country code).'
  return { errors, valid: Object.keys(errors).length === 0, phone }
}
