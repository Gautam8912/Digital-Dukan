import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Eye, Pencil, Copy, Trash2 } from 'lucide-react'
import { OwnerLayout } from '../components/OwnerLayout.jsx'
import { ProductFormModal } from '../components/ProductFormModal.jsx'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { ProductPlaceholder } from '../components/ProductPlaceholder.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { formatINR, discountPercent } from '../utils/pricing.js'
import { uid } from '../utils/id.js'

export default function ProductManager() {
  const { store, applyStore } = useStore()
  const { push } = useToast()
  const [params, setParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (params.get('new') === '1') {
      setEditing(null)
      setFormOpen(true)
      setParams({}, { replace: true })
    }
  }, [params, setParams])

  const products = store?.products || []
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))), [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    )
  }, [products, query])

  if (!store) {
    return (
      <OwnerLayout title="Your Products" subtitle="Set up your shop first">
        <EmptyState
          emoji="🏪"
          title="No dukaan yet"
          subtitle="Create your shop and then add products here."
          action={{ label: 'Set Up My Shop', onClick: () => { window.location.hash = '#/setup' } }}
        />
      </OwnerLayout>
    )
  }

  const saveProduct = (product) => {
    applyStore((s) => {
      const exists = s.products.some((p) => p.id === product.id)
      return {
        ...s,
        products: exists ? s.products.map((p) => (p.id === product.id ? product : p)) : [...s.products, product]
      }
    })
  }

  const duplicateProduct = (p) => {
    const copy = { ...p, id: uid('p'), name: `${p.name} (copy)`, createdAt: Date.now() }
    applyStore((s) => ({ ...s, products: [...s.products, copy] }))
    push('Product duplicated', 'success')
  }

  const confirmDelete = () => {
    if (!deleting) return
    applyStore((s) => ({ ...s, products: s.products.filter((p) => p.id !== deleting.id) }))
    push(`“${deleting.name}” deleted`, 'info')
    setDeleting(null)
  }

  return (
    <OwnerLayout
      title="Your Products"
      subtitle={`${products.length} product${products.length === 1 ? '' : 's'} in your catalogue`}
      actions={
        <>
          <Link to="/store" className="btn btn-ghost">
            <Eye size={16} /> Preview Store
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus size={16} /> Add Product
          </button>
        </>
      }
    >
      {products.length === 0 ? (
        <div className="glass product-empty-wrap">
          <EmptyState
            emoji="🛍️"
            title="Your dukaan is waiting for its first product."
            subtitle="Add a photo, a price and a category — that’s all a product needs."
            action={{
              label: 'Add Your First Product',
              onClick: () => {
                setEditing(null)
                setFormOpen(true)
              }
            }}
          />
        </div>
      ) : (
        <>
          <div className="owner-toolbar">
            <input
              className="owner-search"
              placeholder="Search your products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="op-grid">
            {filtered.map((p) => {
              const pct = discountPercent(p)
              return (
                <div className="op-card glass" key={p.id}>
                  <div className="op-img">
                    {p.image ? (
                      <img src={p.image} alt={p.name} loading="lazy" />
                    ) : (
                      <ProductPlaceholder name={p.name} />
                    )}
                    {p.stock === 'out' && <span className="op-stock-out">Out of stock</span>}
                    {pct > 0 && p.stock !== 'out' && <span className="op-pct">{pct}% OFF</span>}
                  </div>
                  <div className="op-body">
                    <h4 title={p.name}>{p.name}</h4>
                    <div className="op-prices">
                      {pct > 0 && <s>{formatINR(p.price)}</s>}
                      <strong>{formatINR(p.discountPrice || p.price)}</strong>
                    </div>
                    <div className="op-tags">
                      <span className="op-cat">{p.category}</span>
                      <span className={`op-stock ${p.stock === 'out' ? 'is-out' : ''}`}>
                        {p.stock === 'out' ? '⛔ Out' : '✓ Available'}
                      </span>
                    </div>
                    <div className="op-actions">
                      <button
                        className="op-btn"
                        onClick={() => {
                          setEditing(p)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="op-btn" onClick={() => duplicateProduct(p)}>
                        <Copy size={14} /> Duplicate
                      </button>
                      <button className="op-btn op-btn-danger" onClick={() => setDeleting(p)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div className="glass product-empty-wrap">
              <EmptyState compact emoji="🔍" title="No matches" subtitle={`Nothing matches “${query}”.`} />
            </div>
          )}
        </>
      )}

      <ProductFormModal
        open={formOpen}
        initial={editing}
        categories={categories}
        onSave={saveProduct}
        onClose={() => setFormOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this product?"
        message={`“${deleting?.name || ''}” will be removed from your catalogue. This can’t be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </OwnerLayout>
  )
}
