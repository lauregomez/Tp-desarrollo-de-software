import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    // Puerto por defecto de `npm run dev`. El front y el back se levantan
    // a mano antes de correr los tests.
    baseURL: 'http://localhost:5173',
  },
  projects: [
    // Desktop: el header muestra los links recién desde md; en una ventana
    // chica quedan dentro del menú y el test no los encontraría.
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
