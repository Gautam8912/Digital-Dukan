/**
 * flyToCart.js — "product thumbnail flies to the cart" micro-interaction.
 * Pure DOM + Web Animations API. Respects prefers-reduced-motion.
 */
export function flyToCart(imgEl, targetEl) {
  if (typeof window === 'undefined') return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!imgEl || !targetEl) return
  const src = imgEl.getBoundingClientRect()
  const dst = targetEl.getBoundingClientRect()
  if (!src.width || !dst.width) return

  const el = document.createElement('div')
  el.className = 'fly-cart-thumb'
  if (imgEl.tagName === 'IMG' && (imgEl.currentSrc || imgEl.src)) {
    el.style.backgroundImage = `url("${imgEl.currentSrc || imgEl.src}")`
  } else {
    el.style.backgroundImage = 'linear-gradient(135deg, var(--dd-grad-1, #7c3aed), var(--dd-grad-2, #ec4899))'
  }
  Object.assign(el.style, {
    left: `${src.left}px`,
    top: `${src.top}px`,
    width: `${src.width}px`,
    height: `${src.height}px`
  })
  document.body.appendChild(el)

  const dx = dst.left + dst.width / 2 - (src.left + src.width / 2)
  const dy = dst.top + dst.height / 2 - (src.top + src.height / 2)

  let done = false
  const finish = () => {
    if (done) return
    done = true
    el.remove()
  }
  try {
    const anim = el.animate(
      [
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(10deg)`, opacity: 0.35 }
      ],
      { duration: 620, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' }
    )
    anim.onfinish = finish
    anim.oncancel = finish
  } catch {
    finish()
  }
  setTimeout(finish, 1000)
}

export function bounceEl(el) {
  if (!el) return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  try {
    el.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.25)' },
        { transform: 'scale(1)' }
      ],
      { duration: 380, easing: 'ease-out' }
    )
  } catch {
    /* ignore */
  }
}
