import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Force IPv4 loopback: on this machine, Node's default 'localhost' bind resolves to the
    // IPv6 loopback (::1) only. That's unreachable from WSL2's localhost-forwarding (which
    // proxies to the Windows host over IPv4), breaking `make -C frontend start`'s health-check
    // curl - and browser/tool access from a WSL shell - even though the server is actually up.
    host: '127.0.0.1',
  },
})
