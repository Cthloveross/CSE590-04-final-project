# Video Demo Recording Script (Optimized)

**Total Duration:** ~12-14 minutes  
**Format:** Screen recording with voiceover  
**Project:** Gaming Services Marketplace - A full-stack Nuxt 3 application

---

## ⚡ Pre-Recording Checklist

### 1. Environment Verification
```bash
# Verify K8s cluster is running
kubectl cluster-info

# Check all pods are running
kubectl get pods -n gaming-platform
# ✅ Expected: 5 pods all in "Running" status
#   - gaming-platform-app-xxxxx (2 replicas)
#   - gaming-platform-socket-xxxxx (2 replicas)  
#   - gaming-platform-redis-xxxxx (1 replica)
```

### 2. Save Pod Names (run these before recording!)
```bash
# Get pod names into environment variables for easy access
export APP_POD1=$(kubectl get pods -n gaming-platform -l component=app -o jsonpath='{.items[0].metadata.name}')
export APP_POD2=$(kubectl get pods -n gaming-platform -l component=app -o jsonpath='{.items[1].metadata.name}')
export SOCKET_POD1=$(kubectl get pods -n gaming-platform -l component=socket -o jsonpath='{.items[0].metadata.name}')
export SOCKET_POD2=$(kubectl get pods -n gaming-platform -l component=socket -o jsonpath='{.items[1].metadata.name}')

# Verify they're set
echo "App Pod 1: $APP_POD1"
echo "App Pod 2: $APP_POD2"
echo "Socket Pod 1: $SOCKET_POD1"
echo "Socket Pod 2: $SOCKET_POD2"
```

### 3. Browser Setup
- **Chrome**: Open http://localhost:30000 (will login as admin)
- **Safari**: Open http://localhost:30000 (will login as regular user)
- **GitHub Tab**: Open your repo's Actions page

### 4. VS Code Setup
- Open project folder
- Have these files ready to show:
  - `k8s/deployment-app.yaml`
  - `k8s/deployment-socket.yaml`
  - `socket-server.mjs`
  - `.github/workflows/ci.yml`
  - `e2e/home.spec.ts`
  - `pages/index.vue`

### 5. Terminal Setup
- Increase font size to 14pt+ for readability
- Have 2-3 terminal tabs ready

---

# PART 1: Kubernetes Deployment Setup (2-2.5 min)

## 🎬 What to Show
1. Terminal: `kubectl` commands showing cluster status
2. VS Code: K8s configuration files
3. Brief explanation of architecture

---

## 1.1 Introduction & Cluster Overview

### Action
```bash
# Show cluster info
kubectl cluster-info

# Show all resources in gaming-platform namespace
kubectl get all -n gaming-platform
```

### Expected Output
```
NAME                                          READY   STATUS    RESTARTS   AGE
pod/gaming-platform-app-6bc67699cd-km2dc      1/1     Running   0          5m
pod/gaming-platform-app-6bc67699cd-lcs4m      1/1     Running   0          5m
pod/gaming-platform-redis-7479654c87-q2l8m    1/1     Running   0          5m
pod/gaming-platform-socket-7c5df456dc-25cwj   1/1     Running   0          5m
pod/gaming-platform-socket-7c5df456dc-sqwtb   1/1     Running   0          5m

NAME                             TYPE        CLUSTER-IP      PORT(S)
service/gaming-platform-app      NodePort    10.96.xxx.xx    3000:30000/TCP
service/gaming-platform-redis    ClusterIP   10.96.xxx.xx    6379/TCP
service/gaming-platform-socket   NodePort    10.96.xxx.xx    3001:30001/TCP
```

### 📝 Script

> "Welcome to our Gaming Services Marketplace demo. This is a full-stack web application built with Nuxt 3 and Vue, running on Kubernetes."
>
> **[Run: `kubectl cluster-info`]**
>
> "First, let me verify our Kubernetes cluster is healthy."
>
> **[Run: `kubectl get all -n gaming-platform`]**
>
> "Here's our deployment. We have **5 pods** running in the `gaming-platform` namespace:
>
> - **2 App pods** - These handle all REST API requests and serve the Nuxt application
> - **2 Socket.IO pods** - These handle real-time WebSocket connections
> - **1 Redis pod** - This is our message broker for Socket.IO scale-out
>
> Notice the services at the bottom:
> - The **App service** is exposed on NodePort **30000** - that's where users access the website
> - The **Socket.IO service** is on NodePort **30001** - that's where WebSocket connections go
> - **Redis** is internal only (ClusterIP) - it doesn't need external access"

---

## 1.2 App Deployment Configuration

### Action
**[Open VS Code: `k8s/deployment-app.yaml`]**

### Key Code to Highlight
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gaming-platform-app
spec:
  replicas: 2  # ← HIGHLIGHT THIS: Two replicas for load balancing
  selector:
    matchLabels:
      app: gaming-platform
      component: app
  template:
    spec:
      containers:
      - name: app
        image: gaming-platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: NUXT_PUBLIC_SOCKET_URL
          value: "http://localhost:30001"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: gaming-platform-secrets
              key: MONGODB_URI
```

### 📝 Script

> **[Show deployment-app.yaml in VS Code]**
>
> "Here's our App deployment configuration."
>
> **[Highlight `replicas: 2`]**
>
> "The key line is `replicas: 2`. This tells Kubernetes to run **two instances** of our application. When traffic comes in, Kubernetes automatically distributes requests between them."
>
> **[Scroll to env section]**
>
> "Each pod gets environment variables injected:
> - `NUXT_PUBLIC_SOCKET_URL` tells the frontend where to connect for WebSockets
> - `MONGODB_URI` comes from a Kubernetes Secret for security - we don't hardcode database credentials"

---

## 1.3 Socket.IO Deployment Configuration

### Action
**[Open VS Code: `k8s/deployment-socket.yaml`]**

### Key Code to Highlight
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gaming-platform-socket
spec:
  replicas: 2  # ← Two Socket.IO servers
  template:
    spec:
      containers:
      - name: socket
        image: gaming-platform:latest
        command: ["node", "socket-server.mjs"]  # ← Different entrypoint
        ports:
        - containerPort: 3001
        env:
        - name: REDIS_URL
          value: "redis://gaming-platform-redis:6379"  # ← CRITICAL: Redis connection
```

### 📝 Script

> **[Show deployment-socket.yaml]**
>
> "This is our Socket.IO deployment. It also has **2 replicas**, but notice two key differences:"
>
> **[Highlight `command`]**
>
> "First, the `command` is different - instead of running the Nuxt app, it runs `node socket-server.mjs`. This is a separate Socket.IO server."
>
> **[Highlight `REDIS_URL`]**
>
> "Second, and this is **critical** - the `REDIS_URL` environment variable. This connects all Socket.IO instances to the same Redis server."
>
> "Why does this matter? Without Redis, if User A connects to Pod 1 and User B connects to Pod 2, they couldn't communicate. Redis acts as a **message broker** - when Pod 1 sends a message, Redis delivers it to Pod 2, and vice versa."
>
> "This is what enables Socket.IO to scale horizontally."

---

# PART 2: Scale-Out Demo (4-5 min)

This is the most important part of the demo. We'll show that:
1. REST API requests are distributed across multiple app pods
2. Socket.IO connections are load-balanced across multiple socket pods
3. Real-time messages sync correctly across different pods via Redis

---

## 2.1 REST API Load Balancing (1.5 min)

### 🎬 Setup
- Split terminal view: Pod 1 logs on left, Pod 2 logs on right
- Browser ready to make requests

### Action - Start Monitoring Both App Pods
```bash
# Terminal 1 (Left side)
kubectl logs -f $APP_POD1 -n gaming-platform 2>&1 | grep -E "GET|POST|PUT|DELETE"

# Terminal 2 (Right side)
kubectl logs -f $APP_POD2 -n gaming-platform 2>&1 | grep -E "GET|POST|PUT|DELETE"
```

### Action - Make Requests in Browser
```
1. Open http://localhost:30000
2. Click on "Services" in navigation
3. Click on a specific service
4. Click "Login" and enter: user@example.com / password
5. Add a service to cart
6. Go to Cart page
7. Go to Orders page
```

### Expected Log Output

**Terminal 1 (Pod 1) might show:**
```
[12:34:56] GET / 200 45ms
[12:34:58] GET /api/services 200 120ms
[12:35:02] POST /api/auth/login 200 89ms
```

**Terminal 2 (Pod 2) might show:**
```
[12:34:57] GET /api/services/boost-service 200 67ms
[12:35:01] POST /api/cart 200 95ms
[12:35:04] GET /api/orders 200 78ms
```

### 📝 Script

> "Now let's see scale-out in action, starting with REST API load balancing."
>
> **[Show split terminal with both pod logs]**
>
> "I have two terminals showing logs from both App pods. Let's make some requests and see how Kubernetes distributes them."
>
> **[In browser: Navigate to homepage]**
>
> "I'm loading the homepage... watch the logs."
>
> **[Point to whichever terminal shows the request]**
>
> "That request went to Pod 1."
>
> **[Click on Services]**
>
> "Now I'm browsing services..."
>
> **[Point to logs]**
>
> "This request went to Pod 2. Kubernetes Service is automatically distributing traffic."
>
> **[Login to the app]**
>
> "When I login, the authentication request might go to either pod..."
>
> **[Add item to cart, view cart]**
>
> "And subsequent requests continue to be distributed. Notice that even though requests go to different pods, the user experience is seamless."
>
> "This works because our pods are **stateless** - they don't store session data locally. Everything is persisted in MongoDB, so any pod can handle any request."
>
> "This is REST API load balancing - if one pod goes down, the other continues serving traffic with zero downtime."

---

## 2.2 Socket.IO Scale-Out Architecture (2.5-3 min)

### 🎬 Setup
- Split terminal: Socket Pod 1 logs (left) | Socket Pod 2 logs (right)
- Chrome browser: Ready to login as admin
- Safari browser: Ready to login as regular user

### Action - Start Monitoring Both Socket Pods
```bash
# Terminal 1 (Left side)
kubectl logs -f $SOCKET_POD1 -n gaming-platform

# Terminal 2 (Right side)
kubectl logs -f $SOCKET_POD2 -n gaming-platform
```

---

### 2.2.1 Show Redis Adapter Code (Optional - if time permits)

### Action
**[Open VS Code: `socket-server.mjs`]**

### Key Code to Highlight
```javascript
// Redis Adapter for Scale-out
async function setupRedisAdapter() {
  const pubClient = createClient({ url: REDIS_URL })
  const subClient = pubClient.duplicate()
  
  await Promise.all([pubClient.connect(), subClient.connect()])
  
  // This line enables multi-instance Socket.IO
  io.adapter(createAdapter(pubClient, subClient))
  
  console.log(`✅ Redis Adapter connected: ${REDIS_URL}`)
  console.log(`✅ Instance ID: ${INSTANCE_ID}`)
}
```

### 📝 Script (if showing code)

> **[Show socket-server.mjs]**
>
> "Before the live demo, let me quickly show the code that makes this possible."
>
> **[Highlight the Redis adapter setup]**
>
> "This is our Socket.IO server. The key is `io.adapter(createAdapter(pubClient, subClient))`. This line tells Socket.IO to use Redis as its message broker instead of in-memory storage."
>
> "When a message is sent on one server, it goes through Redis and is delivered to all other servers. This is how users on different pods can communicate."

---

### 2.2.2 Two Users Login Demo

### Action - Login First User (Chrome as Admin)
```
1. In Chrome: Go to http://localhost:30000
2. Click "Login"
3. Enter: admin@example.com / password
4. Click "Login" button
```

### Expected Log Output (one of the pods will show):
```
✅ Client connected: NIl9DEVZjSvcmcONAAAB (Instance: socket-1-xxxxx)
👤 User authenticated: admin@example.com (692a894858b960b216d035c1) role: admin
👥 Online users count updated: 1
```

### Action - Login Second User (Safari as Regular User)
```
1. In Safari: Go to http://localhost:30000
2. Click "Login"
3. Enter: user@example.com / password
4. Click "Login" button
```

### Expected Log Output (hopefully the OTHER pod shows):
```
✅ Client connected: zi09iHK-D_nd8b01AAAB (Instance: socket-2-xxxxx)
👤 User authenticated: user@example.com (692a89a5bd7c0d5ab94caa02) role: user
👥 Online users count updated: 2
```

### 📝 Script

> "Now let's test Socket.IO scale-out with two users on different browsers."
>
> **[Show split terminal with both Socket.IO pod logs]**
>
> "I have logs from both Socket.IO pods. Let's see which pod each user connects to."
>
> **[In Chrome: Login as admin]**
>
> "First user logging in on Chrome as admin..."
>
> **[Watch logs, point to the pod that shows the connection]**
>
> "User A connected to **Pod 1**. You can see the authentication message and the unique Instance ID."
>
> "Notice the online count is now **1**."
>
> **[In Safari: Login as regular user]**
>
> "Now the second user logging in on Safari..."
>
> **[Watch logs]**
>
> "User B connected to... **Pod 2**! A different instance."
>
> "And the online count updated to **2** on both browsers. Even though these users are on different Socket.IO servers, the count is accurate because it's stored in Redis, not in each server's memory."

---

### 2.2.3 Real-Time Order Status Update Demo

### Action - Update Order Status
```
1. Chrome (Admin): Navigate to /admin/orders
2. Find an order (ideally from the Safari user)
3. Click the status dropdown/button
4. Change status to "In Progress" or "Completed"
```

### Expected Log Output

**Pod 1 (where admin is connected) might show:**
```
📦 Order status update requested: orderId=xxx status=in_progress
📦 Emitting to user room: user:692a89a5bd7c0d5ab94caa02
✅ Order update emitted successfully
```

**Pod 2 (where regular user is connected) might show:**
```
📡 Received broadcast from Redis adapter
📦 Delivering order update to connected client
```

### Expected Browser Behavior

**Safari (Regular User):**
- Orders page updates automatically (if they're on it)
- Or a toast notification appears showing the status change

### 📝 Script

> "Now the key test - can users on different pods receive real-time updates from each other?"
>
> **[Chrome: Navigate to /admin/orders]**
>
> "I'm going to the admin orders page. Here I can see all orders in the system."
>
> **[Find an order, prepare to change status]**
>
> "Watch Safari carefully - I'm about to change this order's status."
>
> **[Change the order status]**
>
> **[Immediately point to Safari]**
>
> "Did you see that? The user on Safari received the update **instantly**!"
>
> **[Show the terminal logs]**
>
> "Let's look at what happened in the logs:"
>
> **[Point to Pod 1 logs]**
>
> "Pod 1, where the admin is connected, processed the status update and emitted an event."
>
> **[Point to Pod 2 logs]**
>
> "Pod 2 received that event through Redis and delivered it to the user."
>
> "This is the power of Socket.IO scale-out with Redis:
> 1. Admin sends update → Pod 1 receives it
> 2. Pod 1 publishes to Redis
> 3. Redis broadcasts to all Socket.IO instances
> 4. Pod 2 receives from Redis → delivers to user
>
> All of this happens in **milliseconds**."



# PART 3: CI/CD Pipeline - Docker Build (1.5-2 min)

## 🎬 What to Show
1. VS Code: GitHub Actions workflow file
2. VS Code: Dockerfile
3. Browser: GitHub Actions page with recent runs

---

## 3.1 GitHub Actions Workflow

### Action
**[Open VS Code: `.github/workflows/ci.yml`]**

### Key Code to Show
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Docker image
        run: |
          docker build \
            --build-arg NUXT_PUBLIC_SOCKET_URL=${{ secrets.SOCKET_URL }} \
            --build-arg NUXT_PUBLIC_SITE_URL=${{ secrets.SITE_URL }} \
            -t gaming-platform:${{ github.sha }} \
            -t gaming-platform:latest .

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build  # ← Only runs after build succeeds
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### 📝 Script

> "Now let's look at our CI/CD pipeline."
>
> **[Show ci.yml in VS Code]**
>
> "This is our GitHub Actions workflow. It triggers automatically on every push and pull request to `main` or `develop` branches."
>
> **[Point to the `on:` section]**
>
> "The workflow has **two jobs**:"
>
> **[Scroll to build job]**
>
> "**Job 1: Build** - This builds our Docker image. It:
> - Checks out the code
> - Sets up Node.js 20
> - Installs dependencies with `npm ci`
> - Builds the Docker image with environment variables injected as build arguments
> - Tags it with both the commit SHA and 'latest'"
>
> **[Scroll to e2e-tests job]**
>
> "**Job 2: E2E Tests** - Notice `needs: build`. This means tests only run **after** the build succeeds."
>
> "It installs Playwright browsers and runs our full E2E test suite. If any test fails, the whole pipeline fails."
>
> **[Point to upload-artifact step]**
>
> "Test results are uploaded as artifacts so we can download and inspect them later, even if the run fails."

---

## 3.2 Dockerfile

### Action
**[Open VS Code: `Dockerfile`]**

### Key Code to Show
```dockerfile
# Build stage - includes all dev dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NUXT_PUBLIC_SOCKET_URL
ARG NUXT_PUBLIC_SITE_URL
RUN npm run build

# Production stage - minimal image
FROM node:20-alpine
WORKDIR /app
COPY patches ./patches
COPY package*.json ./
RUN npm ci
COPY --from=builder /app/.output /app/.output
COPY socket-server.mjs ./
RUN npm prune --production
EXPOSE 3000 3001
CMD ["node", ".output/server/index.mjs"]
```

### 📝 Script

> **[Show Dockerfile]**
>
> "Our Dockerfile uses **multi-stage builds** for efficiency."
>
> **[Point to builder stage]**
>
> "**Stage 1 (Builder):**
> - Starts with Node.js 20 Alpine image
> - Installs ALL dependencies including dev dependencies
> - Builds the Nuxt application
> - The `ARG` lines accept build-time variables for Socket.IO and site URLs"
>
> **[Point to production stage]**
>
> "**Stage 2 (Production):**
> - Starts fresh with a clean Node.js image
> - Only copies the **built output** from stage 1
> - Runs `npm prune --production` to remove dev dependencies
> - This creates a much smaller final image"
>
> "The benefit? Smaller image size means faster deployments and less storage."

---

## 3.3 GitHub Actions Dashboard

### Action
**[Open browser: GitHub repo → Actions tab]**

### What to Show
- List of recent workflow runs
- Green checkmarks for successful runs
- Click into a successful run to show job details

### 📝 Script

> **[Show GitHub Actions page]**
>
> "Here's our GitHub Actions dashboard. You can see the history of all our CI/CD runs."
>
> **[Point to recent successful runs]**
>
> "Each row is a workflow run. Green checkmark means everything passed. The commit message tells you what change triggered it."
>
> **[Click on a successful run]**
>
> "If I click into this run, I can see both jobs completed successfully."
>
> **[Click into the build job]**
>
> "The build logs show each step: checkout, npm install, Docker build... all successful."
>
> "This automated pipeline ensures every code change is built and tested before it can be merged. No manual steps required."

---

# PART 4: E2E Test Suite Overview (1.5-2 min)

## 🎬 What to Show
1. Terminal: List of test files
2. VS Code: Playwright config
3. VS Code: Sample test file

---

## 4.1 Test Files Overview

### Action
```bash
# List all test files with details
ls -la e2e/*.spec.ts

# Count total number of test cases
grep -r "test\('" e2e/ | wc -l
```

### Expected Output
```
-rw-r--r--  1 user  staff   8.5K  e2e/admin-orders.spec.ts
-rw-r--r--  1 user  staff   6.2K  e2e/auth.spec.ts
-rw-r--r--  1 user  staff   7.1K  e2e/cart.spec.ts
-rw-r--r--  1 user  staff   9.3K  e2e/catalog.spec.ts
-rw-r--r--  1 user  staff   5.8K  e2e/home.spec.ts
-rw-r--r--  1 user  staff   7.4K  e2e/orders.spec.ts
-rw-r--r--  1 user  staff   6.9K  e2e/services.spec.ts

Total: 145+ tests
```

### 📝 Script

> "Our E2E test suite is comprehensive. Let me show you what we're testing."
>
> **[Run: `ls -la e2e/*.spec.ts`]**
>
> "We have **7 test files** covering all major features:"
>
> "- **home.spec.ts** - Homepage loading, navigation, online user display
> - **auth.spec.ts** - Login, registration, logout, OAuth flows, error handling
> - **catalog.spec.ts** - Browsing games and services, search, filtering
> - **cart.spec.ts** - Adding items, updating quantities, removing items
> - **services.spec.ts** - Individual service pages, pricing, descriptions
> - **orders.spec.ts** - Creating orders, viewing order history, order details
> - **admin-orders.spec.ts** - Admin dashboard, status updates, access control"
>
> **[Run: grep command to count tests]**
>
> "In total, we have over **145 individual test cases**."

---

## 4.2 Playwright Configuration

### Action
**[Open VS Code: `playwright.config.ts`]**

### Key Code to Show
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,  // Fail if test.only() in CI
  retries: process.env.CI ? 2 : 0,  // Retry failed tests in CI
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:30000',
    trace: 'on-first-retry',  // Capture trace on retry
    screenshot: 'only-on-failure',
  },

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
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:30000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 📝 Script

> **[Show playwright.config.ts]**
>
> "Our Playwright configuration ensures thorough cross-browser testing."
>
> **[Point to projects section]**
>
> "We test on **4 different browser/device configurations**:
> - **Chromium** - Desktop Chrome
> - **Firefox** - Desktop Firefox  
> - **WebKit** - Safari browser engine
> - **Mobile Chrome** - Simulated Pixel 5 Android device"
>
> **[Point to retries and trace settings]**
>
> "In CI mode, failed tests are **retried twice** to handle flaky tests. We also capture screenshots and traces on failure for debugging."
>
> **[Point to webServer section]**
>
> "The `webServer` config automatically starts our dev server before running tests, so we don't have to do it manually."

---

## 4.3 Sample Test Walkthrough

### Action
**[Open VS Code: `e2e/auth.spec.ts`]**

### Key Code to Show
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
    
    // Fill in credentials
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'password')
    
    // Click login button
    await page.click('button:has-text("Login")')
    
    // Verify successful login
    await expect(page).toHaveURL('/')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button:has-text("Login")')
    
    // Should show error message, not redirect
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('user can logout', async ({ page }) => {
    // Login first
    await loginAsUser(page)  // Helper function
    
    // Click user menu and logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Logout')
    
    // Should show login button again
    await expect(page.locator('text=Login')).toBeVisible()
  })
})
```

### 📝 Script

> **[Show auth.spec.ts]**
>
> "Let me walk through a sample test file. This is our authentication tests."
>
> **[Point to first test]**
>
> "This test verifies a user can login with valid credentials. It:
> 1. Navigates to the login page
> 2. Fills in email and password
> 3. Clicks the login button
> 4. Verifies we're redirected to home and the user menu is visible"
>
> **[Point to second test]**
>
> "This test checks error handling. Invalid credentials should show an error message and NOT redirect away from the login page."
>
> **[Point to third test]**
>
> "And this tests logout functionality - after logging out, the login button should reappear."
>
> "Each test is **isolated** and **deterministic**. They simulate exactly what a real user would do."

---

# PART 5: E2E Test Failure Demo (2-2.5 min)

This part demonstrates how our CI/CD pipeline catches bugs before they reach production.

## 🎬 What to Show
1. VS Code: The test we're about to break
2. VS Code: Make a breaking change to the code
3. Terminal: Commit and push
4. Browser: GitHub Actions showing the failure

---

## 5.1 Show the Target Test

### Action
**[Open VS Code: `e2e/home.spec.ts`]**

### Key Code to Show
```typescript
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('displays correct heading', async ({ page }) => {
    await page.goto('/')
    
    const heading = page.locator('h1')
    await expect(heading).toContainText('Discover premium gaming services')
  })

  test('shows online users count', async ({ page }) => {
    await page.goto('/')
    
    const onlineCount = page.locator('[data-testid="online-count"]')
    await expect(onlineCount).toBeVisible()
  })
  
  // ... more tests
})
```

### 📝 Script

> "To demonstrate how our CI/CD catches issues, I'm going to intentionally break a test."
>
> **[Show home.spec.ts]**
>
> "Here's our homepage test. This test verifies that the heading contains **'Discover premium gaming services'**."
>
> "If I change the actual heading text on the page, this test will fail."

---

## 5.2 Make a Breaking Change

### Action
**[Open VS Code: `pages/index.vue`]**

### Find This Code
```vue
<template>
  <section class="space-y-8">
    <header class="...">
      <p class="text-sm uppercase">Services Catalog</p>
      <h1 class="text-3xl font-semibold text-white">
        Discover premium gaming services   <!-- CHANGE THIS -->
      </h1>
      <!-- ... -->
    </header>
  </section>
</template>
```

### Change To
```vue
<h1 class="text-3xl font-semibold text-white">
  Browse our gaming services   <!-- DIFFERENT TEXT -->
</h1>
```

### 📝 Script

> **[Open pages/index.vue]**
>
> "Here's the actual homepage component. Let me find the heading..."
>
> **[Find the h1 tag]**
>
> "Here it is. I'll change this from 'Discover premium gaming services' to something different - let's say 'Browse our gaming services'."
>
> **[Make the change and save]**
>
> "Saved. Now this text doesn't match what the test expects."

---

## 5.3 Commit and Push

### Action
```bash
# Stage the change
git add pages/index.vue

# Commit with a message
git commit -m "WIP: change homepage heading"

# Push to trigger CI/CD
git push origin main
```

### 📝 Script

> "Now I'll commit and push this change to trigger our CI/CD pipeline."
>
> **[Run git commands]**
>
> "Staged... committed... and pushed to GitHub."
>
> "The CI/CD pipeline should start automatically now."

---

## 5.4 Watch the Pipeline Fail

### Action
**[Open browser: GitHub → Actions tab]**

### What to Show
1. The new workflow run appearing (yellow = in progress)
2. Build job completing successfully (green)
3. E2E Tests job failing (red)
4. Click into the failed job to see error details

### Expected Error
```
FAILED: e2e/home.spec.ts:8:3 displays correct heading

Error: expect(locator).toContainText('Discover premium gaming services')
Expected string: "Discover premium gaming services"
Received string: "Browse our gaming services"
```

### 📝 Script

> **[Show GitHub Actions page]**
>
> "Here's GitHub Actions. You can see a new workflow run just started - that yellow dot means it's in progress."
>
> **[Wait for build to complete]**
>
> "Build job completed successfully. Now the E2E tests are running..."
>
> **[Wait for failure]**
>
> "And... **failed**! Red X. The pipeline caught our bug."
>
> **[Click into the failed run]**
>
> "Let's see what happened."
>
> **[Click into E2E Tests job, find the error]**
>
> "Here's the error:"
>
> **[Highlight the error message]**
>
> "'Expected: Discover premium gaming services' but 'Received: Browse our gaming services'"
>
> "The test expected the original text but found our changed text. This is **exactly what we want** - automated tests caught the discrepancy."
>
> **[Show PR status if applicable, or explain]**
>
> "In a real workflow, this failure would **block the pull request from merging**. The developer would have to either fix the code or update the test before the change can go to production."

---

## 5.5 Show Playwright Report (Optional)

### Action
If time permits, download and show the Playwright HTML report artifact.

### 📝 Script

> "GitHub Actions also uploads the Playwright report as an artifact. If I download it, I can see screenshots, traces, and detailed logs of exactly what happened during the test."

---

# PART 6: Fix and Successful CI/CD (1.5-2 min)

Now we'll fix the issue and show the pipeline passing.

## 🎬 What to Show
1. Terminal: Revert the change
2. Terminal: Commit and push the fix
3. Browser: GitHub Actions showing success
4. Browser: Working application

---

## 6.1 Fix the Breaking Change

### Action
```bash
# Option 1: Revert the file to original state
git checkout pages/index.vue

# OR Option 2: Manually change the text back in VS Code
# Change "Browse our gaming services" back to "Discover premium gaming services"
```

### 📝 Script

> "Now let me fix this issue. I'll revert the file back to its original state."
>
> **[Run: `git checkout pages/index.vue`]**
>
> "File reverted. The heading is back to 'Discover premium gaming services'."

---

## 6.2 Commit and Push the Fix

### Action
```bash
# Stage the fix
git add pages/index.vue

# Commit with a fix message
git commit -m "fix: restore original homepage heading"

# Push to trigger CI/CD again
git push origin main
```

### 📝 Script

> **[Run git commands]**
>
> "Committing the fix... and pushing to GitHub."
>
> "This will trigger the CI/CD pipeline again."

---

## 6.3 Watch the Pipeline Succeed

### Action
**[Open browser: GitHub → Actions tab]**

### What to Show
1. New workflow run appearing
2. Build job completing (green)
3. E2E Tests job completing (green)
4. Both jobs showing green checkmarks

### 📝 Script

> **[Show GitHub Actions page]**
>
> "A new workflow run started. Let's watch it..."
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

## 6.4 Verify the Application

### Action
**[Open browser: http://localhost:30000]**

### 📝 Script

> **[Show the application in browser]**
>
> "And here's our application running correctly. The heading says 'Discover premium gaming services' - exactly what the test expects."
>
> "This complete cycle demonstrates our CI/CD quality gate:
>
> 1. **Developer makes a change** → pushes to GitHub
> 2. **Automated build** → Docker image created
> 3. **Automated tests** → verify the change doesn't break anything
> 4. **If tests fail** → PR is blocked, developer must fix
> 5. **If tests pass** → code is safe to merge and deploy
>
> This ensures we never deploy broken code to production."

---

# 🎬 Closing Summary (30-45 sec)

### 📝 Script

> "Let me summarize what we've demonstrated today:"
>
> "**1. Kubernetes Infrastructure**
> - 5 pods running in our cluster
> - 2 App replicas for REST API load balancing
> - 2 Socket.IO replicas for real-time communication scale-out
> - 1 Redis instance for message brokering"
>
> "**2. Scale-Out Architecture**
> - REST API requests distributed across multiple app pods
> - Socket.IO connections load-balanced across multiple socket pods
> - Real-time messages synchronized via Redis adapter
> - Users on different pods can communicate seamlessly"
>
> "**3. CI/CD Pipeline**
> - Automated Docker builds on every push
> - Automated E2E testing with Playwright
> - 145+ tests across 4 browser configurations
> - Failed tests block code from merging"
>
> "This is a **production-ready, horizontally scalable** gaming services marketplace."
>
> "Thank you for watching!"

---

# 📋 Quick Command Reference

## Kubernetes Commands
```bash
# View all resources
kubectl get all -n gaming-platform

# View pods only
kubectl get pods -n gaming-platform

# View pod logs (follow mode)
kubectl logs -f <pod-name> -n gaming-platform

# Filter logs (e.g., only HTTP requests)
kubectl logs -f <pod-name> -n gaming-platform | grep -E "GET|POST"

# Describe pod for detailed info
kubectl describe pod <pod-name> -n gaming-platform

# Execute command in pod
kubectl exec -it <pod-name> -n gaming-platform -- /bin/sh

# Check services
kubectl get services -n gaming-platform
```

## Redis CLI Commands
```bash
# Connect to Redis
kubectl exec -it deployment/gaming-platform-redis -n gaming-platform -- redis-cli

# Inside Redis CLI:
SCARD online_users          # Count online users
SMEMBERS online_users       # List all online socket IDs
HGETALL user_sockets        # Map socket IDs to user IDs
KEYS *                      # List all keys
FLUSHALL                    # Clear all data (for reset)
```

## Git Commands
```bash
# Check status
git status

# Stage changes
git add <file>

# Commit
git commit -m "message"

# Push
git push origin main

# Revert a file
git checkout <file>
```

## Testing Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run with visible browser
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- e2e/home.spec.ts

# Run specific test by name
npm run test:e2e -- -g "displays correct heading"

# Open HTML report
npx playwright show-report
```

---

# ⏱️ Timeline Summary

| Part       | Duration       | Key Content                                                             |
| ---------- | -------------- | ----------------------------------------------------------------------- |
| **Part 1** | 2-2.5 min      | K8s cluster overview, deployment configs                                |
| **Part 2** | 4-5 min        | REST API load balancing, Socket.IO scale-out with Redis, real-time demo |
| **Part 3** | 1.5-2 min      | GitHub Actions workflow, Dockerfile, CI dashboard                       |
| **Part 4** | 1.5-2 min      | E2E test suite, Playwright config, sample tests                         |
| **Part 5** | 2-2.5 min      | Break a test, push to GitHub, show CI failure                           |
| **Part 6** | 1.5-2 min      | Fix the test, show CI success, closing summary                          |
| **Total**  | **~12-14 min** | Complete demonstration                                                  |

---

# 💡 Recording Tips

### Before Recording
1. **Test everything once** - Make sure all pods are running, both browsers work, GitHub is accessible
2. **Save pod names** to environment variables so you don't have to type them
3. **Clear terminal history** for a clean look
4. **Close unnecessary applications** to avoid notifications

### During Recording
1. **Speak at a moderate pace** - Not too fast, viewers need time to read the screen
2. **Pause after actions** - Give 2-3 seconds after each command or click
3. **Point with your cursor** - Hover over things you're talking about
4. **Don't read word-for-word** - Use the script as a guide, speak naturally
5. **If something goes wrong** - Just explain what should happen and continue

### Technical Tips
1. **Terminal font size**: At least 14pt
2. **Browser zoom**: 100-110%
3. **VS Code**: Hide sidebar when showing code, use Zen mode if needed
4. **Screen resolution**: 1920x1080 or higher
5. **Record each part separately** if possible - easier to re-record problem areas

### Backup Plans
- If a test doesn't fail as expected: Explain what WOULD happen
- If pods aren't load-balancing: Refresh browsers or restart pods
- If GitHub Actions is slow: Explain the expected outcome while waiting

---

# 🎯 Key Points to Emphasize

Throughout the demo, make sure to highlight these key achievements:

1. **Horizontal Scalability**
   - "Multiple pods can handle more traffic"
   - "Adding capacity is as simple as increasing replica count"

2. **Zero-Downtime Deployment**
   - "If one pod fails, others continue serving"
   - "Kubernetes automatically restarts failed pods"

3. **Real-Time Communication at Scale**
   - "Users on different servers can still communicate"
   - "Redis ensures messages reach all connected clients"

4. **Automated Quality Assurance**
   - "Every change is automatically tested"
   - "Broken code cannot reach production"

5. **Production-Ready Architecture**
   - "This is how real applications scale"
   - "Same patterns used by major tech companies"

---

**Good luck with your recording! 🎬**
