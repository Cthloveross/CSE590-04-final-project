import { test, expect } from '@playwright/test'

test.describe('Shopping Cart', () => {
  test('cart requires authentication', async ({ page }) => {
    await page.goto('/cart')
    await expect(page).toHaveURL(/.*login/)
  })
})
