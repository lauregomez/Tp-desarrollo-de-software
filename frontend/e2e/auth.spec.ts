import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const USER_EMAIL = 'jaste@arf.com'
const PASSWORD = 'Password123!'

async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Contraseña', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
}

test('con credenciales inválidas muestra el error del backend', async ({ page }) => {
  await login(page, USER_EMAIL, 'Incorrecta123')

  await expect(page.getByRole('alert')).toHaveText('Email o contraseña incorrectos')
  await expect(page).toHaveURL('/login')
})

test('un USER inicia sesión y vuelve al listado de partidos', async ({ page }) => {
  await login(page, USER_EMAIL, PASSWORD)

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('link', { name: 'Mis entradas' })).toBeVisible()
})

test('un USER no puede entrar a una ruta de admin', async ({ page }) => {
  await login(page, USER_EMAIL, PASSWORD)
  await expect(page).toHaveURL('/')

  await page.goto('/clubes')

  await expect(page).toHaveURL('/')
})
