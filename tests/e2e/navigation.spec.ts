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
        
        // Check if we're on a mobile viewport (hamburger menu)
        const viewportWidth = page.viewportSize()?.width ?? 1280
        const isMobile = viewportWidth < 768
        
        if (isMobile) {
            // On mobile, click the hamburger menu first to reveal the Sign in link
            const hamburgerButton = page.locator('header button[aria-label="Toggle menu"], header button:has(svg)')
            if (await hamburgerButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await hamburgerButton.click()
                await page.waitForTimeout(300) // Wait for menu animation
            }
        }
        
        await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible({ timeout: 5000 })
    })

    test('navigates between pages', async ({ page }) => {
        await page.goto('/')
        await page.goto('/login')
        await expect(page).toHaveURL('/login')
        await page.goto('/')
        await expect(page).toHaveURL('/')
    })
})
