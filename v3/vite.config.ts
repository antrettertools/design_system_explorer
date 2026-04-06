import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  build: {
    // Surface chunks over 600 kB in CI output
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Move all icon libraries into a single lazy chunk so they are
        // never part of the initial bundle (ComponentsTab loads them on demand).
        manualChunks: {
          'vendor-icons': [
            'lucide-react',
            '@heroicons/react',
            '@phosphor-icons/react',
            '@tabler/icons-react',
            '@radix-ui/react-icons',
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
})
