/**
 * imageCompression.js — client-side image handling via the File API + canvas.
 * Nothing is uploaded anywhere: images are resized/compressed in the browser
 * and stored as data URLs in LocalStorage.
 */

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB hard cap before processing

export const ACCEPT_ATTR = ACCEPTED_TYPES.join(',')

export function isSupportedImage(file) {
  if (!file) return false
  const name = (file.name || '').toLowerCase()
  const extOk = /\.(jpe?g|png|webp)$/.test(name)
  return ACCEPTED_TYPES.includes(file.type) || (extOk && file.type.startsWith('image/'))
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read this image file.'))
    img.src = url
  })
}

/**
 * Reads a File, resizes to maxDim (longest side) and compresses.
 * Returns { dataUrl, width, height, bytes }
 */
export async function compressImage(file, { maxDim = 1000, quality = 0.8 } = {}) {
  if (!isSupportedImage(file)) {
    throw new Error('Unsupported image. Please use JPG, PNG or WEBP.')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('Image is too large (max 10 MB). Please use a smaller photo.')
  }
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    let { width, height } = img
    const scale = Math.min(1, maxDim / Math.max(width, height))
    width = Math.max(1, Math.round(width * scale))
    height = Math.max(1, Math.round(height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    // white background so transparent PNGs look clean as JPEG
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    const keepPng = file.type === 'image/png' && file.size < 350 * 1024
    const dataUrl = keepPng
      ? canvas.toDataURL('image/png')
      : canvas.toDataURL('image/jpeg', quality)
    const bytes = dataUrl.length - dataUrl.indexOf(',') - 1
    return { dataUrl, width, height, bytes }
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
