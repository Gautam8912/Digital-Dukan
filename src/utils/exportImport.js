/**
 * exportImport.js — JSON backup / restore for the zero-backend store.
 */
import { uid } from './id.js'

const APP_TAG = 'digital-dukaan'

function slug(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'store'
}

export function storeToExport(store) {
  return {
    app: APP_TAG,
    version: 1,
    exportedAt: new Date().toISOString(),
    store
  }
}

export function downloadStoreBackup(store) {
  const payload = storeToExport(store)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dukaan-${slug(store && store.shop && store.shop.name)}-backup.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
  return a.download
}

function normalizeProduct(p, i) {
  if (!p || typeof p !== 'object' || !p.name) return null
  const price = Number(p.price)
  let discountPrice = Number(p.discountPrice)
  if (!Number.isFinite(price) || price <= 0) return null
  if (!Number.isFinite(discountPrice) || discountPrice <= 0 || discountPrice >= price) discountPrice = 0
  return {
    id: typeof p.id === 'string' && p.id ? p.id : uid('p'),
    name: String(p.name).slice(0, 120),
    description: String(p.description || '').slice(0, 600),
    price,
    discountPrice,
    category: String(p.category || 'Uncategorised').slice(0, 40),
    image: typeof p.image === 'string' && (p.image.startsWith('data:image/') || p.image.startsWith('/')) ? p.image : null,
    stock: p.stock === 'out' ? 'out' : 'available',
    sku: String(p.sku || '').slice(0, 40),
    size: String(p.size || '').slice(0, 40),
    color: String(p.color || '').slice(0, 40),
    material: String(p.material || '').slice(0, 60),
    createdAt: Number(p.createdAt) || Date.now(),
    _dup: i
  }
}

export function normalizeStore(raw) {
  const s = raw && typeof raw === 'object' ? raw : {}
  const shop = s.shop && typeof s.shop === 'object' ? s.shop : {}
  const brand = s.brand && typeof s.brand === 'object' ? s.brand : {}
  const products = Array.isArray(s.products)
    ? s.products.map(normalizeProduct).filter(Boolean)
    : []
  return {
    version: 1,
    shop: {
      name: String(shop.name || 'My Dukaan').slice(0, 80),
      ownerName: String(shop.ownerName || '').slice(0, 80),
      phone: String(shop.phone || '').replace(/\D/g, '').slice(0, 12),
      description: String(shop.description || '').slice(0, 300),
      address: String(shop.address || '').slice(0, 200),
      instagram: String(shop.instagram || '').replace(/^@/, '').slice(0, 40),
      website: String(shop.website || '').slice(0, 120)
    },
    brand: {
      logo: typeof brand.logo === 'string' && (brand.logo.startsWith('data:image/') || brand.logo.startsWith('/')) ? brand.logo : null,
      theme: typeof brand.theme === 'string' ? brand.theme : 'modern',
      accent: typeof brand.accent === 'string' ? brand.accent : null,
      buttonStyle: ['gradient', 'solid', 'soft', 'outline'].includes(brand.buttonStyle) ? brand.buttonStyle : 'gradient',
      cardRadius: Math.min(32, Math.max(8, Number(brand.cardRadius) || 20)),
      font: ['modern', 'elegant', 'playful'].includes(brand.font) ? brand.font : 'modern'
    },
    products
  }
}

export function validateImportObject(obj) {
  if (!obj || typeof obj !== 'object') return { ok: false, errors: ['File is not valid JSON.'] }
  const isWrapped = obj.app === APP_TAG && obj.store && typeof obj.store === 'object'
  const maybe = isWrapped ? obj.store : obj
  if (!maybe || typeof maybe !== 'object') return { ok: false, errors: ['This does not look like a Digital Dukaan backup.'] }
  const hasShop = maybe.shop && typeof maybe.shop === 'object' && Object.keys(maybe.shop).length > 0
  const hasProducts = Array.isArray(maybe.products)
  if (!isWrapped && !hasShop && !hasProducts) {
    return { ok: false, errors: ['This does not look like a Digital Dukaan backup.'] }
  }
  const normalized = normalizeStore(maybe)
  const errors = []
  if (normalized.products.length === 0 && !String(normalized.shop.name).trim()) {
    errors.push('Backup appears to be empty.')
  }
  return { ok: errors.length === 0, errors, normalized }
}

export async function readImportFile(file) {
  if (!file) return { ok: false, errors: ['No file selected.'] }
  if (file.size > 20 * 1024 * 1024) return { ok: false, errors: ['File is too large (max 20 MB).'] }
  let text
  try {
    text = await file.text()
  } catch {
    return { ok: false, errors: ['Could not read the file.'] }
  }
  let obj
  try {
    obj = JSON.parse(text)
  } catch {
    return { ok: false, errors: ['File is not valid JSON.'] }
  }
  return validateImportObject(obj)
}
