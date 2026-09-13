import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { loadCart, saveCart, StorageError } from '../utils/storage.js'
import { cartTotals, effectivePrice } from '../utils/pricing.js'
import { useToast } from './ToastContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCart())
  const { push } = useToast()
  const warnedFull = useRef(false)

  const commit = useCallback(
    (updater) => {
      setItems((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        try {
          saveCart(next)
          warnedFull.current = false
        } catch (e) {
          if (e instanceof StorageError && !warnedFull.current) {
            warnedFull.current = true
            push(e.message, 'error')
          }
        }
        return next
      })
    },
    [push]
  )

  const add = useCallback(
    (product, qty = 1) => {
      const q = Math.max(1, Math.min(99, Number(qty) || 1))
      commit((prev) => {
        const found = prev.find((it) => it.id === product.id)
        if (found) {
          return prev.map((it) =>
            it.id === product.id ? { ...it, qty: Math.min(99, it.qty + q) } : it
          )
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            original: Number(product.price) || 0,
            price: effectivePrice(product),
            image: product.image || null,
            category: product.category || '',
            qty: q
          }
        ]
      })
    },
    [commit]
  )

  const inc = useCallback(
    (id) => {
      commit((prev) => prev.map((it) => (it.id === id ? { ...it, qty: Math.min(99, it.qty + 1) } : it)))
    },
    [commit]
  )

  const dec = useCallback(
    (id) => {
      commit((prev) =>
        prev
          .map((it) => (it.id === id ? { ...it, qty: it.qty - 1 } : it))
          .filter((it) => it.qty > 0)
      )
    },
    [commit]
  )

  const remove = useCallback(
    (id) => {
      commit((prev) => prev.filter((it) => it.id !== id))
    },
    [commit]
  )

  const clear = useCallback(() => commit([]), [commit])

  const totals = useMemo(() => cartTotals(items), [items])

  const value = useMemo(
    () => ({ items, add, inc, dec, remove, clear, totals }),
    [items, add, inc, dec, remove, clear, totals]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
