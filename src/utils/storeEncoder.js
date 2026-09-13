/**
 * storeEncoder.js — encodes a lightweight store configuration into the URL
 * so customers can open the storefront on their own device.
 *
 *   https://…/#/store?data=<base64url(JSON)>
 *
 * Images: only *data URLs* small enough to fit are embedded. Uploaded
 * photos that are too large are dropped from the shared link (the storefront
 * shows a designed placeholder instead) — we never pretend a local file is
 * publicly reachable.
 */

const MAX_PRODUCT_IMAGE = 60 * 1024  // ~60KB of data URL each
const MAX_LOGO = 28 * 1024

function b64urlEncode(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s) {
  if (typeof s !== 'string' || !s) return null
  try {
    let t = s.replace(/-/g, '+').replace(/_/g, '/')
    while (t.length % 4) t += '='
    const bin = atob(t)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  } catch {
    return null
  }
}

function smallDataUrl(v, maxBytes) {
  if (typeof v === 'string' && v.startsWith('data:image/') && v.length <= maxBytes) return v
  return null
}

export function buildShareConfig(store, { includeImages = true } = {}) {
  if (!store) return null
  const shop = store.shop || {}
  const brand = store.brand || {}
  const products = (store.products || []).map((p) => ({
    id: p.id,
    name: p.name || '',
    description: p.description || '',
    price: Number(p.price) || 0,
    discountPrice: p.discountPrice ? Number(p.discountPrice) || 0 : 0,
    category: p.category || '',
    stock: p.stock === 'out' ? 'out' : 'available',
    size: p.size || '',
    color: p.color || '',
    material: p.material || '',
    image: includeImages ? smallDataUrl(p.image, MAX_PRODUCT_IMAGE) : null
  }))
  return {
    v: 1,
    app: 'digital-dukaan',
    shop: {
      name: shop.name || '',
      ownerName: shop.ownerName || '',
      phone: shop.phone || '',
      description: shop.description || '',
      address: shop.address || '',
      instagram: shop.instagram || '',
      website: shop.website || ''
    },
    brand: {
      logo: includeImages ? smallDataUrl(brand.logo, MAX_LOGO) : null,
      theme: brand.theme || 'modern',
      accent: brand.accent || null,
      buttonStyle: brand.buttonStyle || 'gradient',
      cardRadius: brand.cardRadius || 20,
      font: brand.font || 'modern'
    },
    products
  }
}

export function encodeConfig(config) {
  return b64urlEncode(JSON.stringify(config))
}

export function decodeConfig(encoded) {
  const json = b64urlDecode(encoded)
  if (!json) return null
  let obj
  try {
    obj = JSON.parse(json)
  } catch {
    return null
  }
  if (!obj || typeof obj !== 'object' || obj.v !== 1) return null
  if (!obj.shop || !Array.isArray(obj.products)) return null
  return obj
}

export function configToStore(config) {
  return {
    version: 1,
    shared: true,
    shop: config.shop || {},
    brand: config.brand || {},
    products: config.products || []
  }
}

/** Full shareable URL for the current app origin. */
export function buildShareUrl(encoded) {
  const base =
    window.location.origin +
    window.location.pathname.replace(/[^/]*$/, '')
  return `${base}#/store?data=${encoded}`
}

/** Reads ?data=… out of a hash like "#/store?data=abc" */
export function parseHashData(hash) {
  const i = hash.indexOf('?')
  if (i === -1) return null
  const qs = new URLSearchParams(hash.slice(i + 1))
  return qs.get('data')
}

export function shareUrlLength(encoded) {
  return buildShareUrl(encoded).length
}

/**
 * Decides what we can honestly embed in the link.
 * Returns { productsWithImages, totalImages, encoded, urlLength }
 */
export function computeShare(store, includeImages) {
  const config = buildShareConfig(store, { includeImages })
  if (!config) return null
  const encoded = encodeConfig(config)
  return {
    config,
    encoded,
    url: buildShareUrl(encoded),
    urlLength: encoded.length + 26,
    productsWithImages: config.products.filter((p) => p.image).length,
    totalProducts: config.products.length
  }
}
