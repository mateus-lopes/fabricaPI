import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // O chunk do relatório (~600 kB) é quase todo ECharts e só é baixado ao abrir o relatório.
  build: { chunkSizeWarningLimit: 700 },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
