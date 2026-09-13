/**
 * storage.js — dedicated LocalStorage utility.
 * All persistence for Digital Dukaan goes through here.
 * Handles missing data, corrupted JSON and quota failures gracefully.
 */

const KEYS = {
  store: 'dd.store.v1',
  cart: 'dd.cart.v1',
  customer: 'dd.customer.v1',
  prefs: 'dd.prefs.v1'
}

const CAPACITY = 5 * 1024 * 1024 // ~5MB typical LocalStorage budget

export class StorageError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code // 'full' | 'unavailable'
  }
}

function isQuotaError(e) {
  return (
    e &&
    (e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      e.code === 22 ||
      e.code === 1014)
  )
}

function canUseStorage() {
  try {
    const t = '__dd_test__'
    window.localStorage.setItem(t, '1')
    window.localStorage.removeItem(t)
    return true
  } catch {
    return false
  }
}

function safeParse(raw) {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function guard() {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new StorageError('unavailable', 'Browser storage is not available in this environment.')
  }
}

export function saveStore(store) {
  guard()
  try {
    window.localStorage.setItem(KEYS.store, JSON.stringify(store))
    return true
  } catch (e) {
    if (isQuotaError(e)) throw new StorageError('full', 'Browser storage is nearly full. Try exporting a backup, removing a product image, or using smaller photos.')
    throw new StorageError('unavailable', 'Could not save to browser storage.')
  }
}

export function loadStore() {
  if (!canUseStorage()) return null
  const data = safeParse(window.localStorage.getItem(KEYS.store))
  if (!data || typeof data !== 'object') return null
  if (!data.shop && !Array.isArray(data.products)) return null
  return data
}

export function saveCart(cart) {
  guard()
  try {
    window.localStorage.setItem(KEYS.cart, JSON.stringify(cart || []))
    return true
  } catch (e) {
    if (isQuotaError(e)) throw new StorageError('full', 'Storage is full — the cart could not be saved.')
    return false
  }
}

export function loadCart() {
  if (!canUseStorage()) return []
  const data = safeParse(window.localStorage.getItem(KEYS.cart))
  if (!Array.isArray(data)) return []
  return data.filter(
    (it) => it && it.id && typeof it.qty === 'number' && it.qty > 0
  )
}

export function saveCustomer(customer) {
  try {
    window.localStorage.setItem(KEYS.customer, JSON.stringify(customer || {}))
  } catch {
    /* non-critical */
  }
}

export function loadCustomer() {
  return safeParse(window.localStorage.getItem(KEYS.customer)) || {}
}

export function savePrefs(prefs) {
  try {
    window.localStorage.setItem(KEYS.prefs, JSON.stringify(prefs || {}))
  } catch {
    /* non-critical */
  }
}

export function loadPrefs() {
  return safeParse(window.localStorage.getItem(KEYS.prefs)) || {}
}

export function clearStore() {
  guard()
  Object.values(KEYS).forEach((k) => {
    try {
      window.localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  })
}

/** Rough usage estimate for the storage meter. */
export function storageUsage() {
  if (!canUseStorage()) return { bytes: 0, capacity: CAPACITY, percent: 0 }
  let bytes = 0
  Object.values(KEYS).forEach((k) => {
    const v = window.localStorage.getItem(k)
    if (v) bytes += v.length * 2 // UTF-16
  })
  return { bytes, capacity: CAPACITY, percent: Math.min(100, Math.round((bytes / CAPACITY) * 100)) }
}
