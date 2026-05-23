import { test, expect } from '@playwright/test'

import { generateEmail, registerUserViaApi } from './utils'

test('user logs in and lands on the habits page', async ({ page, request }) => {
  const email = generateEmail('login')
  const password = 'secret123'
  await registerUserViaApi(request, email, password)

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL('/habits')
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
})
