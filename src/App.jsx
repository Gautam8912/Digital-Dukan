import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { ToastContainer } from './components/Toast.jsx'
import Home from './pages/Home.jsx'
import SetupWizard from './pages/SetupWizard.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx'
import ProductManager from './pages/ProductManager.jsx'
import Customize from './pages/Customize.jsx'
import Settings from './pages/Settings.jsx'
import Storefront from './pages/Storefront.jsx'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/owner/products" element={<ProductManager />} />
        <Route path="/owner/customize" element={<Customize />} />
        <Route path="/owner/settings" element={<Settings />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <ToastContainer />
    </ErrorBoundary>
  )
}
