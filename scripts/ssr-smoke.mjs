/**
 * SSR smoke test: renders every page server-side and asserts key content.
 * Catches missing exports, bad hook usage and render-time crashes.
 * Run: node scripts/ssr-smoke.mjs
 */
import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Minimal localStorage shim so StoreProvider can seed/persist during SSR.
const store = new Map()
globalThis.window = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
    clear: () => void store.clear()
  }
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error'
})

let passed = 0
try {
  const mod = await vite.ssrLoadModule('/src/ssr-test-entry.jsx')

  const check = (name, html, mustInclude) => {
    for (const s of mustInclude) {
      assert.ok(html.includes(s), `${name}: missing "${s}" in output`)
    }
    passed += 1
    console.log(`  ✓ ${name}`)
  }

  console.log('SSR smoke test')
  check('Home landing', mod.render('/'), ['Turn Your WhatsApp Into a', 'Create My Dukaan', 'See Demo Store', 'Meera Fashion', 'Privacy'])
  check('Setup wizard', mod.render('/setup'), ['Your Shop', 'WhatsApp Number', 'Continue', 'Brand', 'First Product'])
  check('Owner dashboard (empty)', mod.render('/owner'), ['Welcome to Digital Dukaan', 'Load Demo Store'])
  check('Product manager (no store)', mod.render('/owner/products'), ['No dukaan yet'])
  check('Customize (no store)', mod.render('/owner/customize'), ['Set up your shop first'])
  check('Settings (no store)', mod.render('/owner/settings'), ['No store to configure yet'])
  check('Storefront (no local store)', mod.render('/store'), ['No store on this device yet', 'Load Demo Store'])
  check('Storefront (shared link)', mod.render(mod.sharedStoreEntry()), ['Meera Fashion', 'Blue Silk Saree', 'Pink Designer Kurti', 'Gold-Plated Jhumka Earrings', 'Search products', 'Powered by Digital Dukaan'])
  check('Storefront (corrupt link)', mod.render(mod.corruptShareEntry()), ['appears incomplete'])

  // ── With a store present (demo seeded into localStorage shim) ──
  mod.seedDemoStore()
  check('Owner dashboard (with store)', mod.render('/owner'), ['Your Digital Dukaan', 'Meera Fashion', 'Store Ready', 'WhatsApp'])
  check('Product manager (with store)', mod.render('/owner/products'), ['Your Products', 'Blue Silk Saree', 'Add Product', 'Edit'])
  check('Customize (with store)', mod.render('/owner/customize'), ['Customize', 'Theme', 'Accent Colour', 'Live preview'])
  check('Settings (with store)', mod.render('/owner/settings'), ['Shop Details', 'Export Store', 'Reset Store'])
  check('Storefront (local store)', mod.render('/store'), ['Meera Fashion', 'Blue Silk Saree', 'Owner preview', 'Search products'])
} catch (e) {
  await vite.close()
  console.error('\nSMOKE TEST FAILED:', e.message)
  process.exit(1)
}

await vite.close()
console.log(`\nAll ${passed} SSR smoke checks passed ✅`)
process.exit(0)
