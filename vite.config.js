import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function manualChunks(id) {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('html2canvas')) return 'copy-vendor'
  if (id.includes('katex')) return 'katex-vendor'
  if (id.includes('highlight.js')) return 'highlight-vendor'
  if (id.includes('marked') || id.includes('marked-highlight')) return 'markdown-vendor'
  if (id.includes('dompurify')) return 'sanitize-vendor'
  if (id.includes('@codemirror') || id.includes('/codemirror/')) return 'editor-vendor'
  if (id.includes('react')) return 'react-vendor'
  return 'vendor'
}

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
