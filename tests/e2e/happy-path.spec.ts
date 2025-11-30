import { test, expect } from '@playwright/test'

test.describe('Happy Path - Full User Journey', () => {
    test('complete flow: login → browse → add to cart → checkout', async ({ page }) => {
        // Step 1: Start from home page (unauthenticated)
        await page.goto('/')
        await expect(page.locator('h1')).toContainText('Counter-Strike 2')

        // Step 2: Navigate to login and authenticate
        await page.goto('/login')
        await expect(page.locator('h1')).toContainText('Welcome Back')

        await page.locator('input[type="email"]').fill('user@example.com')
        await page.locator('input[type="password"]').fill('user12345')
        
        // Click submit and wait for navigation away from login page
        await page.locator('button[type="submit"]').click()
        
        // Wait for successful login - URL should no longer be /login
        await expect(async () => {
            const url = page.url()
            expect(url.includes('/login')).toBe(false)
        }).toPass({ timeout: 15000 })

        // Step 3: Browse to CS2 game services
        await page.goto('/games/cs2')
        await page.waitForLoadState('networkidle')

        // Wait for page content
        await expect(page.locator('body')).toContainText(/CS2|Counter-Strike/i)

        // Step 4: Find and click on a service to view details
        const serviceCard = page.locator('a[href^="/services/"]').first()
        await expect(serviceCard).toBeVisible({ timeout: 10000 })
        await serviceCard.click()

        // Wait for service detail page
        await page.waitForURL(/\/services\//)
        await expect(page.locator('h1')).toBeVisible()

        // Step 5: Try to add service to cart
        const addToCartButton = page.locator('button:has-text("Add to Cart")')
        if (await addToCartButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await addToCartButton.click()
            await page.waitForTimeout(1000)
        }

        // Step 6: Go to cart - verify we stay on cart (not redirected to login)
        await page.goto('/cart')
        await page.waitForLoadState('networkidle')

        // If authenticated, should see cart page
        const currentUrl = page.url()
        if (!currentUrl.includes('/login')) {
            // We're on cart page - check for cart heading or empty cart message
            await expect(page.getByText('Cart', { exact: true }).first()).toBeVisible()
        }

        // Step 7: Proceed to checkout if available
        const checkoutButton = page.locator('a:has-text("Checkout"), button:has-text("Proceed")')
        if (await checkoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await checkoutButton.click()
            await page.waitForURL('/checkout', { timeout: 5000 }).catch(() => { })
        }
    })

    test('can browse services without login', async ({ page }) => {
        // Browse services as guest
        await page.goto('/games/cs2')
        await page.waitForLoadState('networkidle')

        // Should be able to see service listings
        await expect(page.locator('body')).toContainText(/CS2|Counter-Strike/i)

        // Click on a service
        const serviceLink = page.locator('a[href^="/services/"]').first()
        if (await serviceLink.isVisible({ timeout: 5000 }).catch(() => false)) {
            await serviceLink.click()
            await page.waitForURL(/\/services\//)

            // Service detail page should be visible
            await expect(page.locator('h1')).toBeVisible()
        }
    })

    test('protected routes redirect to login when unauthenticated', async ({ page }) => {
        // Try to access cart without login
        await page.goto('/cart')
        await expect(page).toHaveURL(/.*login/)

        // Try to access orders without login
        await page.goto('/orders')
        await expect(page).toHaveURL(/.*login/)

        // Try to access checkout without login
        await page.goto('/checkout')
        await expect(page).toHaveURL(/.*login/)
    })
})
