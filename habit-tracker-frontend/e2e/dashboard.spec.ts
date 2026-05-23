import { test, expect } from '@playwright/test'

import { generateEmail, loginViaUi, registerUserViaApi } from './utils'

test('dashboard page loads with analytics heading', async ({
  page,
  request,
}) => {
  const email = generateEmail('dashboard')
  const password = 'secret123'
  await registerUserViaApi(request, email, password)
  await loginViaUi(page, email, password)

  await page.goto('/dashboard')

  await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  await expect(
    page.getByText('No habits yet. Add habits before opening analytics.'),
  ).toBeVisible()
})
