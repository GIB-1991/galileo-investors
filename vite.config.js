import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// v1774175652142 - Hebrew news translation active
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
