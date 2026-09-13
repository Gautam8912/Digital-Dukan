import { useRef, useState } from 'react'
import { ImagePlus, Trash2, Lock, Loader2, AlertTriangle } from 'lucide-react'
import { compressImage, isSupportedImage, ACCEPT_ATTR } from '../utils/imageCompression.js'
import { useToast } from '../context/ToastContext.jsx'

/**
 * ImageUploader — fully client-side image handling.
 * value: data URL or asset URL, or null.
 * onChange(dataUrl | null)
 */
export function ImageUploader({ value, onChange, label = 'Product photo', square = true, maxDim = 1000, quality = 0.8 }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { push } = useToast()

  const handleFile = async (file) => {
    setError('')
    if (!file) return
    if (!isSupportedImage(file)) {
      const msg = 'Unsupported image. Please use JPG, PNG or WEBP.'
      setError(msg)
      push(msg, 'error')
      return
    }
    setBusy(true)
    try {
      const { dataUrl, bytes } = await compressImage(file, { maxDim, quality })
      onChange(dataUrl)
      push('Photo compressed & saved locally', 'success')
      if (bytes > 250 * 1024) {
        push('This photo is large — it may not fit in a shared link.', 'info')
      }
    } catch (e) {
      const msg = e.message || 'Could not process this image.'
      setError(msg)
      push(msg, 'error')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="img-uploader">
      <label className="field-label">{label}</label>
      <div className={`img-up-zone ${square ? 'is-square' : ''} ${value ? 'has-value' : ''}`}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="img-up-input"
          onChange={(e) => handleFile(e.target.files && e.target.files[0])}
        />
        {busy ? (
          <div className="img-up-busy">
            <Loader2 size={22} className="spin" />
            <span>Compressing…</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="img-up-preview" />
            <div className="img-up-overlay">
              <button
                type="button"
                className="img-up-btn"
                onClick={() => inputRef.current && inputRef.current.click()}
              >
                <ImagePlus size={15} /> Replace
              </button>
              <button
                type="button"
                className="img-up-btn danger"
                onClick={() => {
                  onChange(null)
                  setError('')
                }}
              >
                <Trash2 size={15} /> Remove
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="img-up-add" onClick={() => inputRef.current && inputRef.current.click()}>
            <ImagePlus size={22} />
            <strong>Click to upload</strong>
            <span>JPG · PNG · WEBP — up to 10 MB</span>
          </button>
        )}
      </div>
      {error && (
        <p className="field-error">
          <AlertTriangle size={13} /> {error}
        </p>
      )}
      <p className="img-up-privacy">
        <Lock size={12} /> Images stay on this device.
      </p>
    </div>
  )
}
