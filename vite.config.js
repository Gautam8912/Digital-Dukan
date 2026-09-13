import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps the app portable across Vercel / Netlify / Cloudflare Pages / GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Allow the sandbox/preview proxy hostnames (e2b.app subdomains)
    allowedHosts: true
  },
  build: {
    chunkSizeWarningLimit: 900
  }
})
