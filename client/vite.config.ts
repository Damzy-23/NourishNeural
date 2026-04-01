import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: false, // using public/manifest.json
      devOptions: {
        enabled: false, // SW disabled in dev mode — avoids stale cache issues
      },
      workbox: {
        skipWaiting: true,      // New SW takes over immediately
        clientsClaim: true,     // Claim all open tabs on activation
        cleanupOutdatedCaches: true,
        // Cache pages and API responses
        runtimeCaching: [
          {
            // Cache API data (pantry, groceries, etc.) — network-first, fall back to cache
            urlPattern: /\/api\/(pantry|groceries|meal-planner|waste|dashboard|users)\b/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1 hour
              networkTimeoutSeconds: 10, // fall back to cache after 10s
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache static assets — cache-first
            urlPattern: /\.(js|css|woff2?|png|jpg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } // 30 days
            }
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }
            }
          }
        ],
        // Pre-cache the app shell
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3050,
    strictPort: true,
    headers: {
      // Prevent Safari from caching the service worker or HTML
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
