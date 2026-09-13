/**
 * SSR smoke-test entry (used only by scripts/ssr-smoke.mjs via vite.ssrLoadModule).
 * Renders every route with renderToString to catch runtime errors.
 */
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProviders } from './context/AppProviders.jsx'
import Home from './pages/Home.jsx'
import SetupWizard from './pages/SetupWizard.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx'
import ProductManager from './pages/ProductManager.jsx'
import Customize from './pages/Customize.jsx'
import Settings from './pages/Settings.jsx'
import Storefront from './pages/Storefront.jsx'
import { buildShareConfig, encodeConfig } from './utils/storeEncoder.js'
import { getDemoStore } from './data/demoStore.js'
import { saveStore } from './utils/storage.js'

function renderEntry(entry) {
  return renderToString(
    <MemoryRouter initialEntries={[entry]}>
      <AppProviders>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<SetupWizard />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/products" element={<ProductManager />} />
          <Route path="/owner/customize" element={<Customize />} />
          <Route path="/owner/settings" element={<Settings />} />
          <Route path="/store" element={<Storefront />} />
        </Routes>
      </AppProviders>
    </MemoryRouter>
  )
}

export function render(path) {
  return renderEntry(path)
}

export function sharedStoreEntry() {
  const demo = getDemoStore()
  const encoded = encodeConfig(buildShareConfig(demo, { includeImages: false }))
  return `/store?data=${encoded}`
}

export function corruptShareEntry() {
  return `/store?data=!!!corrupt@@@`
}

/** Seeds the demo store into (shimmed) localStorage for owner-mode renders. */
export function seedDemoStore() {
  saveStore(getDemoStore())
}
