/**
 * Logic tests for Digital Dukaan utils (run: npm run test:logic)
 * Verifies pricing, validation, WhatsApp encoding, store encoding round-trip,
 * and export/import normalization without a browser.
 */
import assert from 'node:assert/strict'

// Minimal browser shims
globalThis.window = {
  localStorage: (() => {
    const m = new Map()
    return {
      getItem: (k) => (m.has(k) ? m.get(k) : null),
      setItem: (k, v) => m.set(k, String(v)),
      removeItem: (k) => m.delete(k),
      clear: () => m.clear()
    }
  })()
}
globalThis.atob = (s) => Buffer.from(s, 'base64').toString('binary')
globalThis.btoa = (s) => Buffer.from(s, 'binary').toString('base64')

let passed = 0
const ok = (name, fn) => {
  fn()
  passed += 1
  console.log(`  ✓ ${name}`)
}

console.log('pricing.js')
const { effectivePrice, discountPercent, cartTotals, formatINR } = await import('../src/utils/pricing.js')
ok('effectivePrice picks discounted price', () => {
  assert.equal(effectivePrice({ price: 1200, discountPrice: 999 }), 999)
})
ok('effectivePrice ignores higher discount', () => {
  assert.equal(effectivePrice({ price: 1200, discountPrice: 1500 }), 1200)
  assert.equal(effectivePrice({ price: 1200, discountPrice: 0 }), 1200)
})
ok('discountPercent rounds', () => {
  assert.equal(discountPercent({ price: 1499, discountPrice: 1199 }), 20)
  assert.equal(discountPercent({ price: 100, discountPrice: 0 }), 0)
})
ok('cartTotals computes subtotal/discount/total', () => {
  const t = cartTotals([
    { qty: 2, original: 1200, price: 999 },
    { qty: 1, original: 600, price: 600 }
  ])
  assert.equal(t.subtotal, 3000)
  assert.equal(t.total, 2598)
  assert.equal(t.discount, 402)
  assert.equal(t.count, 3)
})
ok('formatINR uses Indian grouping', () => {
  assert.equal(formatINR(100000), '₹1,00,000')
  assert.equal(formatINR(3000), '₹3,000')
})

console.log('validation.js')
const { validatePhone, validatePrice, validateProduct, validateCheckout } = await import('../src/utils/validation.js')
ok('validatePhone accepts 10-digit Indian mobile', () => {
  assert.equal(validatePhone('98765 43210'), '9876543210')
  assert.equal(validatePhone('+91 9876543210'), '919876543210')
  assert.equal(validatePhone('12345'), null)
  assert.equal(validatePhone('5678901234'), null) // must start 6-9
})
ok('validatePrice rejects 0/negative/garbage', () => {
  assert.equal(validatePrice(1200), 1200)
  assert.equal(validatePrice(0), null)
  assert.equal(validatePrice('abc'), null)
  assert.equal(validatePrice(-5), null)
})
ok('validateProduct catches missing name & bad discount', () => {
  const r = validateProduct({ name: '', price: '100', discountPrice: '200', category: 'X' })
  assert.equal(r.valid, false)
  assert.ok(r.errors.name)
  assert.ok(r.errors.discountPrice)
  const good = validateProduct({ name: 'Saree', price: '100', discountPrice: '50', category: 'Sarees' })
  assert.equal(good.valid, true)
})
ok('validateCheckout requires name+address', () => {
  assert.equal(validateCheckout({ name: '', address: '' }).valid, false)
  assert.equal(validateCheckout({ name: 'Rahul', address: 'Vijayawada' }).valid, true)
  assert.equal(validateCheckout({ name: 'R', address: 'A', phone: '123' }).valid, false)
})

console.log('whatsapp.js')
const { buildOrderMessage, buildAskMessage, whatsappLink, normalizePhone } = await import('../src/utils/whatsapp.js')
ok('normalizePhone → wa.me format', () => {
  assert.equal(normalizePhone('9876543210'), '919876543210')
  assert.equal(normalizePhone('919876543210'), '919876543210')
})
ok('whatsappLink URL-encodes the message', () => {
  const url = whatsappLink('9876543210', 'Hi! 2 × Saree — ₹2,400\nName: A&B')
  assert.ok(url.startsWith('https://wa.me/919876543210?text='))
  assert.ok(!url.includes(' '))
  assert.ok(!url.includes('\n'))
  assert.ok(url.includes(encodeURIComponent('Hi! 2 × Saree — ₹2,400\nName: A&B')))
})
ok('buildOrderMessage matches spec format', () => {
  const msg = buildOrderMessage({
    shopName: 'Sharma Fashion',
    cartItems: [
      { name: 'Saree Blue', qty: 2, price: 1200 },
      { name: 'Kurti Red', qty: 1, price: 600 }
    ],
    totals: { subtotal: 3000, total: 3000, discount: 0, count: 3 },
    customer: { name: 'Rahul Kumar', address: 'Vijayawada', note: 'Please call before delivery.' }
  })
  assert.ok(msg.includes('Hi! I want to place an order from *Sharma Fashion*.'))
  assert.ok(msg.includes('• 2 × Saree Blue — ₹2,400'))
  assert.ok(msg.includes('• 1 × Kurti Red — ₹600'))
  assert.ok(msg.includes('💰 *Total: ₹3,000*'))
  assert.ok(msg.includes('👤 Name: Rahul Kumar'))
  assert.ok(msg.includes('📍 Address: Vijayawada'))
  assert.ok(msg.includes('📝 Note: Please call before delivery.'))
  assert.ok(msg.includes('Thank you! 🙏'))
})
ok('buildAskMessage', () => {
  assert.equal(buildAskMessage('Blue Silk Saree'), 'Hi, I want to know more about *Blue Silk Saree*.')
})

console.log('storeEncoder.js')
const { buildShareConfig, encodeConfig, decodeConfig, configToStore, parseHashData } = await import('../src/utils/storeEncoder.js')
const fakeStore = {
  shop: { name: 'Meera Fashion', phone: '919876543210', description: 'Test', address: '', instagram: '', website: '' },
  brand: { theme: 'royal', accent: null, buttonStyle: 'soft', cardRadius: 24, font: 'elegant', logo: 'data:image/png;base64,iVBORw0KGgo=' },
  products: [
    { id: 'p1', name: 'Blue Silk Saree', description: 'd', price: 1499, discountPrice: 1199, category: 'Sarees', image: 'data:image/jpeg;base64,abcd', stock: 'available', createdAt: 1 },
    { id: 'p2', name: 'Kurti', description: '', price: 899, discountPrice: 0, category: 'Kurtis', image: null, stock: 'out', createdAt: 2 }
  ]
}
ok('encode/decode round-trip preserves data', () => {
  const config = buildShareConfig(fakeStore)
  const enc = encodeConfig(config)
  assert.ok(!enc.includes('+') && !enc.includes('/') && !enc.includes('='))
  const dec = decodeConfig(enc)
  assert.equal(dec.shop.name, 'Meera Fashion')
  assert.equal(dec.products.length, 2)
  assert.equal(dec.products[0].name, 'Blue Silk Saree')
  assert.equal(dec.products[0].discountPrice, 1199)
  assert.equal(dec.products[1].stock, 'out')
  assert.equal(dec.brand.theme, 'royal')
  const store = configToStore(dec)
  assert.equal(store.shared, true)
  assert.equal(store.products[0].name, 'Blue Silk Saree')
})
ok('large images are dropped from shared config', () => {
  const big = 'data:image/jpeg;base64,' + 'A'.repeat(200000)
  const config = buildShareConfig({ ...fakeStore, products: [{ ...fakeStore.products[0], image: big }] })
  assert.equal(config.products[0].image, null)
})
ok('parseHashData extracts ?data= from hash', () => {
  assert.equal(parseHashData('#/store?data=abc123'), 'abc123')
  assert.equal(parseHashData('#/store'), null)
  assert.equal(parseHashData('#/store?other=1&data=xyz'), 'xyz')
})
ok('decodeConfig rejects garbage', () => {
  assert.equal(decodeConfig('!!!not-base64!!!'), null)
  assert.equal(decodeConfig(encodeConfig({ v: 99 })), null)
})

console.log('exportImport.js')
const { normalizeStore, validateImportObject, storeToExport } = await import('../src/utils/exportImport.js')
ok('normalizeStore cleans junk', () => {
  const n = normalizeStore({
    shop: { name: 'Shop', phone: '+91 98765-43210' },
    products: [
      { name: 'A', price: '100', discountPrice: '50' },
      { name: 'B', price: -5 }, // invalid → dropped
      null
    ]
  })
  assert.equal(n.shop.phone, '919876543210')
  assert.equal(n.products.length, 1)
  assert.equal(n.products[0].price, 100)
  assert.equal(n.products[0].discountPrice, 50)
  assert.ok(n.products[0].id)
  assert.equal(n.brand.theme, 'modern')
})
ok('validateImportObject accepts both shapes', () => {
  const wrapped = validateImportObject({ app: 'digital-dukaan', version: 1, store: fakeStore })
  assert.equal(wrapped.ok, true)
  assert.equal(wrapped.normalized.products.length, 2)
  const raw = validateImportObject(fakeStore)
  assert.equal(raw.ok, true)
  assert.equal(validateImportObject({ foo: 1 }).ok, false)
  assert.equal(validateImportObject(null).ok, false)
})
ok('storeToExport wraps with app tag', () => {
  const exp = storeToExport(fakeStore)
  assert.equal(exp.app, 'digital-dukaan')
  assert.equal(exp.store.shop.name, 'Meera Fashion')
  assert.ok(exp.exportedAt)
})

console.log('storage.js')
const storage = await import('../src/utils/storage.js')
ok('save/load/clear round-trip', () => {
  storage.saveStore({ version: 1, shop: { name: 'X' }, products: [] })
  const s = storage.loadStore()
  assert.equal(s.shop.name, 'X')
  storage.saveCart([{ id: 'p1', qty: 2 }])
  assert.equal(storage.loadCart().length, 1)
  storage.clearStore()
  assert.equal(storage.loadStore(), null)
  assert.deepEqual(storage.loadCart(), [])
})
ok('corrupted storage returns null', () => {
  window.localStorage.setItem('dd.store.v1', '{broken json!!')
  assert.equal(storage.loadStore(), null)
})

console.log(`\nAll ${passed} logic tests passed ✅`)
