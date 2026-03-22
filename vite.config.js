import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// build-1774182409136 - ANTHROPIC_API_KEY active
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
