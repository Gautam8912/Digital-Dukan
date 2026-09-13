import { Sparkles } from 'lucide-react'

/** Designed fallback tile when a shared product has no image. */
export function ProductPlaceholder({ name = '', big = false }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '✦'
  return (
    <div className={`p-ph ${big ? 'p-ph-big' : ''}`}>
      <span className="p-ph-initial">{initial}</span>
      <Sparkles size={big ? 22 : 15} className="p-ph-spark" />
    </div>
  )
}
