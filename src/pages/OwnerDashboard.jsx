import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Tags,
  MessageCircle,
  Store,
  Plus,
  Eye,
  Link2,
  Palette,
  Settings as SettingsIcon,
  Sparkles,
  HardDrive,
  Info
} from 'lucide-react'
import { OwnerLayout } from '../components/OwnerLayout.jsx'
import { ShareModal } from '../components/ShareModal.jsx'
import { ProductPlaceholder } from '../components/ProductPlaceholder.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { storageUsage, StorageError } from '../utils/storage.js'
import { normalizePhone } from '../utils/whatsapp.js'
import { formatINR, effectivePrice } from '../utils/pricing.js'
import { uid } from '../utils/id.js'
import { getDemoStore } from '../data/demoStore.js'
import { useToast } from '../context/ToastContext.jsx'

export default function OwnerDashboard() {
  const { store, applyStore, loadDemo } = useStore()
  const { items } = useCart()
  const { push } = useToast()
  const [shareOpen, setShareOpen] = useState(false)

  const products = store?.products || []
  const categories = useMemo(() => new Set(products.map((p) => p.category).filter(Boolean)), [products])
  const phoneOk = store ? Boolean(normalizePhone(store.shop.phone)) : false
  const usage = useMemo(() => storageUsage(), [store])
  const storeReady = store && products.length > 0 && phoneOk

  const addQuickProduct = () => {
    if (!store) return
    const name = window.prompt('Product name:', 'New Product')
    if (!name || !name.trim()) return
    const priceRaw = window.prompt('Price (₹):', '499')
    const price = Number(priceRaw)
    if (!Number.isFinite(price) || price <= 0) {
      push('Invalid price — product not added.', 'error')
      return
    }
    const cat = window.prompt('Category:', 'General') || 'General'
    const prod = {
      id: uid('p'),
      name: name.trim().slice(0, 80),
      description: '',
      price,
      discountPrice: 0,
      category: cat.trim().slice(0, 40),
      image: null,
      stock: 'available',
      sku: '',
      size: '',
      color: '',
      material: '',
      createdAt: Date.now()
    }
    try {
      applyStore((s) => ({ ...s, products: [...s.products, prod] }))
      push('Product added (photos can be added later from the Products tab).', 'success')
    } catch (e) {
      if (e instanceof StorageError) push(e.message, 'error')
    }
  }

  const loadDemoStore = () => {
    loadDemo()
    push('Demo store loaded — Meera Fashion is ready to browse!', 'success')
  }

  if (!store) {
    return (
      <OwnerLayout title="Welcome to Digital Dukaan" subtitle="Let’s open your shop in two minutes.">
        <div className="dash-empty glass">
          <div className="dash-empty-emoji">🏪</div>
          <h2>Set up your dukaan</h2>
          <p>
            Add your shop details, pick a theme and list your first product. Everything is saved on
            this device — no account, no server.
          </p>
          <div className="dash-empty-actions">
            <Link to="/setup" className="btn btn-primary btn-lg">
              <Sparkles size={17} /> Set Up My Shop
            </Link>
            <button className="btn btn-ghost btn-lg" onClick={loadDemoStore}>
              ✨ Load Demo Store
            </button>
          </div>
          <p className="dash-empty-note">
            Your store is saved on this device. Use the Share button later to send a link to customers.
          </p>
        </div>
      </OwnerLayout>
    )
  }

  return (
    <OwnerLayout
      title="Your Digital Dukaan"
      subtitle={store.shop.name || 'Untitled shop'}
      actions={
        <>
          <Link to="/store" className="btn btn-ghost">
            <Eye size={16} /> Preview Store
          </Link>
          <button className="btn btn-primary" onClick={() => setShareOpen(true)}>
            <Link2 size={16} /> Share Store
          </button>
        </>
      }
    >
      <div className="stat-grid">
        <div className="stat-card glass" style={{ '--grad': 'linear-gradient(135deg,#8b5cf6,#ec4899)' }}>
          <div className="stat-icon"><Package size={19} /></div>
          <div>
            <strong>{products.length}</strong>
            <span>Products</span>
          </div>
        </div>
        <div className="stat-card glass" style={{ '--grad': 'linear-gradient(135deg,#f97316,#f59e0b)' }}>
          <div className="stat-icon"><Tags size={19} /></div>
          <div>
            <strong>{categories.size}</strong>
            <span>Categories</span>
          </div>
        </div>
        <div className="stat-card glass" style={{ '--grad': 'linear-gradient(135deg,#22c55e,#06b6d4)' }}>
          <div className="stat-icon"><MessageCircle size={19} /></div>
          <div>
            <strong>{phoneOk ? 'Connected' : 'Missing'}</strong>
            <span>WhatsApp {phoneOk ? `· ${store.shop.phone}` : 'number needed'}</span>
          </div>
        </div>
        <div className="stat-card glass" style={{ '--grad': storeReady ? 'linear-gradient(135deg,#22c55e,#84cc16)' : 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
          <div className="stat-icon"><Store size={19} /></div>
          <div>
            <strong>{storeReady ? 'Store Ready' : 'In Progress'}</strong>
            <span>{storeReady ? 'Sharing enabled' : 'Finish setup to share'}</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="qa-card" onClick={() => { window.location.hash = '#/owner/products?new=1' }}>
          <span className="qa-emoji">➕</span> Add Product
        </button>
        <Link className="qa-card" to="/store">
          <span className="qa-emoji">👀</span> Preview Store
        </Link>
        <button className="qa-card" onClick={() => setShareOpen(true)}>
          <span className="qa-emoji">🔗</span> Share Store
        </button>
        <Link className="qa-card" to="/owner/customize">
          <span className="qa-emoji">🎨</span> Customize
        </Link>
        <Link className="qa-card" to="/owner/settings">
          <span className="qa-emoji">⚙️</span> Settings
        </Link>
      </div>

      <div className="dash-cols">
        <section className="glass dash-panel">
          <div className="dash-panel-head">
            <h3>Recent Products</h3>
            <Link to="/owner/products" className="dash-link">
              View all →
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="dash-no-products">
              <p>🛍️ Your dukaan is waiting for its first product.</p>
              <button className="btn btn-primary" onClick={() => { window.location.hash = '#/owner/products?new=1' }}>
                <Plus size={16} /> Add Your First Product
              </button>
            </div>
          ) : (
            <div className="dash-recent">
              {[...products]
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                .slice(0, 4)
                .map((p) => (
                  <div className="dash-recent-item" key={p.id}>
                    {p.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      <ProductPlaceholder name={p.name} />
                    )}
                    <div className="dash-recent-meta">
                      <strong>{p.name}</strong>
                      <span>{p.category}</span>
                    </div>
                    <em>{formatINR(effectivePrice(p))}</em>
                  </div>
                ))}
            </div>
          )}
        </section>

        <div className="dash-side">
          <section className="glass dash-panel">
            <div className="dash-panel-head">
              <h3>
                <Info size={15} /> Orders & Sales
              </h3>
            </div>
            <p className="dash-note-text">
              Orders are received directly in WhatsApp. There is no order database and no analytics
              dashboard — <strong>your WhatsApp chat is your order inbox.</strong> Reply to each message
              to confirm price, payment and delivery.
            </p>
            {items.length > 0 && (
              <p className="dash-note-soft">
                ⓘ {items.length} item{items.length > 1 ? 's' : ''} currently in the local cart (this
                device). Customers on their own devices have their own carts.
              </p>
            )}
          </section>

          <section className="glass dash-panel">
            <div className="dash-panel-head">
              <h3>
                <HardDrive size={15} /> Storage
              </h3>
            </div>
            <div className="storage-meter">
              <div className="storage-bar">
                <div
                  className={`storage-fill ${usage.percent > 80 ? 'storage-warn' : ''}`}
                  style={{ width: `${Math.max(2, usage.percent)}%` }}
                />
              </div>
              <span>{usage.percent}% of browser storage used</span>
            </div>
            {usage.percent > 80 && (
              <p className="storage-warn-text">
                ⚠️ Storage is nearly full. Consider removing a large product photo or exporting a backup
                and trimming it.
              </p>
            )}
          </section>
        </div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </OwnerLayout>
  )
}
