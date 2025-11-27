import { test, expect } from '@playwright/test';

/**
 * E2E Test that will FAIL intentionally to demonstrate CI/CD catching test failures
 * This test should be fixed or removed before production deployment
 */
test.describe('Failing Test Demo', () => {
    test('DEMO: This test intentionally fails', async ({ page }) => {
        await page.goto('/');

        // This assertion will fail to demonstrate CI/CD test failure detection
        await expect(page.locator('#this-element-does-not-exist')).toBeVisible({
            timeout: 5000
        });
    });

    test.skip('This test is skipped', async ({ page }) => {
        // Skipped tests won't run in CI/CD
        await page.goto('/');
    });
});

/**
 * To demonstrate a passing pipeline:
 * 1. Comment out or remove the failing test above
 * 2. Uncomment the tests below
 */

/*
test.describe('Cart Functionality', () => {
  test('should add item to cart', async ({ page }) => {
    await page.goto('/');
    
    // This is a placeholder - adjust based on your actual implementation
    await page.waitForLoadState('networkidle');
    
    const hasContent = await page.locator('body').count();
    expect(hasContent).toBeGreaterThan(0);
  });
});
*/
