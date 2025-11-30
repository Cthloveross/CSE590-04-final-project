import { test, expect, Page } from '@playwright/test'

// Helper to login
async function login(page: Page, email = 'user@example.com', password = 'user12345') {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    
    // Click submit button
    await page.locator('button[type="submit"]').click()
    
    // Wait for either successful redirect OR check we're no longer on login
    // Use a simple approach: wait for URL to not contain /login
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 })
}

test.describe('Authentication', () => {
    test('shows login page', async ({ page }) => {
        await page.goto('/login')
        await expect(page.locator('h1')).toContainText('Welcome Back')
        await expect(page.locator('input[type="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()
    })

    test('shows demo accounts info', async ({ page }) => {
        await page.goto('/login')
        await expect(page.getByText('Demo Accounts')).toBeVisible()
        await expect(page.getByText('admin@example.com')).toBeVisible()
        await expect(page.getByText('user@example.com')).toBeVisible()
    })

    test('shows OAuth buttons', async ({ page }) => {
        await page.goto('/login')
        await expect(page.getByText('Continue with Google')).toBeVisible()
        await expect(page.getByText('Continue with GitHub')).toBeVisible()
    })

    test('validates required fields', async ({ page }) => {
        await page.goto('/login')
        await page.locator('button[type="submit"]').click()
        // HTML5 validation should prevent submission
        const emailInput = page.locator('input[type="email"]')
        await expect(emailInput).toHaveAttribute('required', '')
    })

    test('can login with valid credentials', async ({ page }) => {
        await login(page)
        await expect(page).toHaveURL('/')
    })
})

test.describe('Protected Routes', () => {
    test('redirects to login when accessing cart unauthenticated', async ({ page }) => {
        await page.goto('/cart')
        await expect(page).toHaveURL(/.*login/)
    })

    test('redirects to login when accessing orders unauthenticated', async ({ page }) => {
        await page.goto('/orders')
        await expect(page).toHaveURL(/.*login/)
    })
})
