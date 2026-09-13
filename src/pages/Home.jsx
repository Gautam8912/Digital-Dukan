import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Link2,
  Palette,
  ShieldCheck,
  ImageDown,
  HardDriveDownload,
  Smartphone,
  Store,
  Sparkles
} from 'lucide-react'
import { PhoneMockup } from '../components/PhoneMockup.jsx'
import { THEME_LIST } from '../data/themes.js'

const FEATURES = [
  {
    icon: Smartphone,
    title: 'Zero backend, zero login',
    text: 'Your store lives in the browser. No servers, no accounts, no monthly fee — it works offline-first.',
    grad: ['#8b5cf6', '#ec4899']
  },
  {
    icon: MessageCircle,
    title: 'Orders land on WhatsApp',
    text: 'Customers browse, fill a cart and their full order arrives in your WhatsApp chat — formatted & ready.',
    grad: ['#22c55e', '#06b6d4']
  },
  {
    icon: Link2,
    title: 'One shareable link',
    text: 'Your catalogue is packed into a single link. Share it on Instagram, Status, or any group.',
    grad: ['#f97316', '#f59e0b']
  },
  {
    icon: Palette,
    title: '10 beautiful themes',
    text: 'Purple Dream, Mango, Emerald, Luxury gold… pick a mood and your store restyles instantly.',
    grad: ['#3b82f6', '#8b5cf6']
  },
  {
    icon: ImageDown,
    title: 'Photos never leave the device',
    text: 'Uploads are compressed in the browser with the File API. Nothing is uploaded to any server.',
    grad: ['#e11d48', '#f472b6']
  },
  {
    icon: HardDriveDownload,
    title: 'Export & backup anytime',
    text: 'Download your whole dukaan as a JSON file. Import it on any device and keep selling.',
    grad: ['#0ea5e9', '#6366f1']
  }
]

const STEPS = [
  {
    n: '01',
    emoji: '🏪',
    title: 'Create your dukaan',
    text: 'Add your shop name, WhatsApp number and a few products with photos. Two minutes, tops.'
  },
  {
    n: '02',
    emoji: '🔗',
    title: 'Share your link',
    text: 'One link, anywhere — Instagram bio, WhatsApp status, family groups. No app installs needed.'
  },
  {
    n: '03',
    emoji: '💬',
    title: 'Get orders on WhatsApp',
    text: 'Customers’ carts arrive as neat, ready-to-reply messages. Your chat is your order inbox.'
  }
]

export default function Home() {
  return (
    <div className="home">
      <nav className="nav">
        <Link to="/" className="nav-brand">
          <span className="nav-bag">🛍️</span>
          <span>
            <strong>Digital Dukaan</strong>
            <em>Apni Dukaan, Ab WhatsApp Par</em>
          </span>
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#privacy">Privacy</a>
        </div>
        <Link to="/owner" className="btn btn-primary nav-cta">
          Create My Dukaan
        </Link>
      </nav>

      <section className="hero">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <Sparkles size={14} /> For home businesses, resellers & Instagram sellers
            </span>
            <h1>
              Turn Your WhatsApp Into a <span className="grad-text">Digital Dukaan.</span>
            </h1>
            <p className="hero-sub">
              Show your products, collect orders and sell directly on WhatsApp — without building a
              complicated online store.
            </p>
            <div className="hero-ctas">
              <Link to="/owner" className="btn btn-primary btn-lg">
                Create My Dukaan <span className="btn-arrow">→</span>
              </Link>
              <Link to="/store?demo=1" className="btn btn-ghost btn-lg">
                See Demo Store
              </Link>
            </div>
            <div className="hero-trust">
              <span>✓ No backend</span>
              <span>✓ No login</span>
              <span>✓ 100% in your browser</span>
              <span>✓ Free forever</span>
            </div>
          </div>
          <div className="hero-visual">
            <PhoneMockup />
          </div>
        </div>
      </section>

      <section className="strip">
        <span>🛍️ Boutiques</span>
        <span>💍 Jewellery</span>
        <span>🍰 Bakers</span>
        <span>🧵 Handicrafts</span>
        <span>🧁 Resellers</span>
        <span>🪔 Home businesses</span>
        <span>👗 Instagram sellers</span>
        <span>📦 WhatsApp sellers</span>
      </section>

      <section className="section" id="features">
        <div className="section-head">
          <span className="section-eyebrow">Why Digital Dukaan</span>
          <h2>Everything a small seller needs. <span className="grad-text">Nothing it doesn’t.</span></h2>
        </div>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div className="feat-card glass" key={f.title}>
              <div className="feat-icon" style={{ background: `linear-gradient(135deg, ${f.grad[0]}, ${f.grad[1]})` }}>
                <f.icon size={20} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt" id="how">
        <div className="section-head">
          <span className="section-eyebrow">How it works</span>
          <h2>Three steps. <span className="grad-text">Zero code.</span></h2>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step-card glass" key={s.n}>
              <div className="step-top">
                <span className="step-n">{s.n}</span>
                <span className="step-emoji">{s.emoji}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="section-eyebrow">Themes</span>
          <h2>Pick a mood for your dukaan</h2>
        </div>
        <div className="theme-strip">
          {THEME_LIST.map((t) => (
            <div className="theme-chip" key={t.id}>
              <span className="theme-chip-dot" style={{ background: `linear-gradient(135deg, ${t.grad[0]}, ${t.grad[1]})` }} />
              <div>
                <strong>{t.label}</strong>
                <em>{t.tagline}</em>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="privacy">
        <div className="privacy-card glass">
          <div className="privacy-icon">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2>Your store data stays in your browser.</h2>
            <p>
              Digital Dukaan is a <strong>zero-backend</strong> app. No account is required. Product
              images are processed locally on your device and never uploaded. Orders are sent directly
              from the customer’s phone to your WhatsApp. Digital Dukaan does not operate a central
              order database — there is no server to compromise, and nothing to pay for.
            </p>
            <div className="privacy-badges">
              <span>🔒 No account</span>
              <span>📴 No server</span>
              <span>🖼️ Local image processing</span>
              <span>💬 Orders → your WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <Store size={40} className="cta-band-icon" />
        <h2>Ready to open your dukaan?</h2>
        <p>Add products → share your link → get orders on WhatsApp.</p>
        <Link to="/owner" className="btn btn-light btn-lg">
          Create My Dukaan — it’s free
        </Link>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-brand">🛍️ Digital Dukaan</span>
          <span className="footer-tag">Apni Dukaan, Ab WhatsApp Par 🇮</span>
          <span className="footer-fine">
            Zero backend · No login · Your data stays in your browser
          </span>
        </div>
      </footer>
    </div>
  )
}
