import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('has working header navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check header exists
    await expect(page.locator('header')).toBeVisible()
  })

  test('has login link when unauthenticated', async ({ page }) => {
    await page.goto('/')
    // Wait for hydration and check Sign in link exists in header
    await page.waitForLoadState('networkidle')
    await expect(page.locator('header').getByRole('link', { name: 'Sign in', exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('navigates between pages', async ({ page }) => {
    await page.goto('/')
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
    await page.goto('/')
    await expect(page).toHaveURL('/')
  })
})
