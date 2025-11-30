import { test, expect } from '@playwright/test'

test.describe('Orders', () => {
  test('orders requires authentication', async ({ page }) => {
    await page.goto('/orders')
    await expect(page).toHaveURL(/.*login/)
  })
})
