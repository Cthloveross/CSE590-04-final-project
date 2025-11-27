# CI/CD Setup Guide

This project includes a complete CI/CD pipeline for GitHub Actions with Docker containerization.

## 🚀 Features Implemented

### 1. Docker Containerization
- **Multi-stage Dockerfile** for optimized production builds
- **Docker Compose** for local testing with MongoDB
- Automatic dependency installation and build optimization

### 2. GitHub Actions CI/CD Pipeline
The `.github/workflows/ci-cd.yml` includes multiple jobs:

#### Build Job
- Builds Docker image using Docker Buildx
- Pushes to GitHub Container Registry (ghcr.io)
- Runs on every commit to `main`, `develop`, and pull requests
- Uses GitHub's built-in caching for faster builds

#### Test Jobs
- **test-unit**: Vitest tests with coverage reporting
- **test-e2e**: Playwright tests for end-to-end validation
- Generates test reports and uploads artifacts
- Both jobs must pass before deployment

#### Deploy Jobs
- **deploy-staging**: Auto-deploys to staging on `develop` branch
- **deploy-production**: Auto-deploys to production on `main` branch (can be set to manual approval)
- Uses SSH for remote server deployment
- Requires GitHub Environments for approval workflows

### 3. E2E Testing with Playwright
- Configured for multiple browsers (Chrome, Firefox, Safari)
- Mobile device testing (Pixel 5, iPhone 12)
- Includes:
  - Basic navigation tests
  - Authentication flow tests
  - **Intentional failing test** for demo purposes

## 📦 Setup Instructions

### Prerequisites
- GitHub account with Actions enabled (free for public repos)
- Docker installed locally (for testing)
- Node.js 20+ (for local development)

### Local Testing

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Run E2E tests locally:**
   ```bash
   npm run test:e2e
   ```

4. **Test Docker build locally:**
   ```bash
   docker build -t game-shop:test .
   ```

5. **Run with Docker Compose:**
   ```bash
   docker-compose up
   ```

### GitHub Actions Configuration

1. **Enable GitHub Actions** (Settings → Actions → General):
   - Allow all actions and reusable workflows

2. **Enable GitHub Container Registry**:
   - Automatically available with GitHub Actions
   - Images pushed to `ghcr.io/your-username/repository-name`

3. **Set up GitHub Secrets** (Settings → Secrets and variables → Actions):
   - `SSH_PRIVATE_KEY`: SSH key for deployment servers
   - `STAGING_SERVER`: Staging server hostname
   - `STAGING_USER`: SSH user for staging
   - `PRODUCTION_SERVER`: Production server hostname  
   - `PRODUCTION_USER`: SSH user for production

4. **Configure GitHub Environments** (Settings → Environments):
   - Create `staging` environment
   - Create `production` environment (optionally add required reviewers for manual approval)

5. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: add GitHub Actions CI/CD pipeline"
   git push origin main
   ```

6. **Monitor workflows** (Actions tab):
   - View real-time pipeline execution
   - Check logs for each job
   - Download test artifacts

## 🎬 Demo Scenarios

### 1. Docker Build Demo
The pipeline automatically builds Docker images on every push:
- Uses multi-stage builds for optimization
- Caches layers for faster builds
- Tags with branch name and `latest`

### 2. E2E Test Failure Demo
`tests/e2e/failing-demo.spec.ts` contains an intentional failing test:
- Demonstrates CI/CD catching test failures
- Shows how pipeline prevents bad code from deploying
- **To fix**: Comment out the failing test or remove the file

### 3. Feature Change Demo
To demonstrate a feature change being deployed:

1. **Make a simple change** (example in `pages/index.vue`):
   ```bash
   # Add a comment or change text on the home page
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: update welcome message"
   git push origin main
   ```

3. **Watch the pipeline:**
   - Go to Actions tab on GitHub
   - Build job creates new Docker image
   - Test jobs run in parallel
   - Deploy job triggers automatically (or with approval)

## 📊 Pipeline Jobs Explained

```
┌──────────┐
│  BUILD   │ --> Builds & pushes Docker image
└────┬─────┘
     │
     ├─────────┬──────────┐
     ▼         ▼          ▼
┌─────────┐ ┌────────┐ 
│ TEST    │ │ TEST   │  --> Run in parallel
│ (Unit)  │ │ (E2E)  │
└────┬────┘ └───┬────┘
     │          │
     └────┬─────┘
          ▼
     ┌─────────┐
     │ DEPLOY  │ --> Staging (auto) or Production (auto/manual)
     └─────────┘
```

## 🔧 Troubleshooting

### Tests failing locally?
```bash
# Make sure dev server is running
npm run dev

# In another terminal
npm run test:e2e
```

### Docker build issues?
```bash
# Check .dockerignore
# Ensure node_modules is excluded
# Verify Dockerfile syntax
```

### CI/CD not triggering?
- Check `.github/workflows/ci-cd.yml` syntax
- Verify branch name matches (main/develop)
- Check GitHub Actions is enabled in repository settings
- Review Actions tab for error messages

## 🎯 Next Steps

1. **Remove the failing test demo** when ready for production
2. **Configure environment variables** for staging/production
3. **Set up actual deployment servers** or use GitHub Pages/Vercel
4. **Add more E2E tests** for critical user flows
5. **Enable branch protection rules** requiring status checks
6. **Configure required reviewers** for production environment

## 📝 Files Created

- `Dockerfile` - Multi-stage Docker build
- `docker-compose.yml` - Local testing environment
- `.dockerignore` - Files to exclude from Docker builds
- `.github/workflows/ci-cd.yml` - Complete GitHub Actions pipeline
- `playwright.config.ts` - E2E test configuration
- `tests/e2e/basic.spec.ts` - Basic E2E tests
- `tests/e2e/failing-demo.spec.ts` - Demo failing test

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Playwright Documentation](https://playwright.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Nuxt.js Deployment](https://nuxt.com/docs/getting-started/deployment)
