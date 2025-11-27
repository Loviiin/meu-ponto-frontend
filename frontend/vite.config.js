import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  build: {
    // Aumenta o limite de warning para 1MB (padrão é 500KB)
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Configuração de chunking inteligente
        manualChunks(id) {
          // Vendor libraries em chunks separados
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }
            if (id.includes('axios') || id.includes('http')) {
              return 'api'
            }
            if (id.includes('bootstrap') || id.includes('icon')) {
              return 'ui-libs'
            }
            // Outros vendors em um chunk separado
            return 'vendor'
          }

          // Pages em chunks separados para lazy loading
          if (id.includes('/pages/')) {
            const match = id.match(/pages\/(\w+)/)
            if (match) {
              return `pages/${match[1]}`
            }
          }

          // Services em chunk separado
          if (id.includes('/services/')) {
            return 'services'
          }

          // Utils e helpers
          if (id.includes('/utils/') || id.includes('/utils')) {
            return 'utils'
          }
        }
      }
    }
  }
})


