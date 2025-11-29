# CI/CD Demo Guide

This guide will help you complete the three CI/CD demo video recordings.

## Requirements Checklist

1. ✅ **Docker Build** - Show CI/CD executing Docker build in GitHub
2. ✅ **E2E Test Fail** - Show CI/CD catching E2E test failure
3. ✅ **Feature Change** - Show CI/CD deploying a feature change

---

## Demo 1: Docker Build

### Goal
Show GitHub Actions automatically building Docker image

### Steps

1. **Open GitHub Repository**
   - Visit: https://github.com/Cthloveross/CSE590-04-final-project
   - Click "Actions" tab

2. **Trigger Build**
   ```bash
   cd "/path/to/CSE590-04-final-project"
   echo "# Demo commit" >> README.md
   git add README.md
   git commit -m "docs: trigger CI/CD demo"
   git push origin main
   ```

3. **Show Build Process**
   - Refresh Actions page to see new workflow running
   - Click into the workflow
   - Click "Build Docker Image" job
   - **Video Recording Focus**:
     - Show "Set up Docker Buildx" step
     - Show "Build and push Docker image" step
     - Show Docker layers in build log
     - Show successful push to GitHub Container Registry

4. **Verify Image**
   - Click "Packages" on right side of repository page
   - Show generated Docker image

---

## Demo 2: E2E Test Fail

### Goal
Show CI/CD detecting test failure and blocking deployment

### Steps

1. **Confirm Failing Test Exists**
   ```bash
   cat tests/e2e/failing-demo.spec.ts
   ```

2. **Trigger Test**
   ```bash
   git add .
   git commit -m "test: trigger failing test demo"
   git push origin main
   ```

3. **Show Test Failure**
   - View workflow in GitHub Actions
   - **Video Recording Focus**:
     - Show "Run E2E Tests" job marked as ❌ failed
     - Click to view detailed logs
     - Show error message
     - Show deploy job skipped because tests failed

---

## Demo 3: Feature Change

### Goal
Show that after modifying page content, CI/CD automatically tests and deploys

### Steps

1. **Fix Failing Test**
   ```bash
   rm tests/e2e/failing-demo.spec.ts
   git add tests/e2e/failing-demo.spec.ts
   git commit -m "test: remove failing test for demo"
   git push origin main
   ```

2. **Modify Page Content**
   - Open `pages/index.vue`
   - Change some text

3. **Commit Changes**
   ```bash
   git add pages/index.vue
   git commit -m "feat: update welcome message"
   git push origin main
   ```

4. **Show CI/CD Process**
   - Show all jobs successful: ✅ Build, ✅ Test (Unit), ✅ Test (E2E)

5. **Verify Changes**
   ```bash
   docker-compose up -d
   # Open http://localhost:3000
   ```

---

## Quick Demo Scripts

### Demo 1 Script (2 minutes)
```bash
ls -la Dockerfile
echo "# Docker build demo" >> README.md
git add . && git commit -m "demo: docker build" && git push
# Open GitHub Actions and show Build job
```

### Demo 2 Script (2 minutes)
```bash
cat tests/e2e/failing-demo.spec.ts
git add . && git commit -m "demo: test failure" --allow-empty && git push
# Open GitHub Actions and show E2E Test job failed
```

### Demo 3 Script (3 minutes)
```bash
rm tests/e2e/failing-demo.spec.ts
git add . && git commit -m "fix: remove failing test" && git push
# Wait for success, then modify pages/index.vue
git add . && git commit -m "feat: update welcome text" && git push
# Show all jobs successful
```

---

## Pre-Recording Checklist

- [ ] GitHub Actions is enabled
- [ ] Repository has `.github/workflows/ci-cd.yml` file
- [ ] Docker files exist (Dockerfile, docker-compose.yml)
- [ ] Playwright test files exist
- [ ] Git is configured correctly

Good luck with your demo! 🎉
