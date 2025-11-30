import { test, expect } from '@playwright/test'

test.describe('Checkout', () => {
  test('checkout requires authentication', async ({ page }) => {
    await page.goto('/checkout')
    await expect(page).toHaveURL(/.*login/)
  })
})
