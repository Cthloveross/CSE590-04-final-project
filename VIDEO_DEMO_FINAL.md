# Video Demo Script - Final Version

**Total Duration:** ~10-12 minutes  
**Requirements Covered:**
- ✅ Scale-out REST API & Socket.IO-based central server
- ✅ E2E test suite  
- ✅ Runs on Kubernetes
- ✅ CI/CD Docker build
- ✅ CI/CD E2E test fail demo
- ✅ CI/CD feature change demo
- ✅ Logs showing load balancing

---

## ⚡ Pre-Recording Setup

```bash
# 1. Verify pods are running
kubectl get pods -n gaming-platform

# 2. Save pod names (IMPORTANT - run this before recording!)
export APP_POD1=$(kubectl get pods -n gaming-platform -l component=app -o jsonpath='{.items[0].metadata.name}')
export APP_POD2=$(kubectl get pods -n gaming-platform -l component=app -o jsonpath='{.items[1].metadata.name}')
export SOCKET_POD1=$(kubectl get pods -n gaming-platform -l component=socket -o jsonpath='{.items[0].metadata.name}')
export SOCKET_POD2=$(kubectl get pods -n gaming-platform -l component=socket -o jsonpath='{.items[1].metadata.name}')

# Verify
echo "APP_POD1: $APP_POD1"
echo "APP_POD2: $APP_POD2"
echo "SOCKET_POD1: $SOCKET_POD1"
echo "SOCKET_POD2: $SOCKET_POD2"

# 3. Browsers ready: Chrome + Safari at http://localhost:30000
# 4. GitHub Actions tab open: https://github.com/Cthloveross/CSE590-04-final-project/actions
# 5. VS Code open with project
```

---

# PART 1: Kubernetes Deployment (1.5-2 min)

## 1.1 Show Running Pods

### Action - Run in Terminal
```bash
kubectl get all -n gaming-platform
```

### Expected Output
```
NAME                                          READY   STATUS    RESTARTS   AGE
pod/gaming-platform-app-xxxxx                 1/1     Running   0          10m
pod/gaming-platform-app-xxxxx                 1/1     Running   0          10m
pod/gaming-platform-redis-xxxxx               1/1     Running   0          10m
pod/gaming-platform-socket-xxxxx              1/1     Running   0          10m
pod/gaming-platform-socket-xxxxx              1/1     Running   0          10m

NAME                             TYPE        CLUSTER-IP      PORT(S)
service/gaming-platform-app      NodePort    10.x.x.x        3000:30000/TCP
service/gaming-platform-redis    ClusterIP   10.x.x.x        6379/TCP
service/gaming-platform-socket   NodePort    10.x.x.x        3001:30001/TCP
```

### 📝 Script (Read This)

> "Welcome to our Gaming Services Marketplace demo. This is a full-stack application built with Nuxt 3 and Vue, running on Kubernetes."
>
> **[Run: `kubectl get all -n gaming-platform`]**
>
> "As you can see, we have **5 pods** running in the `gaming-platform` namespace:"
>
> "**Two App pods** - these are identical replicas of our Nuxt application. They handle all the REST API requests like fetching services, user authentication, and processing orders."
>
> "**Two Socket.IO pods** - these handle real-time WebSocket connections for features like live order status updates and online user counting."
>
> "**One Redis pod** - this is our message broker. It's critical for Socket.IO scale-out because it allows the two Socket.IO servers to communicate with each other."
>
> "Looking at the services, our app is exposed on **NodePort 30000**, and Socket.IO is on **NodePort 30001**. Redis is internal only - it doesn't need external access."

---

## 1.2 Show K8s Configuration

### 📂 File: `k8s/deployment-app.yaml` (Lines 1-15)

**[Open in VS Code]**

```yaml
# Kubernetes Deployment for the Nuxt.js Application
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gaming-platform-app
  namespace: gaming-platform
spec:
  replicas: 2  # ← HIGHLIGHT THIS LINE
  selector:
    matchLabels:
      app: gaming-platform
      component: app
```

### 📝 Script (Read This)

> **[Open `k8s/deployment-app.yaml` in VS Code]**
>
> "Here's our App deployment configuration. The key line is **`replicas: 2`** on line 10. This tells Kubernetes to always maintain two running instances of our application."
>
> "When one pod receives too much traffic or fails, Kubernetes automatically routes traffic to the other pod. This gives us **high availability** and **horizontal scaling**."

---

### 📂 File: `k8s/deployment-socket.yaml` (Lines 1-20)

**[Open in VS Code]**

```yaml
# Kubernetes Deployment for the Socket.IO Server (Scale-out with Redis Adapter)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gaming-platform-socket
spec:
  replicas: 2  # Scale-out enabled with Redis Adapter
  template:
    spec:
      containers:
        - name: socket-server
          image: gaming-platform:latest
          command: ["node", "socket-server.mjs"]  # ← Different entrypoint
          env:
            - name: REDIS_URL
              value: "redis://gaming-platform-redis:6379"  # ← Critical for scale-out
```

### 📝 Script (Read This)

> **[Open `k8s/deployment-socket.yaml`]**
>
> "This is our Socket.IO deployment. Notice two key differences from the App deployment:"
>
> "First, on line 13, the **`command`** is `node socket-server.mjs`. Instead of running the Nuxt app, it runs our dedicated Socket.IO server."
>
> "Second, on line 16, we have **`REDIS_URL`** pointing to our Redis service. This is absolutely critical for scale-out."
>


# PART 2: Load Balancing Demo - Logs from Separate Servers (3-4 min)

**⚠️ This is the most important part - it proves load balancing is working**

## 2.1 REST API Load Balancing (1-1.5 min)

### Setup - Split Terminal (Side by Side)

```bash
# Terminal 1 (Left) - App Pod 1 logs
kubectl logs -f $APP_POD1 -n gaming-platform 2>&1 | grep -E "GET|POST|PUT|DELETE"

# Terminal 2 (Right) - App Pod 2 logs
kubectl logs -f $APP_POD2 -n gaming-platform 2>&1 | grep -E "GET|POST|PUT|DELETE"
```

### Actions in Browser
1. Open http://localhost:30000
2. Click on "Browse CS2 Services" 
3. Click on a specific service
4. Click "Sign in" and login with: `user@example.com` / `password`
5. Add a service to cart
6. Go to Cart page
7. Go to Orders page

### Expected Log Output

**Terminal 1 (Pod 1):**
```
GET / 200 45ms
GET /api/games 200 120ms
POST /api/auth/login 200 89ms
```

**Terminal 2 (Pod 2):**
```
GET /api/games/cs2 200 67ms
POST /api/cart 200 95ms
GET /api/orders 200 78ms
```

### 📝 Script (Read This)

> "Now let me demonstrate that load balancing is actually working. I'm going to show you **logs from both backend servers side by side**."
>
> **[Show split terminal with both App pod logs]**
>
> "On the left, I have logs from App Pod 1. On the right, logs from App Pod 2. Both are filtered to show HTTP requests."
>
> **[In browser: Navigate to homepage]**
>
> "I'm loading the homepage..."
>
> **[Point to whichever terminal shows the request]**
>
> "That request was handled by **Pod 1**."
>
> **[Click on CS2 Services]**
>
> "Now I'm clicking on CS2 services..."
>
> **[Point to the other terminal if it shows the request]**
>
> "And this request went to **Pod 2**. You can see the Kubernetes Service is automatically distributing traffic between our two app servers."
>
> **[Login, add to cart, view orders]**
>
> "Even as I login, add items to cart, and view orders - requests continue to be distributed across both pods."
>
> "This works because our pods are **stateless**. They don't store any session data locally - everything is persisted in MongoDB. So any pod can handle any request for any user."
>
> "This is **REST API load balancing** in action. If one pod crashes, the other continues serving traffic with zero downtime."

---

## 2.2 Socket.IO Scale-Out with Redis (2 min)

### Setup - Split Terminal (Side by Side)

```bash
# Terminal 1 (Left) - Socket Pod 1 logs
kubectl logs -f $SOCKET_POD1 -n gaming-platform

# Terminal 2 (Right) - Socket Pod 2 logs  
kubectl logs -f $SOCKET_POD2 -n gaming-platform
```

### 📂 File: `socket-server.mjs` (Lines 25-40)

**[Optionally show in VS Code before the live demo]**

```javascript
// Redis Adapter for Scale-out (multiple Socket.IO instances)
async function setupRedisAdapter() {
  try {
    const pubClient = createClient({ url: REDIS_URL })
    const subClient = pubClient.duplicate()
    redisClient = createClient({ url: REDIS_URL })

    await Promise.all([pubClient.connect(), subClient.connect(), redisClient.connect()])

    io.adapter(createAdapter(pubClient, subClient))  // ← Key line
    isRedisConnected = true
    console.log(`✅ Redis Adapter connected: ${REDIS_URL}`)
    console.log(`✅ Instance ID: ${INSTANCE_ID}`)
```

### 📝 Script - Code Explanation (Optional, Read if Showing Code)

> **[Show socket-server.mjs in VS Code]**
>
> "Before the live demo, let me quickly show the code that enables this."
>
> "On line 36, we call `io.adapter(createAdapter(pubClient, subClient))`. This single line tells Socket.IO to use Redis as its message broker instead of storing everything in memory."
>
> "When a message is emitted on one server, it goes through Redis and is automatically delivered to all other Socket.IO servers. This is what makes scale-out possible."

---

### Live Demo - Two Users Login

### Actions
1. **Chrome**: Go to http://localhost:30000, click Login, enter `admin@example.com` / `password`
2. **Safari**: Go to http://localhost:30000, click Login, enter `user@example.com` / `password`

### Expected Log Output

**Socket Pod 1 might show:**
```
✅ Client connected: ABC123 (Instance: socket-xxxxx)
👤 User authenticated: admin@example.com (user-id) role: admin
👥 Online users count updated: 1
```

**Socket Pod 2 might show:**
```
✅ Client connected: XYZ789 (Instance: socket-xxxxx)
👤 User authenticated: user@example.com (user-id) role: user
👥 Online users count updated: 2
```

### 📝 Script (Read This)

> "Now let's test Socket.IO scale-out. I have logs from both Socket.IO pods side by side."
>
> **[In Chrome: Login as admin]**
>
> "First user logging in on Chrome as admin..."
>
> **[Watch logs, point to the pod that shows the connection]**
>
> "User A connected to **Pod 1**. You can see the Instance ID is unique to this pod. Online count is now **1**."
>
> **[In Safari: Login as regular user]**
>
> "Now the second user logging in on Safari with a different account..."
>
> **[Watch logs, hopefully shows on the OTHER pod]**
>
> "User B connected to **Pod 2** - a completely different Socket.IO server!"
>
> "But look at the online count - it shows **2** on both browsers. Even though these users are connected to different pods, they see the same accurate count."
>
> "This works because the online user data is stored in **Redis**, not in each server's memory. Both pods read from and write to the same Redis database."

---

### Live Demo - Real-Time Order Status Update

### Actions
1. **Chrome (Admin)**: Navigate to `/admin/orders`
2. Find an order (ideally from the Safari user)
3. Click on the status and change it to "In Progress" or "Completed"
4. **Watch Safari** - it should update automatically

### Expected Log Output

**Pod 1 (where admin is connected):**
```
📦 Order status update: orderId=xxx status=in_progress
📦 Emitting to user room: user:xxx
✅ Order update emitted successfully
```

**Pod 2 (where regular user is connected):**
```
📡 Received order update from Redis adapter
📦 Broadcasting to connected client
```

### 📝 Script (Read This)

> "Now the **key test** - can users on different pods receive real-time updates from each other?"
>
> **[Chrome: Navigate to /admin/orders]**
>
> "I'm going to the admin orders page. I can see all orders in the system."
>
> **[Find an order, prepare to change status]**
>
> "Watch Safari carefully - I'm about to change this order's status..."
>
> **[Change the order status]**
>
> **[Immediately point to Safari]**
>
> "Did you see that? The user on Safari received the update **instantly**!"
>
> "Let me show you what happened in the logs:"
>
> **[Point to Pod 1 logs]**
>
> "Pod 1, where the admin is connected, processed the status update and emitted an event."
>
> **[Point to Pod 2 logs]**
>
> "Pod 2 received that event through Redis and delivered it to the user."
>
> "This is **Socket.IO scale-out** in action:
> 1. Admin sends update to Pod 1
> 2. Pod 1 publishes to Redis
> 3. Redis broadcasts to all Socket.IO instances
> 4. Pod 2 receives from Redis and delivers to user
>
> All of this happens in **milliseconds**, completely transparent to the users."

---

# PART 3: CI/CD Docker Build (1.5 min)

## 3.1 GitHub Actions Workflow

### 📂 File: `.github/workflows/ci-cd.yml` (Lines 1-50)

**[Open in VS Code]**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}

  test-e2e:
    name: Run E2E Tests
    runs-on: ubuntu-latest
    steps:
      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 📝 Script (Read This)

> "Now let's look at our CI/CD pipeline."
>
> **[Open `.github/workflows/ci-cd.yml` in VS Code]**
>
> "This is our GitHub Actions workflow. It triggers automatically on every push and pull request to the `main` or `develop` branches."
>
> **[Point to lines 10-25]**
>
> "The first job is **Build Docker Image**. It:
> - Checks out the code
> - Sets up Docker Buildx for efficient builds
> - Builds and pushes our Docker image to GitHub Container Registry
> - Tags it with the branch name and commit SHA for traceability"
>
> **[Point to lines 27-50]**
>
> "The second job is **Run E2E Tests**. It:
> - Installs Playwright browsers
> - Builds the Nuxt application
> - Runs our full E2E test suite
> - Uploads the test report as an artifact - even if tests fail, we can download and inspect the report"

---

## 3.2 Dockerfile

### 📂 File: `Dockerfile` (All lines)

**[Open in VS Code]**

```dockerfile
# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NUXT_PUBLIC_SOCKET_URL=http://localhost:30001
ARG NUXT_PUBLIC_SITE_URL=http://localhost:30000
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
COPY patches ./patches
RUN npm ci
COPY --from=builder /app/.output /app/.output
COPY socket-server.mjs ./socket-server.mjs
RUN npm prune --production
EXPOSE 3000 3001
CMD ["node", ".output/server/index.mjs"]
```

### 📝 Script (Read This)

> **[Open `Dockerfile` in VS Code]**
>
> "Here's our Dockerfile. We use **multi-stage builds** for efficiency."
>
> **[Point to Stage 1, lines 1-9]**
>
> "**Stage 1** is the builder. It installs ALL dependencies including dev dependencies, then builds the Nuxt application. Notice the `ARG` lines - these accept build-time variables for Socket.IO and site URLs."
>
> **[Point to Stage 2, lines 11-21]**
>
> "**Stage 2** is the production image. It starts fresh with a clean Node.js Alpine image, copies only the built output from Stage 1, and runs `npm prune --production` to remove dev dependencies."
>
> "This multi-stage approach creates a much smaller final image - faster to deploy and more secure."

---

## 3.3 Show GitHub Actions Dashboard

### Action
**[Open browser: https://github.com/Cthloveross/CSE590-04-final-project/actions]**

### 📝 Script (Read This)

> **[Show GitHub Actions page in browser]**
>
> "Here's our GitHub Actions dashboard. Each row is a workflow run triggered by a push or pull request."
>
> **[Point to a recent successful run with green checkmarks]**
>
> "You can see recent successful runs - the green checkmarks show all jobs passed."
>
> **[Click into a successful run]**
>
> "If I click into this run, I can see the Docker build job completed successfully, and all E2E tests passed."
>
> "This automated pipeline ensures every code change is built and tested before it can be merged."

---

# PART 4: E2E Test Suite (1-1.5 min)

## 4.1 Test Files Overview

### Action - Run in Terminal
```bash
ls -la tests/e2e/*.spec.ts
```

### Expected Output
```
-rw-r--r--  tests/e2e/api.spec.ts
-rw-r--r--  tests/e2e/auth.spec.ts
-rw-r--r--  tests/e2e/cart.spec.ts
-rw-r--r--  tests/e2e/catalog.spec.ts
-rw-r--r--  tests/e2e/checkout.spec.ts
-rw-r--r--  tests/e2e/happy-path.spec.ts
-rw-r--r--  tests/e2e/home.spec.ts
-rw-r--r--  tests/e2e/navigation.spec.ts
-rw-r--r--  tests/e2e/orders.spec.ts
-rw-r--r--  tests/e2e/socket.spec.ts
```

### 📝 Script (Read This)

> "Let me show you our E2E test suite."
>
> **[Run: `ls -la tests/e2e/*.spec.ts`]**
>
> "We have **10 test files** covering all major features:
> - **auth** - login, registration, logout
> - **cart** - adding items, updating quantities, removing items
> - **catalog** - browsing games and services
> - **checkout** - the purchase flow
> - **orders** - viewing order history
> - **home** - homepage functionality
> - **navigation** - routing between pages
> - **socket** - real-time features
> - **happy-path** - complete user journey
> - **api** - direct API testing"

---

## 4.2 Playwright Configuration

### 📂 File: `playwright.config.ts` (Lines 1-55)

**[Open in VS Code]**

```typescript
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    reporter: 'html',

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],
});
```

### 📝 Script (Read This)

> **[Open `playwright.config.ts` in VS Code]**
>
> "Here's our Playwright configuration."
>
> **[Point to projects section, lines 18-38]**
>
> "We test on **5 different browser configurations**:
> - Desktop Chrome
> - Desktop Firefox
> - Desktop Safari using WebKit
> - Mobile Chrome on Pixel 5
> - Mobile Safari on iPhone 12"
>
> **[Point to retries line]**
>
> "In CI mode, failed tests are **retried twice** to handle flaky tests. This ensures we don't fail the build due to temporary issues."

---

## 4.3 Sample Test

### 📂 File: `tests/e2e/home.spec.ts` (All lines)

**[Open in VS Code]**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
    test('displays hero section', async ({ page }) => {
        await page.goto('/')
        await expect(page.locator('h1')).toContainText('Counter-Strike 2')
    })

    test('displays features', async ({ page }) => {
        await page.goto('/')
        await expect(page.getByText('Verified Boosters')).toBeVisible()
    })

    test('navigates to CS2 services', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('link', { name: /Browse CS2 Services/i }).first().click()
        await expect(page).toHaveURL(/.*games\/cs2/)
    })
})
```

### 📝 Script (Read This)

> **[Open `tests/e2e/home.spec.ts` in VS Code]**
>
> "Here's an example test file for the homepage."
>
> **[Point to first test, lines 4-7]**
>
> "This test navigates to the homepage and verifies the h1 heading contains 'Counter-Strike 2'."
>
> **[Point to second test, lines 9-12]**
>
> "This test checks that the 'Verified Boosters' feature text is visible."
>
> **[Point to third test, lines 14-18]**
>
> "And this test clicks the 'Browse CS2 Services' link and verifies we navigate to the correct URL."
>
> "Each test simulates exactly what a real user would do - clicking, typing, navigating - and verifies the expected results."

---

# PART 5: CI/CD E2E Test Fail Demo (2-2.5 min)

## 5.1 Show the Test We'll Break

### 📂 File: `tests/e2e/home.spec.ts` (Line 6)

```typescript
test('displays hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Counter-Strike 2')  // ← This line
})
```

### 📝 Script (Read This)

> "To demonstrate how our CI/CD catches bugs, I'm going to intentionally break a test."
>
> **[Show `tests/e2e/home.spec.ts`]**
>
> "This test on line 6 expects the h1 heading to contain 'Counter-Strike 2'. If I change the actual heading text on the page, this test will fail."

---

## 5.2 Make the Breaking Change

### 📂 File: `pages/index.vue` (Line 56)

**[Open in VS Code, find the h1 tag around line 56]**

### Original Code (Line 56)
```vue
<h1 class="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
  Level up your 
  <span class="bg-gradient-to-r from-brand to-cyan-400 bg-clip-text text-transparent">
    Counter-Strike 2
  </span>
  experience
</h1>
```

### Change To
```vue
<h1 class="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
  Level up your 
  <span class="bg-gradient-to-r from-brand to-cyan-400 bg-clip-text text-transparent">
    Gaming
  </span>
  experience
</h1>
```

### 📝 Script (Read This)

> **[Open `pages/index.vue` in VS Code]**
>
> "Here's the homepage component. Let me find the heading... it's around line 56."
>
> **[Find the h1 tag with "Counter-Strike 2"]**
>
> "Here it is. I'm going to change 'Counter-Strike 2' to just 'Gaming'."
>
> **[Make the change and save]**
>
> "Saved. Now this text doesn't match what the test expects."

---

## 5.3 Commit and Push

### Action - Run in Terminal
```bash
git add pages/index.vue
git commit -m "feat: update homepage heading"
git push origin main
```

### 📝 Script (Read This)

> "Now I'll commit and push this change to trigger our CI/CD pipeline."
>
> **[Run git commands]**
>
> "Staged... committed... and pushed to GitHub."
>
> "The CI/CD pipeline should start automatically now. Let's watch it."

---

## 5.4 Watch the Pipeline Fail

### Action
**[Open browser: GitHub Actions page, watch the new workflow run]**

### Expected Outcome
- Build job: ✅ Passes
- E2E Tests job: ❌ Fails

### Expected Error Message
```
FAILED: tests/e2e/home.spec.ts:6:5 displays hero section

Error: expect(locator).toContainText('Counter-Strike 2')
Expected string: "Counter-Strike 2"
Received string: "Gaming"
```

### 📝 Script (Read This)

> **[Show GitHub Actions page]**
>
> "Here's GitHub Actions. You can see a new workflow run just started - that yellow dot means it's in progress."
>
> **[Wait for build job to complete]**
>
> "Build job completed successfully... Docker image was built."
>
> **[Wait for E2E tests - this will take 1-2 minutes]**
>
> "Now the E2E tests are running... this takes a minute or two..."
>
> **[Wait for failure]**
>
> "And... **Failed!** Red X on the E2E tests."
>
> **[Click into the failed job, find the error]**
>
> "Let's see what happened..."
>
> **[Scroll to find the error message]**
>
> "Here's the error: The test expected to find 'Counter-Strike 2' in the heading, but it found 'Gaming' instead."
>
> "This is **exactly what we want** - the automated tests caught the discrepancy before this code could be merged to production."
>
> "If this were a pull request, it would be **blocked from merging** until the tests pass. This is our quality gate."

---

# PART 6: CI/CD Feature Change Success (1.5-2 min)

## 6.1 Fix the Code

### Action - Run in Terminal
```bash
# Option 1: Revert the file
git checkout pages/index.vue

# Stage and commit
git add pages/index.vue
git commit -m "fix: restore original homepage heading"
git push origin main
```

### 📝 Script (Read This)

> "Now let me fix this issue. I'll revert the file back to its original state."
>
> **[Run: `git checkout pages/index.vue`]**
>
> "File reverted. The heading is back to 'Counter-Strike 2'."
>
> **[Run remaining git commands]**
>
> "Committing the fix and pushing to GitHub..."

---

## 6.2 Watch the Pipeline Succeed

### Action
**[Open browser: GitHub Actions page, watch the new workflow run]**

### Expected Outcome
- Build job: ✅ Passes
- E2E Tests job: ✅ Passes

### 📝 Script (Read This)

> **[Show GitHub Actions page]**
>
> "A new workflow run started. Let's watch..."
>
> **[Wait for build]**
>
> "Build passed..."
>
> **[Wait for E2E tests]**
>
> "E2E tests running..."
>
> **[Wait for success]**
>
> "**All green!** Both jobs passed."
>
> **[Click into the successful E2E tests job]**
>
> "If I click in, I can see all tests passed. The homepage test that was failing before now passes because the text matches again."

---

## 6.3 Closing Summary

### 📝 Script (Read This)

> "Let me summarize what we've demonstrated today:"
>
> "**Kubernetes**: We have 5 pods running - 2 App replicas for REST API load balancing, 2 Socket.IO replicas for real-time scale-out, and 1 Redis instance as message broker."
>
> "**Load Balancing**: We saw logs from separate backend servers showing requests being distributed across different pods - this proves load balancing is working."
>
> "**Socket.IO Scale-Out**: Two users on different browsers connected to different Socket.IO pods, but they could see each other's online status and receive real-time updates instantly. This is powered by Redis as the message broker."
>
> "**E2E Test Suite**: We have comprehensive tests across 10 test files, running on 5 browser configurations including mobile devices."
>
> "**CI/CD Pipeline**: Every push triggers automated Docker builds and E2E tests. When tests fail, the code is blocked from merging. When tests pass, the code is safe to deploy."
>
> "This is a **production-ready, horizontally scalable** gaming services marketplace."
>
> "Thank you for watching!"

---

# ⏱️ Timeline Summary

| Part              | Duration       | Content                                           |
| ----------------- | -------------- | ------------------------------------------------- |
| 1. Kubernetes     | 1.5-2 min      | Show pods, deployment configs                     |
| 2. Load Balancing | 3-4 min        | **Logs from separate servers** - REST + Socket.IO |
| 3. CI/CD Build    | 1.5 min        | GitHub Actions workflow, Dockerfile               |
| 4. E2E Suite      | 1-1.5 min      | Test files, Playwright config, sample test        |
| 5. Test Fail      | 2-2.5 min      | Break code, push, show CI failure                 |
| 6. Test Pass      | 1.5-2 min      | Fix code, push, show CI success, closing          |
| **Total**         | **~10-12 min** |                                                   |

---

# 📋 Quick Reference - All Files

| File                          | Lines     | What to Show                          |
| ----------------------------- | --------- | ------------------------------------- |
| `k8s/deployment-app.yaml`     | 10        | `replicas: 2`                         |
| `k8s/deployment-socket.yaml`  | 7, 13, 16 | `replicas: 2`, `command`, `REDIS_URL` |
| `socket-server.mjs`           | 25-40     | Redis adapter setup                   |
| `.github/workflows/ci-cd.yml` | 10-50     | Build and E2E test jobs               |
| `Dockerfile`                  | All       | Multi-stage build                     |
| `playwright.config.ts`        | 18-38     | Browser projects                      |
| `tests/e2e/home.spec.ts`      | All       | Sample test                           |
| `pages/index.vue`             | ~56       | h1 heading to modify                  |

---

# 📋 Quick Commands

```bash
# Save pod names
export APP_POD1=$(kubectl get pods -n gaming-platform -l component=app -o jsonpath='{.items[0].metadata.name}')
export APP_POD2=$(kubectl get pods -n gaming-platform -l component=app -o jsonpath='{.items[1].metadata.name}')
export SOCKET_POD1=$(kubectl get pods -n gaming-platform -l component=socket -o jsonpath='{.items[0].metadata.name}')
export SOCKET_POD2=$(kubectl get pods -n gaming-platform -l component=socket -o jsonpath='{.items[1].metadata.name}')

# REST API load balancing logs (split terminal)
kubectl logs -f $APP_POD1 -n gaming-platform 2>&1 | grep -E "GET|POST"
kubectl logs -f $APP_POD2 -n gaming-platform 2>&1 | grep -E "GET|POST"

# Socket.IO logs (split terminal)
kubectl logs -f $SOCKET_POD1 -n gaming-platform
kubectl logs -f $SOCKET_POD2 -n gaming-platform

# Git commands for test fail/pass demo
git add pages/index.vue && git commit -m "feat: update heading" && git push
git checkout pages/index.vue && git add . && git commit -m "fix: restore heading" && git push
```

---

**Good luck with your recording! 🎬**
