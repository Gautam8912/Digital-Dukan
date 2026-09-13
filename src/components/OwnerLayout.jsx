import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Store,
  Palette,
  Settings as SettingsIcon,
  ShoppingBag,
  Eye
} from 'lucide-react'
import { useStore } from '../context/StoreContext.jsx'

const TABS = [
  { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/owner/products', label: 'Products', icon: Package, end: false },
  { to: '/store', label: 'Storefront', icon: Eye, end: false },
  { to: '/owner/customize', label: 'Customize', icon: Palette, end: false },
  { to: '/owner/settings', label: 'Settings', icon: SettingsIcon, end: false }
]

export function OwnerLayout({ title, subtitle, actions, children }) {
  const { store } = useStore()
  const navigate = useNavigate()
  const shopName = store && store.shop && store.shop.name

  return (
    <div className="owner-shell">
      <aside className="owner-side">
        <Link to="/" className="owner-brand">
          <span className="owner-brand-bag">🛍️</span>
          <span className="owner-brand-text">
            <strong>Digital Dukaan</strong>
            <em>Owner Studio</em>
          </span>
        </Link>
        <nav className="owner-nav">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="owner-nav-link">
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="owner-side-foot">
          <div className="owner-shop-card">
            <span className="owner-shop-avatar">{(shopName || 'M').charAt(0).toUpperCase()}</span>
            <span className="owner-shop-meta">
              <strong>{shopName || 'Your shop'}</strong>
              <em>Saved on this device</em>
            </span>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/store')}>
            <ShoppingBag size={16} /> View My Store
          </button>
        </div>
      </aside>

      <div className="owner-main">
        <header className="owner-topbar">
          <div>
            <h1 className="owner-title">{title}</h1>
            {subtitle && <p className="owner-sub">{subtitle}</p>}
          </div>
          {actions && <div className="owner-actions">{actions}</div>}
        </header>
        <main className="owner-content">{children}</main>
      </div>

      <nav className="owner-tabs" aria-label="Owner navigation">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="owner-tab">
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
