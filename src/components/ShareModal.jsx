import { useEffect, useMemo, useState } from 'react'
import { X, Link2, Copy, Check, ExternalLink, MessageCircle, AlertTriangle, Smartphone } from 'lucide-react'
import { computeShare } from '../utils/storeEncoder.js'
import { normalizePhone, shareOnWhatsApp, buildShareMessage } from '../utils/whatsapp.js'
import { useStore } from '../context/StoreContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

const LARGE = 8000
const HUGE = 20000

export function ShareModal({ open, onClose }) {
  const { store } = useStore()
  const { push } = useToast()
  const [includeImages, setIncludeImages] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const share = useMemo(() => {
    if (!open || !store) return null
    return computeShare(store, includeImages)
  }, [open, store, includeImages])

  if (!open || !store || !share) return null

  const phoneOk = Boolean(normalizePhone(store.shop.phone))
  const droppedImages = includeImages ? share.totalProducts - share.productsWithImages : 0

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(share.url)
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = share.url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      } catch {
        push('Could not copy — select the link text manually.', 'error')
        return
      }
    }
    setCopied(true)
    push('Store link copied!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaWhatsApp = () => {
    const msg = buildShareMessage(share.url, store.shop.name)
    const opened = shareOnWhatsApp(msg)
    if (!opened) {
      push('WhatsApp could not be opened. Copy the link instead.', 'error')
    }
  }

  const lengthState = share.urlLength > HUGE ? 'huge' : share.urlLength > LARGE ? 'large' : 'ok'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="share-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="pform-head">
          <h2>
            <Link2 size={20} /> Share Your Catalogue
          </h2>
          <button className="cd-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="share-body">
          <p className="share-intro">
            Your catalogue is packed into a single link — customers open it on their own phone and order
            straight to your WhatsApp.
          </p>

          {store.products.length === 0 && (
            <div className="share-warn">
              <AlertTriangle size={16} /> Add at least one product before sharing.
            </div>
          )}
          {!phoneOk && (
            <div className="share-warn">
              <AlertTriangle size={16} /> Your WhatsApp number is missing or invalid — customers won’t be
              able to send orders. Fix it in Settings.
            </div>
          )}
          {droppedImages > 0 && includeImages && (
            <div className="share-warn share-warn-soft">
              <Smartphone size={16} /> {droppedImages} photo{droppedImages > 1 ? 's were' : ' was'} too large
              for the link — those products will show a coloured placeholder for customers.
            </div>
          )}

          <label className="share-toggle">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
            />
            <span>
              Include small photos in the link{' '}
              <em>({share.totalProducts} products{includeImages ? `, ${share.productsWithImages} with photos` : ''})</em>
            </span>
          </label>

          <div className={`share-length share-length-${lengthState}`}>
            {lengthState === 'huge'
              ? '⚠️ Very long link. Some apps (like old WhatsApp versions) may truncate it — consider switching photos off or using public image URLs.'
              : lengthState === 'large'
              ? '⚠️ This is a long link. It works in modern apps, but a compact link (photos off) is safer to share.'
              : '✅ Link size is great for sharing anywhere.'}
            <span className="share-bytes">{(share.urlLength / 1024).toFixed(1)} KB</span>
          </div>

          <div className="share-urlbox">
            <code>{share.url}</code>
          </div>

          <div className="share-actions">
            <button className="btn btn-primary" onClick={copyLink}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button className="btn btn-wa" onClick={shareViaWhatsApp} disabled={store.products.length === 0}>
              <MessageCircle size={16} /> Share on WhatsApp
            </button>
            <a className="btn btn-ghost" href={share.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={15} /> Open
            </a>
          </div>

          <div className="share-note">
            <p>
              🔒 <strong>Zero backend:</strong> everything in this link — products, prices, theme — lives in
              the URL itself. There is no server copy of your catalogue.
            </p>
            <p>
              💡 Uploaded photos only ride along when they’re small enough. For bigger photos, paste a
              public image URL (e.g. from Imgur/Google Drive direct link) in a product image field instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
