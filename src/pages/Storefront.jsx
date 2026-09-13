import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ShoppingBag, ExternalLink, Sparkles, Store } from 'lucide-react'
import { StoreHeader } from '../components/StoreHeader.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { CategoryFilter } from '../components/CategoryFilter.jsx'
import { ProductGrid } from '../components/ProductGrid.jsx'
import { ProductModal } from '../components/ProductModal.jsx'
import { CartDrawer } from '../components/CartDrawer.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { themeVars } from '../data/themes.js'
import { decodeConfig, configToStore } from '../utils/storeEncoder.js'
import { flyToCart, bounceEl } from '../utils/flyToCart.js'
import { formatINR } from '../utils/pricing.js'
import { normalizePhone } from '../utils/whatsapp.js'

export default function Storefront() {
  const [searchParams] = useSearchParams()
  const dataParam = searchParams.get('data')
  const demoParam = searchParams.get('demo')
  const { store: localStore, loadDemo } = useStore()
  const { items, add, inc, dec, remove, totals } = useCart()
  const { push } = useToast()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [openProduct, setOpenProduct] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const cartBtnRef = useRef(null)
  const gridRef = useRef(null)

  // Shared store mode: decode ?data=… synchronously (pure function of the URL).
  const { store: sharedStore, error: sharedError } = useMemo(() => {
    if (!dataParam) return { store: null, error: false }
    const config = decodeConfig(dataParam)
    return config
      ? { store: configToStore(config), error: false }
      : { store: null, error: true }
  }, [dataParam])

  // "See Demo Store" from the landing page: auto-load demo if the device has no store.
  useEffect(() => {
    if (demoParam === '1' && !localStore) {
      loadDemo()
    }
  }, [demoParam, localStore, loadDemo])

  const activeStore = sharedStore || localStore
  const isShared = Boolean(sharedStore)

  const products = activeStore?.products || []
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const inCat =
        category === 'All' ||
        (category === 'New Arrivals' && Date.now() - (p.createdAt || 0) < 14 * 86400000) ||
        (category === 'Sale' && p.discountPrice && p.discountPrice > 0 && p.discountPrice < Number(p.price)) ||
        (p.category === category)
      if (!inCat) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
    })
  }, [products, query, category])

  const brand = activeStore?.brand || {}
  const vars = useMemo(() => themeVars(brand.theme, brand), [brand.theme, brand.accent, brand.cardRadius, brand.font])

  const handleAdd = useCallback(
    (product, qty, imgEl) => {
      if (product.stock === 'out') {
        push('Sorry, this item is out of stock.', 'error')
        return
      }
      add(product, qty || 1)
      const fab = cartBtnRef.current
      const target =
        fab && fab.offsetWidth > 0 ? fab : document.querySelector('.sf-mobile-cartbar')
      flyToCart(imgEl, target)
      if (target) bounceEl(target)
      push('Added to cart', 'success')
    },
    [add, push]
  )

  const browse = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // ── Error / empty shells ─────────────────────────────────────────────
  if (sharedError) {
    return (
      <div className="sf sf-no-store">
        <Shell>
          <EmptyState
            emoji="🔗"
            title="This shared link appears incomplete"
            subtitle="The catalogue data in the link may have been cut off. Ask the seller to re-share it — ideally by copying the full link from the Share dialog."
            action={{ label: 'Go to Digital Dukaan', onClick: () => { window.location.hash = '#/' } }}
          />
        </Shell>
      </div>
    )
  }

  if (!activeStore) {
    return (
      <div className="sf sf-no-store">
        <Shell>
          <EmptyState
            emoji="🏪"
            title="No store on this device yet"
            subtitle="This is the storefront view. Create your own dukaan, or load the Meera Fashion demo to see it in action."
          >
            <div className="no-store-actions">
              <Link to="/owner" className="btn btn-primary">
                <Store size={16} /> Create My Dukaan
              </Link>
              <button className="btn btn-ghost" onClick={() => loadDemo()}>
                <Sparkles size={16} /> Load Demo Store
              </button>
            </div>
          </EmptyState>
        </Shell>
      </div>
    )
  }

  const phoneOk = Boolean(normalizePhone(activeStore.shop.phone))
  const hasCart = items.length > 0

  return (
    <div className="sf" data-btn={brand.buttonStyle || 'gradient'} style={vars}>
      {!isShared && (
        <div className="sf-owner-banner">
          <span>
            👁️ Owner preview — customers will see your store via your share link.{' '}
            <Link to="/owner" className="sf-owner-link">
              Open Owner Studio →
            </Link>
          </span>
        </div>
      )}
      <StoreHeader shop={activeStore.shop} brand={brand} />

      <div className="sf-sticky">
        <div className="sf-sticky-inner">
          <SearchBar value={query} onChange={setQuery} />
          <CategoryFilter products={products} active={category} onChange={setCategory} />
        </div>
      </div>

      <main className="sf-main" ref={gridRef}>
        {products.length === 0 ? (
          <EmptyState
            compact
            emoji="🛍️"
            title="No products yet"
            subtitle="This dukaan is being stocked. Check back soon!"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            compact
            emoji="🔍"
            title="Nothing matches"
            subtitle={`No products found for “${query || category}”. Try a different search or category.`}
          />
        ) : (
          <ProductGrid products={filtered} onOpen={setOpenProduct} onAdd={handleAdd} />
        )}

        <footer className="sf-footer">
          <span>🛍️ {activeStore.shop.name || 'My Dukaan'}</span>
          <Link to="/" className="sf-powered" title="Powered by Digital Dukaan">
            Powered by Digital Dukaan <ExternalLink size={11} />
          </Link>
        </footer>
      </main>

      {/* Floating cart (desktop) / sticky bar (mobile) */}
      {hasCart && !cartOpen && (
        <>
          <button
            ref={cartBtnRef}
            className="sf-cart-fab"
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingBag size={19} />
            <span className="sf-cart-label">Cart</span>
            <span className="sf-cart-count">{totals.count}</span>
            <span className="sf-cart-total">{formatINR(totals.total)}</span>
          </button>
          <div className="sf-mobile-cartbar" onClick={() => setCartOpen(true)} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setCartOpen(true)}>
            <span className="sf-mc-left">
              <ShoppingBag size={18} />
              <strong>{totals.count} item{totals.count > 1 ? 's' : ''}</strong>
            </span>
            <span className="sf-mc-right">
              {formatINR(totals.total)} <em>→ Order</em>
            </span>
          </div>
        </>
      )}

      <ProductModal
        product={openProduct}
        shop={activeStore.shop}
        onClose={() => setOpenProduct(null)}
        onAdd={handleAdd}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        shop={activeStore.shop}
        onBrowse={browse}
      />

      {!phoneOk && hasCart && (
        <div className="sf-phone-warn">
          ⚠️ This shop hasn’t added a WhatsApp number yet — orders can’t be sent.
        </div>
      )}
    </div>
  )
}

function Shell({ children }) {
  return (
    <div className="sf-shell-inner">
      <div className="sf-shell-brand">🛍️ Digital Dukaan</div>
      <div className="sf-shell-body">{children}</div>
    </div>
  )
}
