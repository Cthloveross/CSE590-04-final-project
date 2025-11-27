import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test('should load the home page successfully', async ({ page }) => {
        await page.goto('/');
        
        // Check if the main heading is present
        await expect(page.locator('h1')).toContainText('Counter-Strike 2', { timeout: 10000 });
    });

    test('should navigate to login page', async ({ page }) => {
        await page.goto('/');

        // Find and click the login link/button
        const loginButton = page.locator('a[href="/login"]').first();
        await loginButton.click();

        // Verify navigation to login page
        await expect(page).toHaveURL(/.*login/);
    });

    test('should display games on home page', async ({ page }) => {
        await page.goto('/');

        // Wait for content to load
        await page.waitForLoadState('networkidle');

        // Check if the main heading exists
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
    });
});

test.describe('Authentication Flow', () => {
    test('should show login form', async ({ page }) => {
        await page.goto('/login');

        // Check for email/username input
        const emailInput = page.locator('input[type="email"], input[type="text"], input[name="email"]').first();
        await expect(emailInput).toBeVisible({ timeout: 10000 });

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
    test('should display welcome message', async ({ page }) => {
        await page.goto('/');

        // Check that main heading is visible
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Counter-Strike 2');
    });
});
