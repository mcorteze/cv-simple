import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { textkitLineBreak, textkitLineBreakEsbuild } from './textkitLineBreak.js'
import pkg from './package.json'

// Identifica cada compilación: la app la compara con version.json para saber si hay una más nueva
const BUILD_ID = new Date().toISOString()

const versionFile = () => ({
  name: 'version-file',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: BUILD_ID }) })
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), textkitLineBreak(), versionFile()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  optimizeDeps: { esbuildOptions: { plugins: [textkitLineBreakEsbuild] } },
  base: '/cv-simple/',
  // El generador de PDF es un bloque grande, pero se descarga solo al exportar
  build: {
    chunkSizeWarningLimit: 2000,
    // GitHub Pages no publica archivos que empiezan con "_"; sin esto faltaba uno del generador de PDF
    rollupOptions: {
      output: { sanitizeFileName: (name) => name.replace(/[\0?*]/g, '').replace(/^_+/, '') },
    },
  },
})
