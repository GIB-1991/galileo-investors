import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build 1774172261841 - news translation enabled
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  }
})
