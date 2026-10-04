/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // Sólo los tests de componentes: los de e2e/ son de Playwright y usan
    // otra API, así que Vitest no tiene que levantarlos.
    include: ['src/**/*.test.tsx'],
  },
})
