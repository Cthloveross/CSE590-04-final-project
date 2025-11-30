import { test, expect } from '@playwright/test'

test.describe('Game Catalog', () => {
  test('displays games list on home page', async ({ page }) => {
    await page.goto('/')
    // Check for game cards or service links
    await expect(page.locator('a[href*="/games/"]').first()).toBeVisible()
  })

  test('navigates to CS2 game page', async ({ page }) => {
    await page.goto('/games/cs2')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('shows services for a game', async ({ page }) => {
    await page.goto('/games/cs2')
    // Wait for services to load
    await page.waitForLoadState('networkidle')
    // Check page content loaded
    await expect(page.locator('body')).toContainText(/CS2|Counter-Strike/i)
  })
})

test.describe('Services', () => {
  test('can view service details', async ({ page }) => {
    // First get a service ID from the API
    const response = await page.request.get('/api/services')
    const services = await response.json()
    
    if (services.length > 0) {
      await page.goto(`/services/${services[0]._id}`)
      await expect(page.locator('h1')).toBeVisible()
    }
  })
})
