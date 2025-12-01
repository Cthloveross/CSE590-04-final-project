# E2E Test Suite Video Demo Script

## Overview

This document provides a walkthrough for demonstrating the End-to-End (E2E) test suite using **Playwright**. The test suite covers the complete user journey from browsing to checkout, API endpoints, authentication, and real-time features.

---

## Test Suite Architecture

```
tests/e2e/
├── happy-path.spec.ts   # Full user journey tests
├── api.spec.ts          # API endpoint tests
├── auth.spec.ts         # Authentication tests
├── socket.spec.ts       # Socket.IO connectivity tests
├── catalog.spec.ts      # Game catalog tests
├── cart.spec.ts         # Shopping cart tests
├── checkout.spec.ts     # Checkout flow tests
├── orders.spec.ts       # Order management tests
├── home.spec.ts         # Home page tests
└── navigation.spec.ts   # Navigation tests
```

**Total: 10 test files** covering all major features

---

## Test Configuration

### Playwright Config (`playwright.config.ts`)

| Setting        | Value                   | Description            |
| -------------- | ----------------------- | ---------------------- |
| Test Directory | `./tests/e2e`           | All E2E tests location |
| Base URL       | `http://localhost:3000` | Target application     |
| Parallel       | `fullyParallel: true`   | Run tests in parallel  |
| Retries        | 2 on CI, 0 locally      | Retry failed tests     |
| Reporter       | HTML                    | Generate HTML report   |

### Cross-Browser Testing

Tests run on **5 browser configurations**:
- ✅ Desktop Chrome
- ✅ Desktop Firefox
- ✅ Desktop Safari (WebKit)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

---

## Video Demo Flow (Estimated: 5-7 minutes)

### Part 1: Introduction (30 seconds)

**Script:**
> "Now let's look at our End-to-End test suite. We use Playwright for automated browser testing, which allows us to test the application across multiple browsers including Chrome, Firefox, Safari, and mobile devices."

**Show:**
- Open `playwright.config.ts` in VS Code
- Highlight the browser configurations

---

### Part 2: Test Categories Overview (1 minute)

**Script:**
> "Our test suite covers several key areas..."

**Navigate through test files and explain:**

1. **Happy Path Tests** (`happy-path.spec.ts`)
   > "The happy path test simulates a complete user journey: login, browse services, add to cart, and checkout."

2. **API Tests** (`api.spec.ts`)
   > "We test our REST API endpoints directly - games, services, and authentication endpoints."

3. **Authentication Tests** (`auth.spec.ts`)
   > "These tests verify login functionality, protected routes, and OAuth button visibility."

4. **Socket.IO Tests** (`socket.spec.ts`)
   > "We also test our real-time Socket.IO server connectivity."

---

### Part 3: Run the Tests (2-3 minutes)

**Commands to demonstrate:**

```bash
# Run all tests
npm run test:e2e

# Run with UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/happy-path.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run only on Chrome
npx playwright test --project=chromium
```

**Script:**
> "Let me run the test suite. I'll use UI mode so we can see the tests in action."

```bash
npx playwright test --ui
```

**Demonstrate in UI:**
1. Show the test explorer on the left
2. Click on a test to run it
3. Show the browser automation happening
4. Point out the timeline and step-by-step execution

---

### Part 4: Test Details Walkthrough (2 minutes)

#### Happy Path Test Explanation

**Script:**
> "Let's look at our main happy path test in detail..."

```typescript
test('complete flow: login → browse → add to cart → checkout', async ({ page }) => {
    // Step 1: Start from home page
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Counter-Strike 2')

    // Step 2: Navigate to login and authenticate
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('user@example.com')
    await page.locator('input[type="password"]').fill('user12345')
    await page.locator('button[type="submit"]').click()

    // Step 3: Browse services
    await page.goto('/games/cs2')
    
    // Step 4: Add to cart
    const serviceCard = page.locator('a[href^="/services/"]').first()
    await serviceCard.click()
    
    // Step 5: Checkout
    await page.goto('/cart')
})
```

**Key Points to Mention:**
- Uses real browser automation
- Tests actual user interactions
- Verifies DOM elements and navigation
- Handles async operations with `await`

#### API Test Explanation

**Script:**
> "For API tests, we use Playwright's request context to make HTTP calls directly..."

```typescript
test('GET /api/games returns games', async ({ request }) => {
    const response = await request.get('/api/games')
    expect(response.status()).toBe(200)
    const games = await response.json()
    expect(Array.isArray(games)).toBe(true)
})
```

---

### Part 5: View Test Report (1 minute)

**Script:**
> "After running tests, Playwright generates an HTML report..."

```bash
# Open the test report
npx playwright show-report
```

**Show in browser:**
- Overall pass/fail statistics
- Test duration
- Click on a test to see:
  - Step-by-step execution
  - Screenshots (on failure)
  - Traces for debugging

---

### Part 6: CI/CD Integration (30 seconds)

**Script:**
> "These tests also run automatically in our CI/CD pipeline on every push to GitHub..."

**Show GitHub Actions workflow** (`.github/workflows/ci-cd.yml`):
```yaml
- name: Run E2E Tests
  run: npx playwright test
```

---

## Quick Reference Commands

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run all tests
npm run test:e2e

# Run with visible browser
npx playwright test --headed

# Run specific test
npx playwright test tests/e2e/auth.spec.ts

# Run in UI mode (interactive)
npx playwright test --ui

# Debug a test
npx playwright test --debug

# Generate HTML report
npx playwright show-report

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## Test Coverage Summary

| Test File            | Tests  | Coverage Area        |
| -------------------- | ------ | -------------------- |
| `happy-path.spec.ts` | 3      | Full user journey    |
| `api.spec.ts`        | 5      | REST API endpoints   |
| `auth.spec.ts`       | 7      | Authentication flow  |
| `socket.spec.ts`     | 1      | Socket.IO server     |
| `catalog.spec.ts`    | 4      | Game/Service catalog |
| `cart.spec.ts`       | 1      | Shopping cart        |
| `checkout.spec.ts`   | 1      | Checkout process     |
| `orders.spec.ts`     | 1      | Order management     |
| `home.spec.ts`       | 3      | Home page            |
| `navigation.spec.ts` | 3      | Navigation           |
| **Total**            | **29** | **Full Application** |

---

## Key Testing Concepts Demonstrated

1. **Page Object Pattern** - Reusable login helper function
2. **Assertions** - Using `expect()` for verification
3. **Selectors** - CSS, text, role-based selectors
4. **Async/Await** - Handling asynchronous browser actions
5. **Cross-Browser Testing** - Multiple browser configurations
6. **API Testing** - Direct HTTP request testing
7. **CI Integration** - Automated testing in pipeline

---

## Troubleshooting

If tests fail, check:
1. Is the dev server running? (`npm run dev`)
2. Is the database seeded? (`npm run seed`)
3. Are the test accounts available? (`user@example.com` / `user12345`)
4. Is Socket.IO server running? (port 3001 or 30001)

---

## Conclusion Script

> "Our E2E test suite provides comprehensive coverage of the application's critical user flows. Using Playwright, we can test across multiple browsers and devices, ensuring a consistent experience for all users. The tests run automatically in our CI/CD pipeline, catching regressions before they reach production."
