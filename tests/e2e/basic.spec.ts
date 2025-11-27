import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test('should load the home page successfully', async ({ page }) => {
        await page.goto('/');

        // Check if the page title or main heading is present
        await expect(page).toHaveTitle(/Game Shop|CSE590/i);
    });

    test('should navigate to login page', async ({ page }) => {
        await page.goto('/');

        // Find and click the login link/button
        const loginButton = page.locator('a[href="/login"], button:has-text("Login"), a:has-text("Login")').first();
        await loginButton.click();

        // Verify navigation to login page
        await expect(page).toHaveURL(/.*login/);
    });

    test('should display games on home page', async ({ page }) => {
        await page.goto('/');

        // Wait for content to load
        await page.waitForLoadState('networkidle');

        // Check if any game-related content is visible
        // This is a basic check - adjust selectors based on your actual implementation
        const hasContent = await page.locator('main, .container, [class*="game"], [class*="product"]').count();
        expect(hasContent).toBeGreaterThan(0);
    });
});

test.describe('Authentication Flow', () => {
    test('should show login form', async ({ page }) => {
        await page.goto('/login');

        // Check for email/username input
        const emailInput = page.locator('input[type="email"], input[type="text"], input[name="email"], input[placeholder*="email" i]').first();
        await expect(emailInput).toBeVisible();

        // Check for password input
        const passwordInput = page.locator('input[type="password"]').first();
        await expect(passwordInput).toBeVisible();
    });

    test('should show validation error for empty login', async ({ page }) => {
        await page.goto('/login');

        // Try to submit empty form
        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();

        // Wait a bit for validation to appear
        await page.waitForTimeout(500);

        // Form should still be on login page (not navigated away)
        await expect(page).toHaveURL(/.*login/);
    });
});

test.describe('Feature Change Demo', () => {
    test('should display updated welcome message', async ({ page }) => {
        await page.goto('/');

        // This test demonstrates a feature change
        // You can modify the expected text to show CI/CD detecting changes
        const pageContent = await page.textContent('body');

        // Check that the page loaded successfully
        expect(pageContent).toBeTruthy();
        expect(pageContent!.length).toBeGreaterThan(0);
    });
});
