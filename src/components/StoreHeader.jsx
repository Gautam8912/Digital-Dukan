import { MessageCircle, Instagram, Globe, MapPin } from 'lucide-react'
import { normalizePhone, whatsappLink } from '../utils/whatsapp.js'
import { ProductPlaceholder } from './ProductPlaceholder.jsx'

export function StoreHeader({ shop, brand }) {
  const initial = (shop.name || 'D').trim().charAt(0).toUpperCase()
  const phone = normalizePhone(shop.phone)

  return (
    <header className="sf-header">
      <div className="sf-hero-glow" aria-hidden="true" />
      <div className="sf-head-inner">
        <div className="sf-logo">
          {brand.logo ? (
            <img src={brand.logo} alt={`${shop.name || 'Shop'} logo`} />
          ) : (
            <div className="sf-logo-ph">
              <ProductPlaceholder name={shop.name || 'D'} />
            </div>
          )}
        </div>
        <div className="sf-head-text">
          <p className="sf-tag">🛍️ {shop.name || 'My Dukaan'}</p>
          <h1 className="sf-name">{shop.name || 'My Dukaan'}</h1>
          {shop.description && <p className="sf-desc">{shop.description}</p>}
          <div className="sf-meta">
            {shop.address && (
              <span className="sf-meta-item">
                <MapPin size={13} /> {shop.address}
              </span>
            )}
            {shop.instagram && (
              <a
                className="sf-meta-item sf-social"
                href={`https://instagram.com/${shop.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={13} /> @{shop.instagram}
              </a>
            )}
            {shop.website && (
              <a
                className="sf-meta-item sf-social"
                href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={13} /> Website
              </a>
            )}
          </div>
        </div>
        {phone && (
          <a
            className="sf-wa-chip"
            href={whatsappLink(shop.phone, `Hi ${shop.name || 'there'}! I found your dukaan on Digital Dukaan.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        )}
      </div>
    </header>
  )
}
