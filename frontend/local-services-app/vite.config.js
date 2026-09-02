import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,         // Forces Vite to strictly use Port 5173
    strictPort: true,   // Prevents Vite from auto-switching to 5174 if busy
    host: '0.0.0.0',    // Listen on all interfaces (needed for containers / LAN preview)
    allowedHosts: true, // Accept proxied hostnames (preview tunnels, ngrok, etc.)
    headers: {
      // Allows the Google OAuth popup window to communicate with our parent window
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none"
    }
  }
})