import { ToastProvider } from './ToastContext.jsx'
import { StoreProvider } from './StoreContext.jsx'
import { CartProvider } from './CartContext.jsx'

export function AppProviders({ children }) {
  return (
    <ToastProvider>
      <StoreProvider>
        <CartProvider>{children}</CartProvider>
      </StoreProvider>
    </ToastProvider>
  )
}
