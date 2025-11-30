import { test, expect, Page } from '@playwright/test'

// Helper to login - with robust waiting for client-side navigation
async function login(page: Page, email = 'user@example.com', password = 'user12345') {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    
    // Click submit button and wait for loading to complete
    await page.locator('button[type="submit"]').click()
    
    // Wait for the button to show loading state and then complete
    await page.waitForTimeout(500) // Small delay for form submission to start
    
    // Wait for navigation - either successful or check for error
    try {
        await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 })
    } catch {
        // If still on login, check for error message
        const errorMessage = page.locator('text=Unable to login, text=Login failed, text=Invalid')
        if (await errorMessage.isVisible({ timeout: 1000 }).catch(() => false)) {
            throw new Error('Login failed with error message on page')
        }
        throw new Error('Login did not redirect - still on /login page')
    }
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
        // This test can be flaky in CI - increase retries
        test.slow() // Marks this test as slow, tripling the timeout
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
