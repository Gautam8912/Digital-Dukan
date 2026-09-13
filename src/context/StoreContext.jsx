import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { clearStore, loadStore, saveStore, StorageError } from '../utils/storage.js'
import { getDemoStore } from '../data/demoStore.js'
import { normalizeStore } from '../utils/exportImport.js'
import { useToast } from './ToastContext.jsx'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [store, setStoreState] = useState(() => loadStore())
  const { push } = useToast()
  const warned = useRef(false)

  const applyStore = useCallback(
    (updater) => {
      setStoreState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (!next) {
          clearStore()
          return null
        }
        try {
          saveStore(next)
        } catch (e) {
          if (e instanceof StorageError) {
            push(e.message || 'Could not save your store.', 'error')
          } else {
            push('Could not save your store.', 'error')
          }
        }
        return next
      })
    },
    [push]
  )

  /** Merge-level update: applyStore(s => ({...s, ...patch})) */
  const patchStore = useCallback(
    (patch) => {
      applyStore((s) => ({ ...(s || emptyStore()), ...patch }))
    },
    [applyStore]
  )

  const patchShop = useCallback(
    (shopPatch) => {
      applyStore((s) => {
        const base = s || emptyStore()
        return { ...base, shop: { ...base.shop, ...shopPatch } }
      })
    },
    [applyStore]
  )

  const patchBrand = useCallback(
    (brandPatch) => {
      applyStore((s) => {
        const base = s || emptyStore()
        return { ...base, brand: { ...base.brand, ...brandPatch } }
      })
    },
    [applyStore]
  )

  const setProducts = useCallback(
    (products) => {
      applyStore((s) => {
        const base = s || emptyStore()
        return { ...base, products: Array.isArray(products) ? products : [] }
      })
    },
    [applyStore]
  )

  const reset = useCallback(() => {
    clearStore()
    setStoreState(null)
  }, [])

  const loadDemo = useCallback(() => {
    const demo = getDemoStore()
    applyStore(demo)
    return demo
  }, [applyStore])

  const importStore = useCallback(
    (normalized) => {
      applyStore(normalizeStore(normalized))
    },
    [applyStore]
  )

  const value = useMemo(
    () => ({ store, applyStore, patchStore, patchShop, patchBrand, setProducts, reset, loadDemo, importStore }),
    [store, applyStore, patchStore, patchShop, patchBrand, setProducts, reset, loadDemo, importStore]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function emptyStore() {
  return {
    version: 1,
    shop: {
      name: '',
      ownerName: '',
      phone: '',
      description: '',
      address: '',
      instagram: '',
      website: ''
    },
    brand: {
      logo: null,
      theme: 'modern',
      accent: null,
      buttonStyle: 'gradient',
      cardRadius: 20,
      font: 'modern'
    },
    products: []
  }
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
