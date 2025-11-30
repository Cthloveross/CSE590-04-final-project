# CI/CD Demo Presentation Guide

This guide walks you through demonstrating the complete CI/CD pipeline for your Game Service Shop application.

## Prerequisites

- GitHub repository access (https://github.com/Cthloveross/CSE590-04-final-project)
- Local development environment set up
- Screen recording software ready

---

## Demo 1: Docker Build in CI/CD

### What to Show
The GitHub Actions workflow automatically builds a Docker image and pushes it to GitHub Container Registry (GHCR).

### Steps

1. **Navigate to GitHub Actions**
   - Go to your repository: https://github.com/Cthloveross/CSE590-04-final-project
   - Click on the "Actions" tab

2. **Show a Recent Workflow Run**
   - Click on a recent successful run of "CI/CD Pipeline"
   - Expand the "Build Docker Image" job
   - Show the steps:
     - `Set up Docker Buildx`
     - `Log in to GitHub Container Registry`
     - `Build and push Docker image`

3. **Show the Container Registry**
   - Go to your repository's main page
   - Click "Packages" on the right sidebar
   - Show the published Docker image with tags

### Key Points to Mention
- Uses `docker/build-push-action@v5` for efficient builds
- Caches layers with GitHub Actions cache (`cache-from: type=gha`)
- Automatically tags images with branch name, PR number, and commit SHA
- Pushes to `ghcr.io/cthloveross/cse590-04-final-project`

---

## Demo 2: E2E Test Failure → Fix → Success

### Part A: Make a Test Fail

1. **Open the auth test file locally:**
   ```bash
   code tests/e2e/auth.spec.ts
   ```

2. **Make a small change to break the test** - Change the expected heading text:
   
   Find this line (around line 19):
   ```typescript
   await expect(page.locator('h1')).toContainText('Welcome Back')
   ```
   
   Change it to:
   ```typescript
   await expect(page.locator('h1')).toContainText('Welcome Back!!!')
   ```

3. **Commit and push the breaking change:**
   ```bash
   git add tests/e2e/auth.spec.ts
   git commit -m "Break test: change expected heading text"
   git push
   ```

4. **Watch the CI/CD pipeline fail:**
   - Go to GitHub Actions
   - Watch the "Run E2E Tests" job
   - Show the test failure output:
     ```
     Error: expect(locator).toContainText(expected)
     Expected: "Welcome Back!!!"
     Received: "Welcome Back"
     ```

### Part B: Fix the Test

1. **Revert the change locally:**
   
   Change back to:
   ```typescript
   await expect(page.locator('h1')).toContainText('Welcome Back')
   ```

2. **Commit and push the fix:**
   ```bash
   git add tests/e2e/auth.spec.ts
   git commit -m "Fix test: restore correct expected heading text"
   git push
   ```

3. **Watch the CI/CD pipeline succeed:**
   - Go to GitHub Actions
   - Show the "Run E2E Tests" job passing
   - Show all 145 tests passing

### Key Points to Mention
- E2E tests run automatically on every push
- Tests run on multiple browsers (Chromium, Firefox, WebKit, Mobile)
- MongoDB service container provides real database for testing
- Failed tests block deployment to staging/production

---

## Demo 3: Feature Change via CI/CD

### What to Change
We'll update the homepage hero section text to demonstrate a feature deployment.

### Steps

1. **Open the homepage file:**
   ```bash
   code pages/index.vue
   ```

2. **Find and update the hero text** - Look for the main heading and update it:
   
   For example, find:
   ```vue
   <h1 class="...">Level Up Your Game</h1>
   ```
   
   Change to:
   ```vue
   <h1 class="...">Level Up Your Game 🎮</h1>
   ```
   
   Or update a subtitle/description text.

3. **Commit and push the feature:**
   ```bash
   git add pages/index.vue
   git commit -m "Feature: Add emoji to hero heading"
   git push
   ```

4. **Watch CI/CD Pipeline:**
   - Go to GitHub Actions
   - Show all jobs running:
     - ✅ Build Docker Image
     - ✅ Run Unit Tests
     - ✅ Run E2E Tests
   - Once all pass, show the new Docker image is built

5. **Show the Change (if deployed):**
   - If you have a deployed environment, show the updated text
   - Or show locally with `npm run dev`

### Alternative Feature Changes

If you prefer a different change, here are options:

**Option A: Update button text**
```vue
<!-- Before -->
<button>Add to Cart</button>

<!-- After -->
<button>Add to Cart 🛒</button>
```

**Option B: Update page title**
```typescript
// In nuxt.config.ts
app: {
  head: {
    title: 'Game Service Shop - Level Up Today!'  // Changed from original
  }
}
```

**Option C: Add a new banner**
```vue
<!-- Add to layouts/default.vue -->
<div class="bg-brand-primary text-white text-center py-2">
  🎉 New: Premium coaching services now available!
</div>
```

---

## CI/CD Pipeline Summary

### Workflow Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Push to GitHub │────▶│  GitHub Actions │────▶│  All Jobs Pass  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Build Docker  │     │  Run Unit Tests │     │  Run E2E Tests  │
│    Image      │     │                 │     │  (6 browsers)   │
└───────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Push to GHCR  │     │    ✅ Pass      │     │    ✅ Pass      │
└───────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| CI/CD Platform | GitHub Actions | Orchestrate pipeline |
| Container Registry | GHCR (ghcr.io) | Store Docker images |
| Build Tool | Docker Buildx | Multi-platform builds |
| Unit Tests | Vitest | Fast unit testing |
| E2E Tests | Playwright | Browser automation |
| Database (CI) | MongoDB 7.0 (service container) | Test database |

### Files Involved

- `.github/workflows/ci-cd.yml` - Main pipeline configuration
- `Dockerfile` - Container build instructions
- `playwright.config.ts` - E2E test configuration
- `vitest.config.ts` - Unit test configuration

---

## Recording Tips

1. **Before Recording:**
   - Clear terminal history
   - Close unnecessary applications
   - Ensure good internet connection

2. **During Recording:**
   - Narrate what you're doing
   - Zoom in on important parts
   - Pause on key results

3. **Timing Estimates:**
   - Demo 1 (Docker Build): ~2 minutes
   - Demo 2 (Test Fail/Fix): ~5 minutes (waiting for CI)
   - Demo 3 (Feature Change): ~3 minutes

4. **Pro Tips:**
   - Have GitHub Actions page open in advance
   - Use split screen to show code and CI simultaneously
   - Highlight the relevant lines when showing failures

---

## Quick Commands Reference

```bash
# Make a breaking change
git add .
git commit -m "Break test intentionally for demo"
git push

# Fix the change
git add .
git commit -m "Fix: restore correct test expectations"
git push

# Feature change
git add .
git commit -m "Feature: update homepage hero text"
git push

# View CI status
gh run list --limit 5

# View specific run
gh run view <run-id>
```

---

## Troubleshooting

**If tests are flaky:**
- Re-run the workflow from GitHub Actions UI
- Check if MongoDB service started correctly

**If Docker build fails:**
- Check Dockerfile syntax
- Ensure all dependencies are in package.json

**If deployment fails:**
- Verify secrets are configured
- Check server connectivity
