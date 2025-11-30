import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('displays hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Counter-Strike 2')
  })

  test('displays features', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Verified Boosters')).toBeVisible()
  })

  test('navigates to CS2 services', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Browse CS2 Services/i }).first().click()
    await expect(page).toHaveURL(/.*games\/cs2/)
  })
})
