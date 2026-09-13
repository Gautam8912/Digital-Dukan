import { MessageCircle } from 'lucide-react'
import { openWhatsApp, whatsappLink } from '../utils/whatsapp.js'
import { useToast } from '../context/ToastContext.jsx'

/**
 * WhatsAppButton — opens wa.me deep link.
 * onBlocked callback is invoked when the browser blocks the popup
 * (caller can then reveal a "Copy message" fallback).
 */
export function WhatsAppButton({ phone, message, label = 'Chat on WhatsApp', className = '', block = false, onBlocked, children }) {
  const { push } = useToast()

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const link = whatsappLink(phone, message)
    if (!link) {
      push('This shop has no valid WhatsApp number yet.', 'error')
      return
    }
    const opened = openWhatsApp(phone, message)
    if (!opened) {
      push('WhatsApp could not be opened. Use "Copy" instead.', 'error')
      onBlocked && onBlocked(link)
    }
  }

  return (
    <a
      href={whatsappLink(phone, message) || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn ${block ? 'btn-block' : ''} btn-wa ${className}`}
      onClick={handleClick}
    >
      {children || (
        <>
          <MessageCircle size={17} /> {label}
        </>
      )}
    </a>
  )
}
