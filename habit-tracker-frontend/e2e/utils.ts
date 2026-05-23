import type { APIRequestContext, Page } from '@playwright/test'

const BACKEND_BASE_URL = 'http://localhost:8000'

export function generateEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
}

export async function registerUserViaApi(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<void> {
  const response = await request.post(`${BACKEND_BASE_URL}/auth/register`, {
    data: { email, password },
  })

  if (!response.ok()) {
    const body = await response.text()
    throw new Error(`registerUserViaApi failed (${response.status()}): ${body}`)
  }
}

export async function loginViaUi(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/habits')
}
