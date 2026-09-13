import { useMemo, useRef, useState } from 'react'
import {
  Save,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  HardDrive,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { OwnerLayout } from '../components/OwnerLayout.jsx'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { validateShop } from '../utils/validation.js'
import { downloadStoreBackup, readImportFile } from '../utils/exportImport.js'
import { storageUsage } from '../utils/storage.js'

export default function Settings() {
  const { store, patchShop, importStore, reset } = useStore()
  const { push } = useToast()
  const fileRef = useRef(null)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [resetOpen, setResetOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importData, setImportData] = useState(null)
  const [importErr, setImportErr] = useState('')
  const [busy, setBusy] = useState(false)
  const usage = useMemo(() => storageUsage(), [store])

  const current = store || { shop: {} }
  const f = form || current.shop
  const set = (k) => (e) => setForm({ ...(form || current.shop), [k]: e.target.value })

  const saveShop = (e) => {
    e.preventDefault()
    const { errors: errs, valid } = validateShop(f)
    setErrors(errs)
    if (!valid) return
    patchShop({
      name: f.name.trim(),
      ownerName: f.ownerName.trim(),
      phone: String(f.phone).replace(/\D/g, ''),
      description: f.description.trim(),
      address: f.address.trim(),
      instagram: f.instagram.replace(/^@/, '').trim(),
      website: f.website.trim()
    })
    setForm(null)
    push('Shop details saved', 'success')
  }

  const doExport = () => {
    try {
      const name = downloadStoreBackup(store)
      push(`Backup downloaded: ${name}`, 'success')
    } catch {
      push('Could not create the backup file.', 'error')
    }
  }

  const onImportFile = async (file) => {
    setBusy(true)
    setImportErr('')
    const result = await readImportFile(file)
    setBusy(false)
    if (result.ok) {
      setImportData(result.normalized)
      setImportOpen(true)
    } else {
      setImportErr(result.errors.join(' '))
      push(result.errors[0] || 'Invalid backup file.', 'error')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const confirmImport = () => {
    importStore(importData)
    setImportOpen(false)
    setImportData(null)
    setForm(null)
    push('Store imported — your dukaan is restored!', 'success')
  }

  const doReset = () => {
    reset()
    setResetOpen(false)
    setForm(null)
    push('Store reset. Fresh start!', 'info')
  }

  if (!store) {
    return (
      <OwnerLayout title="Settings" subtitle="No store to configure yet">
        <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
          <h3>Set up your shop first</h3>
          <p>Settings become available once your dukaan exists.</p>
        </div>
      </OwnerLayout>
    )
  }

  return (
    <OwnerLayout title="Settings" subtitle="Shop details, backups and data controls.">
      <div className="set-grid">
        <div className="set-col">
          <section className="glass set-panel">
            <h3>🏪 Shop Details</h3>
            <form onSubmit={saveShop} className="set-form">
              <div className="field">
                <label className="field-label">Shop Name *</label>
                <input value={f.name || ''} onChange={set('name')} placeholder="Sharma Fashion" />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div className="set-row">
                <div className="field">
                  <label className="field-label">Owner Name</label>
                  <input value={f.ownerName || ''} onChange={set('ownerName')} />
                </div>
                <div className="field">
                  <label className="field-label">WhatsApp Number *</label>
                  <input value={f.phone || ''} onChange={set('phone')} inputMode="tel" placeholder="98765 43210" />
                  {errors.phone && <p className="field-error">{errors.phone}</p>}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Description</label>
                <textarea value={f.description || ''} onChange={set('description')} rows={2} />
              </div>
              <div className="field">
                <label className="field-label">Address</label>
                <input value={f.address || ''} onChange={set('address')} />
              </div>
              <div className="set-row">
                <div className="field">
                  <label className="field-label">Instagram</label>
                  <input value={f.instagram || ''} onChange={set('instagram')} placeholder="@yourshop" />
                </div>
                <div className="field">
                  <label className="field-label">Website</label>
                  <input value={f.website || ''} onChange={set('website')} placeholder="yourshop.com" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Shop Details
              </button>
            </form>
          </section>

          <section className="glass set-panel">
            <h3>
              <ShieldCheck size={16} /> Privacy
            </h3>
            <ul className="privacy-list">
              <li>Your store data stays in your browser.</li>
              <li>No account is required.</li>
              <li>Product images are processed locally — never uploaded.</li>
              <li>Orders are sent directly to your WhatsApp.</li>
              <li>Digital Dukaan does not operate a central order database.</li>
            </ul>
          </section>
        </div>

        <div className="set-col">
          <section className="glass set-panel">
            <h3>
              <HardDrive size={16} /> Storage
            </h3>
            <div className="storage-meter">
              <div className="storage-bar">
                <div
                  className={`storage-fill ${usage.percent > 80 ? 'storage-warn' : ''}`}
                  style={{ width: `${Math.max(2, usage.percent)}%` }}
                />
              </div>
              <span>{usage.percent}% used ({(usage.bytes / 1024).toFixed(0)} KB)</span>
            </div>
            {usage.percent > 80 && (
              <p className="storage-warn-text">
                ⚠️ Nearly full — exported backups can be trimmed, or remove a large photo.
              </p>
            )}
          </section>

          <section className="glass set-panel">
            <h3>📦 Export · Import · Backup</h3>
            <p className="set-hint">
              Your whole dukaan (shop, theme, products and photos) can be saved as one JSON file. Keep
              a copy — it’s your backup, since there’s no cloud.
            </p>
            <div className="set-actions">
              <button className="btn btn-ghost" onClick={doExport}>
                <Download size={16} /> Export Store
              </button>
              <button className="btn btn-ghost" onClick={doExport}>
                <HardDrive size={16} /> Backup My Store
              </button>
              <button className="btn btn-ghost" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy}>
                {busy ? <Loader2 size={16} className="spin" /> : <Upload size={16} />} Import Store
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="visually-hidden"
                onChange={(e) => onImportFile(e.target.files && e.target.files[0])}
              />
            </div>
            {importErr && (
              <p className="field-error" style={{ marginTop: 12 }}>
                <AlertTriangle size={13} /> {importErr}
              </p>
            )}
          </section>

          <section className="glass set-panel set-danger">
            <h3>⚠️ Danger Zone</h3>
            <p className="set-hint">
              Reset deletes your shop, products, theme and logo from this browser. Export a backup first.
            </p>
            <button className="btn btn-danger" onClick={() => setResetOpen(true)}>
              <Trash2 size={16} /> Reset Store
            </button>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset your entire dukaan?"
        message="This permanently deletes your shop, products, theme and logo from this browser. There is no undo — export a backup first if you want to keep anything."
        confirmLabel="Yes, reset everything"
        danger
        onConfirm={doReset}
        onCancel={() => setResetOpen(false)}
      />
      <ConfirmDialog
        open={importOpen}
        title="Import this backup?"
        message="Importing replaces your current shop, products and theme with the contents of the backup file."
        confirmLabel="Import & replace"
        onConfirm={confirmImport}
        onCancel={() => {
          setImportOpen(false)
          setImportData(null)
        }}
      />
    </OwnerLayout>
  )
}
