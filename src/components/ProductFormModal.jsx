import { useEffect, useState } from 'react'
import { X, Save } from 'lucide-react'
import { ImageUploader } from './ImageUploader.jsx'
import { validateProduct } from '../utils/validation.js'
import { uid } from '../utils/id.js'
import { useToast } from '../context/ToastContext.jsx'

const EMPTY = {
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
}

export function ProductFormModal({ open, initial, categories, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const { push } = useToast()
  const isEdit = Boolean(initial)

  useEffect(() => {
    if (open) {
      setErrors({})
      setForm(initial ? { ...EMPTY, ...initial, price: String(initial.price), discountPrice: initial.discountPrice ? String(initial.discountPrice) : '' } : EMPTY)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const { errors: errs, valid } = validateProduct(form)
    setErrors(errs)
    if (!valid) return
    const product = {
      ...(initial || { id: uid('p'), createdAt: Date.now() }),
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
      category: form.category.trim() || 'Uncategorised',
      image: form.image,
      stock: form.stock,
      sku: form.sku.trim(),
      size: form.size.trim(),
      color: form.color.trim(),
      material: form.material.trim()
    }
    onSave(product)
    push(isEdit ? 'Product updated' : 'Product added', 'success')
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="pform" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="pform-head">
          <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button type="button" className="cd-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="pform-scroll">
          <div className="pform-img-col">
            <ImageUploader value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} />
          </div>
          <div className="pform-fields">
            <div className="field">
              <label className="field-label">Product Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Blue Silk Saree" maxLength={80} />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>
            <div className="field">
              <label className="field-label">Description</label>
              <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Fabric, occasion, what makes it special…" maxLength={600} />
            </div>
            <div className="pform-row">
              <div className="field">
                <label className="field-label">Price (₹) *</label>
                <input value={form.price} onChange={set('price')} inputMode="decimal" placeholder="1200" />
                {errors.price && <p className="field-error">{errors.price}</p>}
              </div>
              <div className="field">
                <label className="field-label">Discount Price (₹)</label>
                <input value={form.discountPrice} onChange={set('discountPrice')} inputMode="decimal" placeholder="999" />
                {errors.discountPrice && <p className="field-error">{errors.discountPrice}</p>}
              </div>
            </div>
            <div className="pform-row">
              <div className="field">
                <label className="field-label">Category *</label>
                <input
                  value={form.category}
                  onChange={set('category')}
                  placeholder="Sarees"
                  list="dd-cats"
                  maxLength={40}
                />
                <datalist id="dd-cats">
                  {(categories || []).map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.category && <p className="field-error">{errors.category}</p>}
              </div>
              <div className="field">
                <label className="field-label">Stock</label>
                <select value={form.stock} onChange={set('stock')}>
                  <option value="available">Available</option>
                  <option value="out">Out of stock</option>
                </select>
              </div>
            </div>
            <div className="pform-row-4">
              <div className="field">
                <label className="field-label">SKU</label>
                <input value={form.sku} onChange={set('sku')} placeholder="MF-001" />
              </div>
              <div className="field">
                <label className="field-label">Size</label>
                <input value={form.size} onChange={set('size')} placeholder="S / M / L" />
              </div>
              <div className="field">
                <label className="field-label">Colour</label>
                <input value={form.color} onChange={set('color')} placeholder="Royal Blue" />
              </div>
              <div className="field">
                <label className="field-label">Material</label>
                <input value={form.material} onChange={set('material')} placeholder="Cotton" />
              </div>
            </div>
          </div>
        </div>
        <div className="pform-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">
            <Save size={16} /> {isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
