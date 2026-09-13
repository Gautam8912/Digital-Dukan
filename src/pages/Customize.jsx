import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Palette, Eye, RotateCcw } from 'lucide-react'
import { OwnerLayout } from '../components/OwnerLayout.jsx'
import { ThemePicker } from '../components/ThemePicker.jsx'
import { ImageUploader } from '../components/ImageUploader.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { ACCENTS, BUTTON_STYLES, FONTS, themeVars, getTheme } from '../data/themes.js'
import { formatINR, effectivePrice } from '../utils/pricing.js'
import { ProductPlaceholder } from '../components/ProductPlaceholder.jsx'

export default function Customize() {
  const { store, patchBrand } = useStore()
  const { push } = useToast()
  const [accentCustom, setAccentCustom] = useState('')

  if (!store) {
    return (
      <OwnerLayout title="Customize" subtitle="Nothing to customize yet">
        <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
          <h3>Set up your shop first</h3>
          <p>Customization unlocks once your dukaan exists.</p>
          <Link className="btn btn-primary" to="/setup">
            <Palette size={16} /> Set Up My Shop
          </Link>
        </div>
      </OwnerLayout>
    )
  }

  const brand = store.brand
  const theme = getTheme(brand.theme)
  const vars = themeVars(brand.theme, brand)

  const sample = (store.products || [])[0] || {
    name: 'Blue Silk Saree',
    description: 'A sample product so you can see how cards will look in your chosen theme.',
    price: 1499,
    discountPrice: 1199
  }

  return (
    <OwnerLayout
      title="Customize"
      subtitle="Theme, colours and logo — changes apply to the storefront instantly."
      actions={
        <Link to="/store" className="btn btn-ghost">
          <Eye size={16} /> Preview Store
        </Link>
      }
    >
      <div className="cust-grid">
        <div className="cust-col">
          <section className="glass cust-panel">
            <h3>🎨 Theme</h3>
            <ThemePicker value={brand.theme} onChange={(t) => patchBrand({ theme: t })} />
          </section>

          <section className="glass cust-panel">
            <h3>️ Accent Colour</h3>
            <p className="cust-hint">Overrides the theme’s primary colour (buttons, badges, highlights).</p>
            <div className="accent-row">
              <button
                className={`accent-swatch accent-reset ${!brand.accent ? 'active' : ''}`}
                onClick={() => {
                  patchBrand({ accent: null })
                  setAccentCustom('')
                }}
              >
                Auto
              </button>
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  className={`accent-swatch ${brand.accent === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => {
                    patchBrand({ accent: c })
                    setAccentCustom('')
                  }}
                  aria-label={`Accent ${c}`}
                />
              ))}
              <label className="accent-custom">
                <input
                  type="color"
                  value={brand.accent || '#7c3aed'}
                  onChange={(e) => {
                    patchBrand({ accent: e.target.value })
                    setAccentCustom(e.target.value)
                  }}
                />
                <span>{accentCustom || 'Custom…'}</span>
              </label>
            </div>
          </section>

          <section className="glass cust-panel">
            <h3> Buttons & Shape</h3>
            <div className="field">
              <label className="field-label">Button Style</label>
              <div className="btnstyle-row">
                {BUTTON_STYLES.map((b) => (
                  <button
                    key={b.id}
                    className={`btnstyle ${brand.buttonStyle === b.id ? 'active' : ''}`}
                    data-btn={b.id}
                    onClick={() => patchBrand({ buttonStyle: b.id })}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="field-label">Card Roundness — {brand.cardRadius}px</label>
              <input
                type="range"
                min="8"
                max="32"
                value={brand.cardRadius || 20}
                onChange={(e) => patchBrand({ cardRadius: Number(e.target.value) })}
                className="range"
              />
            </div>
            <div className="field">
              <label className="field-label">Font Style</label>
              <div className="btnstyle-row">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    className={`btnstyle ${brand.font === f.id ? 'active' : ''}`}
                    style={{ fontFamily: f.stack }}
                    onClick={() => patchBrand({ font: f.id })}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="glass cust-panel">
            <h3>🏷️ Shop Logo</h3>
            <ImageUploader value={brand.logo} onChange={(v) => patchBrand({ logo: v })} label="Logo" />
          </section>
        </div>

        <div className="cust-col">
          <section className="cust-preview-wrap">
            <div className="cust-preview-label">
              <Eye size={14} /> Live preview — {theme.label}
            </div>
            <div className="cust-preview" data-btn={brand.buttonStyle} style={vars}>
              <div className="cp-shop">
                {brand.logo ? (
                  <img src={brand.logo} alt="logo" />
                ) : (
                  <div className="cp-avatar">{(store.shop.name || 'D').charAt(0).toUpperCase()}</div>
                )}
                <div>
                  <strong>{store.shop.name || 'My Dukaan'}</strong>
                  <em>{store.shop.description || 'Your shop description'}</em>
                </div>
              </div>
              <div className="cp-card">
                <div className="cp-img">
                  {sample.image ? (
                    <img src={sample.image} alt="" />
                  ) : (
                    <ProductPlaceholder name={sample.name} />
                  )}
                  <span className="cp-badge">{Math.round(((sample.price - effectivePrice(sample)) / sample.price) * 100)}% OFF</span>
                </div>
                <div className="cp-body">
                  <h4>{sample.name}</h4>
                  {sample.description && <p>{sample.description}</p>}
                  <div className="cp-row">
                    <div>
                      {sample.discountPrice > 0 && <s>{formatINR(sample.price)}</s>}
                      <strong>{formatINR(effectivePrice(sample))}</strong>
                    </div>
                    <button className="cp-add">Add to Cart</button>
                  </div>
                </div>
              </div>
              <button className="cp-wa">💬 Order on WhatsApp</button>
            </div>
            <button
              className="btn btn-ghost btn-block cust-reset"
              onClick={() => {
                patchBrand({ theme: 'modern', accent: null, buttonStyle: 'gradient', cardRadius: 20, font: 'modern' })
                push('Theme reset to defaults', 'info')
              }}
            >
              <RotateCcw size={15} /> Reset theme to defaults
            </button>
          </section>
        </div>
      </div>
    </OwnerLayout>
  )
}
