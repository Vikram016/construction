import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
  ],

  server: {
    port: 5173,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // Increase chunk warning limit
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split big libraries into separate chunks → parallel loading
        manualChunks: {
          // React core — loaded first, cached forever
          'react-vendor': ['react', 'react-dom'],
          // Router
          'router': ['react-router-dom'],
          // Firebase — large, split separately
          'firebase-app':  ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-db':   ['firebase/firestore'],
          // PDF generation — only needed for invoice, load lazily
          'pdf': ['pdfkit'],
        },
      },
    },
  },
})
