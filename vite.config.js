import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// build-1774183972709
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react','react-dom','react-router-dom'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
