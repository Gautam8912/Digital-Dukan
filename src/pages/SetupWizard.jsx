import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Loader2, Store } from 'lucide-react'
import { ThemePicker } from '../components/ThemePicker.jsx'
import { ImageUploader } from '../components/ImageUploader.jsx'
import { validateShop, validateProduct, isNonEmpty } from '../utils/validation.js'
import { uid } from '../utils/id.js'
import { emptyStore, useStore } from '../context/StoreContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { BUTTON_STYLES } from '../data/themes.js'

const STEPS = ['Your Shop', 'Brand', 'First Product']

export default function SetupWizard() {
  const { store, applyStore } = useStore()
  const { push } = useToast()
  const navigate = useNavigate()

  const existing = store || emptyStore()
  const [step, setStep] = useState(0)
  const [shop, setShop] = useState({ ...existing.shop })
  const [brand, setBrand] = useState({ ...existing.brand })
  const [errors, setErrors] = useState({})
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    image: null,
    stock: 'available',
    sku: '',
    size: '',
    color: '',
    material: ''
  })
  const [skipProduct, setSkipProduct] = useState(false)
  const [saving, setSaving] = useState(false)

  const setShopF = (k) => (e) => setShop((s) => ({ ...s, [k]: e.target.value }))
  const setProdF = (k) => (e) => setProduct((s) => ({ ...s, [k]: e.target.value }))

  const next = () => {
    if (step === 0) {
      const { errors: errs, valid } = validateShop(shop)
      setErrors(errs)
      if (!valid) return
    }
    setErrors({})
    setStep((s) => s + 1)
    window.scrollTo({ top: 0 })
  }

  const back = () => {
    setErrors({})
    setStep((s) => Math.max(0, s - 1))
  }

  const finish = () => {
    if (!skipProduct) {
      const { errors: errs, valid } = validateProduct(product)
      if (!valid) {
        setErrors(errs)
        push('Please check the product details.', 'error')
        return
      }
    }
    setSaving(true)
    const base = emptyStore()
    const products = []
    if (!skipProduct) {
      products.push({
        id: uid('p'),
        name: product.name.trim(),
        description: product.description.trim(),
        price: Number(product.price),
        discountPrice: product.discountPrice ? Number(product.discountPrice) : 0,
        category: product.category.trim() || 'Uncategorised',
        image: product.image,
        stock: product.stock,
        sku: product.sku.trim(),
        size: product.size.trim(),
        color: product.color.trim(),
        material: product.material.trim(),
        createdAt: Date.now()
      })
    }
    const final = {
      version: 1,
      shop: {
        ...base.shop,
        name: shop.name.trim(),
        ownerName: shop.ownerName.trim(),
        phone: shop.phone.replace(/\D/g, ''),
        description: shop.description.trim(),
        address: shop.address.trim(),
        instagram: shop.instagram.replace(/^@/, '').trim(),
        website: shop.website.trim()
      },
      brand,
      products
    }
    applyStore(final)
    push('Your dukaan is ready! 🎉', 'success')
    setTimeout(() => navigate('/owner'), 450)
  }

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step])

  return (
    <div className="wiz">
      <div className="wiz-bg" aria-hidden="true" />
      <div className="wiz-wrap">
        <div className="wiz-top">
          <Link to="/" className="wiz-back">
            <ArrowLeft size={15} /> Home
          </Link>
          <div className="wiz-steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`wiz-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <span className="wiz-step-dot">{i < step ? <Check size={11} strokeWidth={3} /> : i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="wiz-progress">
          <div className="wiz-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="wiz-card glass">
          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                next()
              }}
            >
              <h2>
                <Store size={20} /> Your Shop
              </h2>
              <p className="wiz-sub">Tell customers who they’re buying from.</p>
              <div className="field">
                <label className="field-label">Shop Name *</label>
                <input value={shop.name} onChange={setShopF('name')} placeholder="Sharma Fashion" autoFocus />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div className="wiz-row">
                <div className="field">
                  <label className="field-label">Owner Name</label>
                  <input value={shop.ownerName} onChange={setShopF('ownerName')} placeholder="Priya Sharma" />
                </div>
                <div className="field">
                  <label className="field-label">WhatsApp Number *</label>
                  <input value={shop.phone} onChange={setShopF('phone')} placeholder="98765 43210" inputMode="tel" />
                  {errors.phone && <p className="field-error">{errors.phone}</p>}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Shop Description</label>
                <textarea value={shop.description} onChange={setShopF('description')} rows={2} placeholder="What do you sell, and what makes it special?" />
              </div>
              <div className="field">
                <label className="field-label">Address</label>
                <input value={shop.address} onChange={setShopF('address')} placeholder="Street, area, city" />
              </div>
              <div className="wiz-row">
                <div className="field">
                  <label className="field-label">Instagram Username</label>
                  <input value={shop.instagram} onChange={setShopF('instagram')} placeholder="@yourshop" />
                </div>
                <div className="field">
                  <label className="field-label">Website (optional)</label>
                  <input value={shop.website} onChange={setShopF('website')} placeholder="yourshop.com" />
                </div>
              </div>
            </form>
          )}

          {step === 1 && (
            <div>
              <h2>🎨 Brand</h2>
              <p className="wiz-sub">Make it feel like yours. You can change all of this later in Customize.</p>
              <div className="wiz-brand-grid">
                <ImageUploader
                  value={brand.logo}
                  onChange={(v) => setBrand((b) => ({ ...b, logo: v }))}
                  label="Shop Logo (optional)"
                />
                <div>
                  <label className="field-label">Button Style</label>
                  <div className="btnstyle-row">
                    {BUTTON_STYLES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={`btnstyle ${brand.buttonStyle === b.id ? 'active' : ''}`}
                        data-btn={b.id}
                        onClick={() => setBrand((br) => ({ ...br, buttonStyle: b.id }))}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <label className="field-label">Theme Preset</label>
              <ThemePicker value={brand.theme} onChange={(t) => setBrand((b) => ({ ...b, theme: t }))} compact />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2>🛍️ Your First Product</h2>
              <p className="wiz-sub">One product is enough to preview. You can add more any time.</p>
              <div className="field">
                <label className="field-label">Product Name *</label>
                <input value={product.name} onChange={setProdF('name')} placeholder="Blue Silk Saree" />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div className="field">
                <label className="field-label">Description</label>
                <textarea value={product.description} onChange={setProdF('description')} rows={2} placeholder="Fabric, size, what makes it special…" />
              </div>
              <div className="wiz-row-3">
                <div className="field">
                  <label className="field-label">Price (₹) *</label>
                  <input value={product.price} onChange={setProdF('price')} inputMode="decimal" placeholder="1200" />
                  {errors.price && <p className="field-error">{errors.price}</p>}
                </div>
                <div className="field">
                  <label className="field-label">Discount (₹)</label>
                  <input value={product.discountPrice} onChange={setProdF('discountPrice')} inputMode="decimal" placeholder="999" />
                  {errors.discountPrice && <p className="field-error">{errors.discountPrice}</p>}
                </div>
                <div className="field">
                  <label className="field-label">Category *</label>
                  <input value={product.category} onChange={setProdF('category')} placeholder="Sarees" />
                  {errors.category && <p className="field-error">{errors.category}</p>}
                </div>
              </div>
              <ImageUploader
                value={product.image}
                onChange={(v) => setProduct((p) => ({ ...p, image: v }))}
                label="Product Photo"
              />
              <label className="wiz-skip">
                <input type="checkbox" checked={skipProduct} onChange={(e) => setSkipProduct(e.target.checked)} />
                <span>Skip for now — I’ll add products later</span>
              </label>
            </div>
          )}

          <div className="wiz-actions">
            {step > 0 && (
              <button type="button" className="btn btn-ghost" onClick={back} disabled={saving}>
                <ArrowLeft size={15} /> Back
              </button>
            )}
            {step < 2 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={finish} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />} Open My Dukaan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
