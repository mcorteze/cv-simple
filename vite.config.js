import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { textkitLineBreak, textkitLineBreakEsbuild } from './textkitLineBreak.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), textkitLineBreak()],
  optimizeDeps: { esbuildOptions: { plugins: [textkitLineBreakEsbuild] } },
  base: '/cv-simple/',
  // El generador de PDF es un bloque grande, pero se descarga solo al exportar
  build: { chunkSizeWarningLimit: 2000 },
})
