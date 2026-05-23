import { test, expect } from '@playwright/test'

import { generateEmail, loginViaUi, registerUserViaApi } from './utils'

test('user creates a habit and checks it off for today', async ({
  page,
  request,
}) => {
  const email = generateEmail('habits')
  const password = 'secret123'
  await registerUserViaApi(request, email, password)
  await loginViaUi(page, email, password)

  await page.getByRole('button', { name: 'Add first habit' }).click()
  await page.getByLabel('Name').fill('Read 20 min')
  await page.getByRole('button', { name: 'Save habit' }).click()

  await expect(page.getByRole('heading', { name: 'Read 20 min' })).toBeVisible()

  const doneCheckbox = page.getByLabel('Done today')
  await expect(doneCheckbox).not.toBeChecked()
  await doneCheckbox.check()
  await expect(doneCheckbox).toBeChecked()
})
