# Video Demo Recording Script

**Total Duration:** 12-15 minutes  
**Target Audience:** Technical reviewers, stakeholders  
**Equipment:** Screen recording software (ScreenFlow, OBS, etc.)

---

## Setup Before Recording

### 1. Environment Preparation
```bash
# Ensure K8s cluster is running
kubectl cluster-info

# Verify all pods are running
kubectl get pods -n gaming-platform
# Expected output: All pods in Running status

# Open necessary applications
# - Chrome browser (logged in as admin user)
# - Safari browser (ready for user login)
# - 2 Terminal windows for Pod logs
# - GitHub Actions page in browser
# - VS Code with project open
```

### 2. Terminal Setup
```bash
# Terminal 1 - Pod 1 logs
kubectl logs -f gaming-platform-socket-7c5df456dc-25cwj -n gaming-platform

# Terminal 2 - Pod 2 logs  
kubectl logs -f gaming-platform-socket-7c5df456dc-sqwtb -n gaming-platform
```

### 3. Browser Setup
- **Chrome**: Logged in as `admin@example.com` (admin account)
- **Safari**: Not logged in yet (will login as regular user)
- **Browser Tabs**: GitHub Actions, Project README, Application

---

# PART 1: Kubernetes Deployment Setup (2-2.5 min)

## 1.1 Initial Cluster Check

### Action
```bash
# Show cluster info
kubectl cluster-info

# Show all resources in gaming-platform namespace
kubectl get all -n gaming-platform
```

### Expected Output
```
NAME                                      READY   STATUS    RESTARTS   AGE
pod/gaming-platform-app-6bc67699cd-km2dc      1/1     Running   0          2m
pod/gaming-platform-app-6bc67699cd-lcs4m      1/1     Running   0          2m
pod/gaming-platform-redis-7479654c87-q2l8m    1/1     Running   0          2m
pod/gaming-platform-socket-7c5df456dc-25cwj   1/1     Running   0          2m
pod/gaming-platform-socket-7c5df456dc-sqwtb   1/1     Running   0          2m

NAME                                 TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)
service/gaming-platform-app          NodePort   10.96.123.45    <none>        3000:30000/TCP
service/gaming-platform-socket       NodePort   10.96.456.78    <none>        3001:30001/TCP
service/gaming-platform-redis        ClusterIP  10.96.789.01    <none>        6379/TCP
```

### Script (英文讲解词)
> "Welcome to our Gaming Services Marketplace demo. This is a full-stack application running on Kubernetes with multiple service instances for scalability and reliability."
>
> "Let me first verify our Kubernetes cluster is healthy and all services are running."
>
> *[Run kubectl commands]*
>
> "Perfect. We have five pods running in our gaming-platform namespace:
> - Two App service replicas (for REST API load balancing)
> - Two Socket.IO replicas (for real-time communication scale-out)
> - One Redis instance (for Socket.IO message brokering)
>
> We're using NodePort services to expose our application on ports 30000 (App) and 30001 (Socket.IO) for local Kubernetes development."

---

## 1.2 Kubernetes Configuration Structure

### Action - Show K8s Configuration Files
```bash
# Show project structure
tree k8s/ -L 1

# Open and show main configuration
cat k8s/kustomization.yaml
```

### File Path & Content
**Location**: `CSE590-04-final-project/k8s/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: gaming-platform

resources:
  - namespace.yaml
  - configmap.yaml
  - deployment-app.yaml
  - deployment-socket.yaml
  - deployment-redis.yaml
  - service-app.yaml
  - service-socket.yaml
  - service-redis.yaml
```

### Script
> "Our Kubernetes deployment is organized using Kustomize, which provides a clean way to manage multiple resources."
>
> "As you can see, we have configuration files for:
> - **namespace.yaml**: Creates the gaming-platform namespace
> - **deployment-*.yaml**: Defines our three main services (app, socket.io, redis)
> - **service-*.yaml**: Exposes these services to the cluster and outside world"

---

## 1.3 App Deployment Configuration

### Action - Show App Deployment
```bash
cat k8s/deployment-app.yaml
```

### File Path & Content
**Location**: `CSE590-04-final-project/k8s/deployment-app.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gaming-platform-app
  labels:
    app: gaming-platform
    component: app

spec:
  replicas: 2  # Two replicas for load balancing
  selector:
    matchLabels:
      app: gaming-platform
      component: app
  
  template:
    metadata:
      labels:
        app: gaming-platform
        component: app
    spec:
      containers:
      - name: app
        image: gaming-platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: NUXT_PUBLIC_SITE_URL
          value: "http://localhost:30000"
        - name: NUXT_PUBLIC_SOCKET_URL
          value: "http://localhost:30001"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: gaming-platform-secrets
              key: MONGODB_URI
```

### Script
> "Here's our App deployment configuration. Notice we have `replicas: 2`, which means Kubernetes will maintain two running instances of our application."
>
> "Each pod:
> - Runs the gaming-platform Docker image
> - Listens on port 3000 inside the container
> - Gets environment variables injected for Socket.IO URL and MongoDB connection
> - Has access to secrets (like MongoDB credentials) stored in Kubernetes"

---

## 1.4 Socket.IO Deployment Configuration

### Action - Show Socket.IO Deployment
```bash
cat k8s/deployment-socket.yaml
```

### File Path & Content
**Location**: `CSE590-04-final-project/k8s/deployment-socket.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gaming-platform-socket
  labels:
    app: gaming-platform
    component: socket

spec:
  replicas: 2  # Two separate Socket.IO servers
  selector:
    matchLabels:
      app: gaming-platform
      component: socket
  
  template:
    metadata:
      labels:
        app: gaming-platform
        component: socket
    spec:
      containers:
      - name: socket
        image: gaming-platform:latest
        command: ["node", "socket-server.mjs"]  # Run Socket.IO server
        ports:
        - containerPort: 3001
        env:
        - name: SOCKET_PORT
          value: "3001"
        - name: REDIS_URL
          value: "redis://gaming-platform-redis:6379"
        - name: NUXT_PUBLIC_SITE_URL
          value: "http://localhost:30000"
```

### Script
> "This is our Socket.IO deployment. Unlike the App, it has `command: ["node", "socket-server.mjs"]` to run a separate Socket.IO server instead of the Nuxt app."
>
> "Also notice the `REDIS_URL` environment variable. This is crucial for our scale-out architecture - all Socket.IO instances will connect to the same Redis instance to synchronize messages."

---

## 1.5 Service Exposure

### Action - Show App Service
```bash
cat k8s/service-app.yaml
cat k8s/service-socket.yaml
```

### File Paths & Content

**App Service Location**: `CSE590-04-final-project/k8s/service-app.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: gaming-platform-app
  labels:
    app: gaming-platform
    component: app

spec:
  type: NodePort
  selector:
    app: gaming-platform
    component: app
  ports:
    - protocol: TCP
      port: 3000          # Service port inside cluster
      targetPort: 3000    # Container port
      nodePort: 30000     # External port on localhost
```

**Socket.IO Service Location**: `CSE590-04-final-project/k8s/service-socket.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: gaming-platform-socket
  labels:
    app: gaming-platform
    component: socket

spec:
  type: NodePort
  selector:
    app: gaming-platform
    component: socket
  ports:
    - protocol: TCP
      port: 3001          # Service port inside cluster
      targetPort: 3001    # Container port
      nodePort: 30001     # External port on localhost
```

### Script
> "These are our Service configurations. Services expose our pods to the outside world."
>
> "For local Kubernetes development, we use NodePort services:
> - Port 3000 inside cluster → port 30000 on localhost (App service)
> - Port 3001 inside cluster → port 30001 on localhost (Socket.IO service)
>
> This is how you'll access the application: `http://localhost:30000` for the web app, and Socket.IO clients connect to `http://localhost:30001`."

---

## 1.6 Deployment Verification

### Action - Verify Services Running
```bash
# Show all services with their ports
kubectl get services -n gaming-platform -o wide

# Check specific pod details
kubectl describe pod gaming-platform-app-6bc67699cd-km2dc -n gaming-platform

# Check logs from a pod
kubectl logs gaming-platform-app-6bc67699cd-km2dc -n gaming-platform --tail=20
```

### Script
> "Now let me verify everything is working correctly. I'll check the services and pod details."
>
> *[Run commands]*
>
> "Excellent. Both services are running and listening on their NodePort addresses. The app logs show successful startup and environment variables properly injected."
>
> "At this point, our Kubernetes infrastructure is completely set up and ready for the application to handle traffic."

---

---

# PART 2: Scale-Out Architecture - REST API & Socket.IO (4-5 min)

In this part, we demonstrate how the application scales horizontally across multiple backend servers:
1. **REST API**: Using Kubernetes Service load balancing to distribute requests across 2 app pods
2. **Socket.IO**: Using Redis adapter for message brokering across 2 Socket.IO instances

## 2.1 REST API Load Balancing Demo (1-1.5 min)

### Prerequisites
- Two terminals showing App Pod logs side-by-side
- Browser ready for user interactions
- Both pods running

### Step 1: Show App Pods

```bash
# Terminal 1
kubectl get pods -n gaming-platform -l component=app -o wide

# Expected output:
NAME                                      READY   STATUS    RESTARTS   AGE   IP          NODE
gaming-platform-app-6bc67699cd-km2dc      1/1     Running   0          2m    10.1.0.95   docker-desktop
gaming-platform-app-6bc67699cd-lcs4m      1/1     Running   0          2m    10.1.0.96   docker-desktop
```

### File Path & Code
**Location**: `CSE590-04-final-project/k8s/deployment-app.yaml`

**Lines 1-20:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gaming-platform-app
  labels:
    app: gaming-platform
    component: app

spec:
  replicas: 2  # ← TWO replicas for load balancing
  selector:
    matchLabels:
      app: gaming-platform
      component: app
```

### Step 2: Monitor Both App Pods

```bash
# Terminal 1 - Pod 1 logs
kubectl logs -f gaming-platform-app-6bc67699cd-km2dc -n gaming-platform | grep -E "GET|POST|authenticated"

# Terminal 2 - Pod 2 logs
kubectl logs -f gaming-platform-app-6bc67699cd-lcs4m -n gaming-platform | grep -E "GET|POST|authenticated"
```

### Step 3: Make Requests from Browser

```
1. Open http://localhost:30000 in browser
2. Browse the services catalog (this makes GET requests)
3. Click on a service (makes GET request)
4. Login (makes POST request to /api/auth/login)
5. Add service to cart (makes POST request)
6. View orders (makes GET request)
```

### Expected Results - Logs Show Load Distribution

**Pod 1 Logs:**
```
[GET] / - 200 - 45ms
[GET] /api/services - 200 - 120ms
[POST] /api/auth/login - 200 - 150ms
```

**Pod 2 Logs:**
```
[GET] /api/services/123 - 200 - 85ms
[POST] /api/cart - 200 - 95ms
[GET] /api/orders - 200 - 110ms
```

### Script (讲解词)
> "Now let me demonstrate our REST API load balancing. We have two App server replicas."
>
> "Notice in the logs that different requests are being handled by different pods. When you make a request to our API..."
>
> *[Click on services]*
> "...the Kubernetes Service automatically routes it to one of the available pods."
>
> *[Click on another service]*
> "Next request goes to a different pod. This load balancing happens automatically."
>
> *[Login to app]*
> "When I authenticate, the request might go to Pod 1..."
>
> *[View cart]*
> "...but the next request goes to Pod 2. Kubernetes distributes the load evenly."
>
> "Both pods are stateless - they don't need to store session data locally because we're using MongoDB for persistence. This is why they can independently handle requests."
>
> "This is REST API scale-out in action."

---

## 2.2 Socket.IO Scale-Out Architecture (2.5-3 min)

## 2.2.1 Redis Adapter Setup

### Action - Show Redis Adapter Code
```bash
# Open the Socket.IO server code
code socket-server.mjs
```

### File Path & Code
**Location**: `CSE590-04-final-project/socket-server.mjs`

**Lines 27-48:**
```javascript
// Redis clients for adapter and shared state
let redisClient = null
let isRedisConnected = false

// Redis Adapter for Scale-out (multiple Socket.IO instances)
async function setupRedisAdapter() {
  try {
    const pubClient = createClient({ url: REDIS_URL })
    const subClient = pubClient.duplicate()
    redisClient = createClient({ url: REDIS_URL })

    pubClient.on('error', (err) => console.log('Redis Pub Client Error:', err.message))
    subClient.on('error', (err) => console.log('Redis Sub Client Error:', err.message))
    redisClient.on('error', (err) => console.log('Redis Client Error:', err.message))

    await Promise.all([pubClient.connect(), subClient.connect(), redisClient.connect()])

    io.adapter(createAdapter(pubClient, subClient))
    isRedisConnected = true
    console.log(`✅ Redis Adapter connected: ${REDIS_URL}`)
    console.log(`✅ Instance ID: ${INSTANCE_ID}`)
    
    // Clean up stale online users data on startup
    await redisClient.del('online_users')
    await redisClient.del('user_sockets')
    console.log(`🧹 Cleaned up stale online users data`)
    
    return true
  } catch (error) {
    console.log(`⚠️ Redis not available (${error.message}), running in single-instance mode`)
    isRedisConnected = false
    return false
  }
}
```

### Script (讲解词)
> "Here's the crucial code that enables Socket.IO scale-out. Let me explain what's happening:"
>
> "First, we create three Redis clients:
> - `pubClient`: For publishing messages
> - `subClient`: For subscribing to messages  
> - `redisClient`: For storing online user data
>
> Then we call `io.adapter(createAdapter(pubClient, subClient))`. This is the magic line that makes Socket.IO scale-out work. Instead of storing room data in memory on each server, it uses Redis as a shared broker.
>
> The Instance ID (`socket-1-1764494075684`) is unique per pod - this helps us identify which server is handling which connection."

---

## 2.2.2 Online User Count Management

### Action - Show User Count Code
**Location**: `CSE590-04-final-project/socket-server.mjs`

**Lines 50-80:**
```javascript
// Get online count from Redis (shared across all instances)
async function getOnlineCount() {
  if (isRedisConnected && redisClient) {
    try {
      const count = await redisClient.sCard('online_users')
      return count
    } catch (error) {
      console.log('Redis getOnlineCount error:', error.message)
    }
  }
  // Fallback to local count
  return onlineUsers.size
}

// Add user to Redis set
async function addOnlineUser(socketId, userId) {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.sAdd('online_users', socketId)
      if (userId) {
        await redisClient.hSet('user_sockets', socketId, userId)
      }
    } catch (error) {
      console.log('Redis addOnlineUser error:', error.message)
    }
  }
}

// Remove user from Redis set
async function removeOnlineUser(socketId) {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.sRem('online_users', socketId)
      await redisClient.hDel('user_sockets', socketId)
    } catch (error) {
      console.log('Redis removeOnlineUser error:', error.message)
    }
  }
}

// Broadcast online count to all clients (via Redis pub/sub)
async function broadcastOnlineCount() {
  const count = await getOnlineCount()
  io.emit('users:online', { count })
}
```

### Script
> "To handle the online user count correctly across multiple instances, we store it in Redis instead of in memory."
>
> "`online_users` is a Redis Set that stores all connected socket IDs across all instances. When a user connects, we add their socket ID. When they disconnect, we remove it."
>
> "This ensures that if you have 2 users, you always see 2 online - not 4 (because we're not double-counting across instances)."

---

## 2.3 Connection and Authentication Flow

### Action - Show Connection Handler
**Location**: `CSE590-04-final-project/socket-server.mjs`

**Lines 110-145:**
```javascript
io.on('connection', async (socket) => {
  console.log(`✅ Client connected: ${socket.id} (Instance: ${INSTANCE_ID})`)
  onlineUsers.set(socket.id, { socketId: socket.id, isServer: false })
  
  // Don't add to online_users yet - wait for authentication
  // This prevents server-side socket clients from being counted

  // Send chat history to new user
  if (chatHistory.length > 0) {
    socket.emit('chat:history', chatHistory)
  }

  // User authentication - this is when we count the user as online
  socket.on('authenticate', async (data) => {
    console.log(`👤 User authenticated: ${data.email} (${data.userId}) role: ${data.role}`)
    
    // Check if this is a server connection (from Nuxt API)
    const isServerConnection = data.role === 'server' || data.userId === 'server'
    
    onlineUsers.set(socket.id, { ...data, socketId: socket.id, isServer: isServerConnection })
    
    if (!isServerConnection) {
      // Only count real users, not server connections
      await addOnlineUser(socket.id, data.userId)
      await broadcastOnlineCount()
    }
    
    socket.join(`user:${data.userId}`)
    socket.join(`role:${data.role}`)
  })

  // ... more event handlers ...

  socket.on('disconnect', async (reason) => {
    const userData = onlineUsers.get(socket.id)
    const isServer = userData?.isServer || false
    console.log(`❌ Client disconnected: ${socket.id} (${reason}) isServer: ${isServer}`)
    onlineUsers.delete(socket.id)
    
    // Only update online count if this was a real user, not a server connection
    if (!isServer && userData?.userId) {
      await removeOnlineUser(socket.id)
      await broadcastOnlineCount()
    }
  })
})
```

### Script
> "When a client connects, they're not immediately counted as online. We wait for the `authenticate` event."
>
> "During authentication, we check if it's a real user or a server-side connection. Real users are:
> - Added to the Redis `online_users` set
> - Joined to a `user:{userId}` room (for private messages)
> - Joined to a `role:{role}` room (for role-based broadcasts)
>
> When they disconnect, we remove them from Redis and broadcast the updated count."

---

## 2.4 Live Demo - Load Balancing Test

### Prerequisites
- Terminal 1: Showing Pod 1 logs
- Terminal 2: Showing Pod 2 logs
- Chrome: Ready with admin account
- Safari: Ready for user login
- Both browsers: Can see http://localhost:30000

### Step-by-Step Actions

#### Action 1: Show Two Pod Logs Side-by-Side
```bash
# Terminal 1
kubectl logs -f gaming-platform-socket-7c5df456dc-25cwj -n gaming-platform

# Terminal 2
kubectl logs -f gaming-platform-socket-7c5df456dc-sqwtb -n gaming-platform
```

#### Action 2: Login First User (Chrome - Admin)
```
1. Navigate to http://localhost:30000 in Chrome
2. Click "Login"
3. Enter: admin@example.com / password
4. Click "Login"
```

### Expected Output in Logs
**Pod 1 or Pod 2 will show:**
```
✅ Client connected: NIl9DEVZjSvcmcONAAAB (Instance: socket-1-1764494075684)
👤 User authenticated: admin@example.com (692a894858b960b216d035c1) role: admin
👥 Online users count updated: 1
```

#### Action 3: Login Second User (Safari)
```
1. Navigate to http://localhost:30000 in Safari
2. Click "Login"  
3. Enter different user credentials (or use: user@example.com)
4. Click "Login"
```

### Expected Output in Logs
**The OTHER Pod should show:**
```
✅ Client connected: zi09iHK-D_nd8b01AAAB (Instance: socket-1-1764494068768)
👤 User authenticated: user@example.com (692a89a5bd7c0d5ab94caa02) role: user
👥 Online users count updated: 2
```

### Script (Live Demo讲解词)
> "Now let me demonstrate the load balancing in action. I have two terminal windows showing logs from our two Socket.IO pods, and I'm about to log in with two different users."
>
> *[Login Chrome as admin]*
> "User A logged in. Watch the logs - they connected to Instance 1 on Pod 1. You can see their authentication logged here."
>
> "Notice the online count is now 1."
>
> *[Login Safari as different user]*
> "User B logged in. But look - they connected to a DIFFERENT instance! User B is on Instance 2 (Pod 2). Kubernetes load-balanced them to different servers."
>
> "Online count is now 2."
>
> "This demonstrates that:
> 1. Kubernetes is distributing connections across multiple pod instances
> 2. Both connections are tracked correctly despite being on different servers
> 3. Each pod has a unique Instance ID for identification"

---

## 2.5 Order Status Update - Real-Time Sync Demo

### Action - Update Order Status
```
1. Chrome (Admin): 
   - Navigate to /admin/orders
   - Find an order from the user
   - Click status button and change to "In Progress"
```

### Expected Results

**Chrome (Admin)**: Order status updates immediately ✅

**Safari (User)**: 
```
1. Orders page should auto-refresh
2. Order status changes in real-time
3. Notification appears in bottom right
```

**Terminal Logs - Pod 1:**
```
📦 Server: Order 507f1f77bcf36cd7991f0c01 status: in_progress for user 692a89a5bd7c0d5ab94caa02
📦 Emitting order status update: { orderId: '...', status: 'in_progress', ... }
✅ Order update emitted successfully
📡 Order status broadcast received: {...}
```

**Terminal Logs - Pod 2:**
```
📦 Server: Order status updated broadcast received
📦 Broadcasting to user:692a89a5bd7c0d5ab94caa02
```

### Script (讲解词)
> "Now watch what happens when admin updates an order status. I'll change it to 'In Progress'."
>
> *[Update order in Chrome]*
> *[Watch both logs]*
>
> "Perfect! Look at what happened:
>
> 1. The update was processed on one backend server
> 2. The Socket.IO server emitted `order:status_updated` event
> 3. Event was sent to Redis message broker
> 4. Redis delivered it to BOTH Socket.IO instances
> 5. Both instances broadcast to their connected users
>
> And watch Safari..."
>
> *[Show Safari auto-refreshing order status]*
>
> "The user on Safari received the notification instantly, even though they're connected to a different Socket.IO pod! The Redis adapter synchronized the message across pods."
>
> "This is Socket.IO scale-out in action!"

---

## 2.6 Online User Count Verification

### Action - Check Redis Data
```bash
kubectl exec -it deployment/gaming-platform-redis -n gaming-platform -- redis-cli
```

### Commands to Run
```
SMEMBERS online_users
# Should show socket IDs of logged-in users

HGETALL user_sockets
# Should show socket ID → user ID mappings

SCARD online_users
# Should show exact count (e.g., 2)
```

### Expected Output
```
1) "NIl9DEVZjSvcmcONAAAB"
2) "zi09iHK-D_nd8b01AAAB"

1) "NIl9DEVZjSvcmcONAAAB"
2) "692a894858b960b216d035c1"
3) "zi09iHK-D_nd8b01AAAB"
4) "692a89a5bd7c0d5ab94caa02"

(integer) 2
```

### Script
> "Let me verify the data in Redis to show how this scale-out architecture works under the hood."
>
> *[Run redis-cli commands]*
>
> "Here's the Redis data:
> - `online_users` set: Contains 2 socket IDs (one from each pod)
> - `user_sockets` hash: Maps socket IDs to user IDs
> - `SCARD` count: Exactly 2
>
> This proves all user tracking is centralized in Redis, not scattered across different pod instances."

---

---

# PART 3: CI/CD Pipeline - Docker Build (1.5-2 min)

## 3.1 GitHub Actions Workflow File

### Action - Show Workflow File
```bash
# In VS Code, open .github/workflows/ci.yml
code .github/workflows/ci.yml
```

### File Path & Content
**Location**: `CSE590-04-final-project/.github/workflows/ci.yml`

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
      - name: Checkout code
        uses: actions/checkout@v4
      
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
    needs: build
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Script (讲解词)
> "Here's our GitHub Actions CI/CD workflow. It's triggered on every push and pull request to main and develop branches."
>
> "The workflow has two main jobs:
>
> **1. Build Job:**
> - Checks out the code
> - Sets up Node.js environment
> - Installs dependencies
> - Builds a Docker image with build arguments for Socket.IO and site URLs
> - Tags it with both the commit hash and 'latest'
>
> **2. E2E Tests Job:**
> - Runs after the build succeeds (due to `needs: build`)
> - Installs Playwright browsers
> - Builds the application
> - Runs the full E2E test suite
> - Uploads test results as an artifact for inspection"

---

## 3.2 Dockerfile Explanation

### Action - Show Dockerfile
```bash
code Dockerfile
```

### File Path & Content
**Location**: `CSE590-04-final-project/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NUXT_PUBLIC_SOCKET_URL
ARG NUXT_PUBLIC_SITE_URL

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy patches for dependencies
COPY patches ./patches

# Install production dependencies
COPY package*.json ./
RUN npm ci

# Copy built application from builder
COPY --from=builder /app/.output /app/.output

# Copy Socket.IO server
COPY socket-server.mjs ./socket-server.mjs

# Prune to production only
RUN npm prune --production

EXPOSE 3000 3001

CMD ["node", ".output/server/index.mjs"]
```

### Script
> "Our Dockerfile uses a multi-stage build for efficiency."
>
> "In the Builder stage:
> - We start with Node.js 20 Alpine image
> - Install all dependencies (including dev)
> - Copy source code
> - Accept build arguments for Socket.IO and site URLs
> - Build the Nuxt application
>
> In the Production stage:
> - Start fresh with minimal Node.js Alpine image
> - Only copy built output and necessary files
> - Prune to production dependencies only
> - This results in a much smaller final image
>
> The Docker build happens automatically in our CI/CD pipeline on every push."

---

## 3.3 Check GitHub Actions History

### Action - Show GitHub Actions
```bash
# Open GitHub Actions in browser
# Navigate to your repository
# Click "Actions" tab
```

### Expected View
- List of workflow runs
- Each run shows: commit message, timestamp, status (✅ or ❌)
- Recent successful build with green checkmark
- Build logs available by clicking the run

### Script
> "Let me show you our recent CI/CD runs in GitHub Actions. As you can see, all our recent builds were successful."
>
> *[Click on a successful run]*
>
> "You can see detailed logs of each step. Here's the Docker build step... it successfully built the image and tagged it with the commit hash."
>
> "This automated Docker build ensures our application is always containerized and ready to deploy, without any manual steps."

---

---

# PART 4: E2E Test Suite Overview & Coverage (1-1.5 min)

## 4.1 E2E Test Files and Structure

### Action - Show All Test Files
```bash
# Show all test files
ls -lah e2e/*.spec.ts

# Count total number of tests
grep -r "test(" e2e/ | wc -l
```

### Expected Output
```
-rw-r--r--  1 user  staff   8.5K  Nov 30 10:23 e2e/admin-orders.spec.ts
-rw-r--r--  1 user  staff   6.2K  Nov 30 10:23 e2e/auth.spec.ts
-rw-r--r--  1 user  staff   7.1K  Nov 30 10:23 e2e/cart.spec.ts
-rw-r--r--  1 user  staff   9.3K  Nov 30 10:23 e2e/catalog.spec.ts
-rw-r--r--  1 user  staff   5.8K  Nov 30 10:23 e2e/home.spec.ts
-rw-r--r--  1 user  staff   7.4K  Nov 30 10:23 e2e/orders.spec.ts
-rw-r--r--  1 user  staff   6.9K  Nov 30 10:23 e2e/services.spec.ts

Total tests: 145
```

### File Path
**Location**: `CSE590-04-final-project/e2e/`

### Script
> "Let me show you our E2E test suite. We have 145 comprehensive tests covering all major user flows."
>
> "Here are our test files:
> - **home.spec.ts**: Homepage functionality and initial page load
> - **auth.spec.ts**: User authentication (login, register, logout, OAuth)
> - **catalog.spec.ts**: Game services catalog (browse, search, filter)
> - **cart.spec.ts**: Shopping cart functionality (add items, remove, update quantity)
> - **services.spec.ts**: Individual service pages and details
> - **orders.spec.ts**: Order creation and tracking
> - **admin-orders.spec.ts**: Admin order management and status updates
>
> Each test file contains multiple test cases that simulate real user interactions."

---

## 4.2 Test Configuration & Browser Coverage

### Action - Show Playwright Config
```bash
code playwright.config.ts
```

### File Path & Content
**Location**: `CSE590-04-final-project/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: 'http://localhost:30000',
    trace: 'on-first-retry',
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

### Script
> "Our Playwright configuration shows we test on 4 different browser/device combinations:
> - **Chromium**: Desktop Chrome browser
> - **Firefox**: Desktop Firefox browser
> - **WebKit**: Safari browser (using WebKit engine)
> - **Mobile Chrome**: Android mobile device simulation
>
> This ensures our application works correctly across different platforms and browsers.
>
> In CI/CD mode, tests run sequentially with 2 retries for flaky tests. Locally, we can run tests in parallel for faster feedback.
>
> All test results are generated in multiple formats: HTML reports, JSON, and JUnit XML (for CI integration)."

---

## 4.3 Sample Test Files - Detailed Walkthrough

### A. Authentication Tests

**Location**: `CSE590-04-final-project/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can register with email', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Login')
    await page.click('text=Sign up')
    
    // Fill registration form
    await page.fill('input[name="email"]', `user${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!')
    await page.click('button:has-text("Register")')
    
    // Should redirect to home and be logged in
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Profile')).toBeVisible()
  })

  test('user can login with existing credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button:has-text("Login")')
    
    // Should be logged in
    await expect(page).toHaveURL('/')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('user can login with GitHub OAuth', async ({ page }) => {
    await page.goto('/login')
    await page.click('button:has-text("GitHub")')
    
    // GitHub OAuth flow (mocked in test environment)
    await page.waitForNavigation()
    
    // Should be logged in after OAuth callback
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('user can logout', async ({ page, context }) => {
    // Login first
    await page.goto('/')
    await loginUser(page) // Helper function
    
    // Click logout
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Logout')
    
    // Should be logged out
    await expect(page.locator('text=Login')).toBeVisible()
  })

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button:has-text("Login")')
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
})
```

### B. Shopping Cart Tests

**Location**: `CSE590-04-final-project/e2e/cart.spec.ts`

```typescript
test.describe('Shopping Cart', () => {
  test('user can add service to cart', async ({ page }) => {
    await page.goto('/')
    
    // Browse to first service
    await page.click('text=Services')
    await page.click('[data-testid="service-card"]:first-child')
    
    // Add to cart
    await page.click('button:has-text("Add to Cart")')
    
    // Cart should show 1 item
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
    
    // Toast notification should appear
    await expect(page.locator('text=Added to cart')).toBeVisible()
  })

  test('user can update quantity in cart', async ({ page }) => {
    await page.goto('/cart')
    
    // Increase quantity
    await page.click('[data-testid="increase-qty"]')
    
    // Check quantity updated
    await expect(page.locator('input[data-testid="qty"]')).toHaveValue('2')
    
    // Total price should update
    const price = await page.locator('[data-testid="total-price"]').textContent()
    expect(price).toContain('$')
  })

  test('user can remove item from cart', async ({ page }) => {
    await page.goto('/cart')
    
    // Remove first item
    await page.click('[data-testid="remove-item"]:first-child')
    
    // Confirm removal
    await page.click('button:has-text("Confirm")')
    
    // Item should be gone
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(0)
  })

  test('checkout requires login', async ({ page }) => {
    await page.context().clearCookies() // Logout
    
    await page.goto('/cart')
    await page.click('button:has-text("Checkout")')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })
})
```

### C. Admin Order Management Tests

**Location**: `CSE590-04-final-project/e2e/admin-orders.spec.ts`

```typescript
test.describe('Admin Order Management', () => {
  test('admin can view all orders', async ({ page }) => {
    await loginAsAdmin(page) // Helper
    
    await page.goto('/admin/orders')
    
    // Should see orders table
    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible()
    
    // Should have at least one order
    const rows = await page.locator('[data-testid="order-row"]').count()
    expect(rows).toBeGreaterThan(0)
  })

  test('admin can change order status', async ({ page }) => {
    await loginAsAdmin(page)
    
    await page.goto('/admin/orders')
    
    // Click status button on first order
    await page.click('[data-testid="status-button"]:first-child')
    
    // Select new status
    await page.click('text=In Progress')
    
    // Status should update
    await expect(page.locator('[data-testid="status-badge"]:first-child'))
      .toHaveText('In Progress')
    
    // User should receive real-time notification
    // (This would be verified through Socket.IO listeners)
  })

  test('non-admin cannot access admin orders', async ({ page }) => {
    await loginAsRegularUser(page)
    
    await page.goto('/admin/orders')
    
    // Should be redirected to home
    await expect(page).toHaveURL('/')
    
    // Should show error message
    await expect(page.locator('text=Unauthorized')).toBeVisible()
  })
})
```

### Script
> "Let me walk you through some of our test examples."
>
> **Authentication Tests:**
> "These tests verify our login system works correctly. We test email registration, credential-based login, OAuth with GitHub and Google, logout, and error handling for invalid credentials."
>
> **Shopping Cart Tests:**
> "These tests simulate real customer behavior: browsing services, adding items to cart, changing quantities, and removing items. We also verify that checkout requires authentication."
>
> **Admin Order Management Tests:**
> "These critical tests verify that only admins can access the order management page and can change order statuses. We also verify that regular users cannot access admin functions."
>
> "Each test is isolated and can run independently, and together they form a comprehensive quality gate for our application."

---

## 4.4 Running Tests Locally

### Action - Show Test Execution
```bash
# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e e2e/home.spec.ts

# Run with UI mode (interactive)
npm run test:e2e -- --ui

# Run with headed browser (see browser)
npm run test:e2e -- --headed

# Run only on chromium
npm run test:e2e -- --project=chromium
```

### Script
> "Developers can run these tests locally for immediate feedback. The `--headed` flag shows the browser, which is helpful for debugging."
>
> "The `--ui` mode is great for development - it shows test execution in real-time and lets you step through test actions."

---

# PART 5: CI/CD E2E Test Fail Demo (2-2.5 min)

---

## 5.2 Example Test - Homepage Test

### Action - Show Specific Test
```bash
code e2e/home.spec.ts
```

### File Path & Content
**Location**: `CSE590-04-final-project/e2e/home.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/Gaming Services/)
  })

  test('displays game services', async ({ page }) => {
    await page.goto('/')
    
    // Check main heading
    const heading = page.locator('h1')
    await expect(heading).toContainText('Discover premium gaming services')
  })

  test('displays online users count', async ({ page }) => {
    await page.goto('/')
    
    // Check online users display
    const onlineCount = page.locator('[data-testid="online-count"]')
    await expect(onlineCount).toBeVisible()
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    
    // Click services link
    await page.click('a:has-text("Services")')
    
    // Should navigate to services page
    await expect(page).toHaveURL(/\/.*services/)
  })
})
```

### Script
> "Let me show you a specific test - the homepage test."
>
> "This test:
> 1. Navigates to the home page
> 2. Verifies the page title contains 'Gaming Services'
> 3. Checks that the main heading displays 'Discover premium gaming services'
> 4. Verifies the online users count is visible
> 5. Tests that navigation links work correctly
>
> These tests are deterministic - they verify the exact state of the application."

---

## 5.3 Intentionally Break a Test

### Action 1 - Edit Homepage Text
```bash
# Open pages/index.vue
code pages/index.vue

# Find the heading section and change the text
# FROM: "Discover premium gaming services"
# TO:   "Browse our gaming services"  (Note: different text)
```

### File Path
**Location**: `CSE590-04-final-project/pages/index.vue`

```vue
<template>
  <section class="space-y-8">
    <header class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <p class="text-sm uppercase tracking-widest text-brand-light">Services Catalog</p>
      <!-- CHANGE THIS LINE: -->
      <h1 class="text-3xl font-semibold text-white">Browse our gaming services</h1>
      <!-- FROM: "Discover premium gaming services" -->
      <p class="text-sm text-slate-400">
        Connect with professional gamers for personalized coaching and services.
      </p>
    </header>
    <!-- ... rest of template ... -->
  </section>
</template>
```

### Script
> "I'm going to intentionally break a test to demonstrate how our CI/CD pipeline catches issues."
>
> "I'll change the homepage heading from 'Discover premium gaming services' to 'Browse our gaming services'."
>
> "This will cause our E2E test to fail because it's looking for the exact original text."

---

## 5.4 Commit and Push Broken Code

### Action - Commit and Push
```bash
git add pages/index.vue
git commit -m "WIP: change homepage heading"
git push origin main
```

### Script
> "Now I'll commit this change and push to GitHub. Watch what happens in the CI/CD pipeline."

---

## 5.5 Show CI Failure in GitHub Actions

### Action - Check GitHub Actions
```bash
# Open GitHub in browser
# Navigate to Actions tab
# Show the failing workflow run
```

### Expected View
**Workflow Run Status:**
```
❌ Build Docker Image - PASSED ✅
❌ E2E Tests - FAILED ❌
   └─ Homepage tests
      └─ ❌ displays game services
         Expected: "Discover premium gaming services"
         Received: "Browse our gaming services"
```

### Script
> "As you can see, the CI pipeline ran automatically. The Docker build succeeded, but the E2E tests failed!"
>
> *[Show failure details]*
>
> "Here's the error: The test expected to find 'Discover premium gaming services' but found 'Browse our gaming services' instead."
>
> "This is exactly what we want - the automated tests caught the discrepancy. In a real scenario, this would prevent the broken code from being merged to main."
>
> "GitHub will show a red X on this commit, and you can't merge the PR until tests pass."

---

## 5.6 Show Test Report

### Action - View Test Report
```bash
# In GitHub Actions, click on the failed run
# Click "E2E Tests" job
# Show the test execution logs
# Look for "playwright-report" artifact
```

### Script
> "If you click on the failed job, you can see detailed logs of which tests failed and why."
>
> "The `playwright-report` artifact contains an HTML report with screenshots and video recordings of the test failures - very helpful for debugging."

---

---

# PART 6: Feature Change & Successful CI/CD (1.5-2 min)

## 6.1 Fix the Broken Test

### Action - Revert Change
```bash
# Option 1: Revert the file
git checkout pages/index.vue

# OR Option 2: Fix the test to match new text
# Edit e2e/home.spec.ts and change expected text:
# FROM: 'Discover premium gaming services'
# TO: 'Browse our gaming services'

# Let's go with Option 1 (revert)
git add pages/index.vue
git commit -m "fix: restore original homepage heading"
git push origin main
```

### Script
> "Now I'm going to fix the issue. I'll revert the heading back to the original text."
>
> *[Show the fix in editor]*
>
> "Committing and pushing the fix to GitHub."

---

## 6.2 Show CI Pipeline Success

### Action - Check GitHub Actions Again
```bash
# Refresh GitHub Actions page
# Show the new successful workflow run
```

### Expected View
**Workflow Status:**
```
✅ Build Docker Image - PASSED ✅
✅ E2E Tests - PASSED ✅
   └─ Homepage tests (4 tests)
      └─ ✅ All tests passed
```

### Script
> "The CI pipeline runs again automatically."
>
> *[Show logs]*
>
> "Docker build passed. And now... E2E tests passed! All 4 homepage tests are green."
>
> "This complete cycle demonstrates:
> 1. **Automated Testing**: We catch issues before they reach production
> 2. **Automated Building**: Docker image is built automatically
> 3. **Gated Merges**: Code can't be merged until all tests pass
> 4. **Developer Feedback**: Developers know immediately if their code works"

---

## 6.3 Application State Verification

### Action - Check Application
```bash
# Refresh the application in browser
# http://localhost:30000
```

### Expected Result
- Homepage displays correctly
- "Discover premium gaming services" heading is visible
- All online user counts show correctly
- Navigation works

### Script
> "On our running application, everything looks perfect. The homepage displays correctly, showing our original heading."
>
> "This demonstrates the complete development workflow:
> - Code change → pushed to GitHub
> - Automated tests run → verify the change works
> - If tests pass → code is ready to merge
> - If tests fail → developer must fix before merging
> - Once merged → can be deployed to production (in real environments, this would be automated too)"

---

## 6.4 Architecture Summary

### Action - Show System Diagram
```bash
# Display the architecture from README
cat README.md | grep -A 30 "Architecture"
```

### Script
> "Let me summarize what we've demonstrated:"
>
> **Infrastructure (K8s):**
> - Multiple app instances for REST API load balancing
> - Multiple Socket.IO instances for real-time scale-out
> - Redis as central message broker
> - NodePort services exposing on ports 30000 (app) and 30001 (socket.io)
>
> **Real-time Communication (Socket.IO):**
> - Redis Adapter enables messages to sync across instances
> - Online user count stored in Redis (not in-memory)
> - Order updates broadcast to all connected clients in real-time
> - Clients on different pods can communicate seamlessly
>
> **Deployment Quality (CI/CD):**
> - GitHub Actions automates Docker builds
> - Playwright E2E tests run on every push
> - Failed tests prevent code merge
> - Successful deployments ready for production
>
> This is a production-ready gaming services marketplace!"

---

---

# Quick Reference Commands

## Kubernetes Troubleshooting

```bash
# View all resources
kubectl get all -n gaming-platform

# View specific pod logs
kubectl logs <pod-name> -n gaming-platform -f

# Describe pod for detailed info
kubectl describe pod <pod-name> -n gaming-platform

# Execute command in pod
kubectl exec -it <pod-name> -n gaming-platform -- /bin/sh

# Check service endpoints
kubectl get endpoints -n gaming-platform
```

## Docker Management

```bash
# Build image locally
docker build \
  --build-arg NUXT_PUBLIC_SOCKET_URL=http://localhost:30001 \
  --build-arg NUXT_PUBLIC_SITE_URL=http://localhost:30000 \
  -t gaming-platform:latest .

# View images
docker images | grep gaming

# Check image details
docker inspect gaming-platform:latest
```

## Redis CLI (in K8s)

```bash
# Connect to Redis pod
kubectl exec -it deployment/gaming-platform-redis -n gaming-platform -- redis-cli

# Common commands
SMEMBERS online_users       # View all online socket IDs
SCARD online_users          # Count online users
HGETALL user_sockets        # View user ID mappings
KEYS *                      # See all Redis keys
FLUSHALL                    # Clear all data (for demo reset)
```

## Testing Locally

```bash
# Run E2E tests headless
npm run test:e2e

# Run E2E tests with browser visible
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- e2e/home.spec.ts

# Generate HTML report
npx playwright show-report
```

---

## Recording Tips

1. **Terminal Font Size**: Increase to at least 14pt for readability
2. **Resolution**: Record at 1920x1080 minimum
3. **Pacing**: Speak slowly and allow time for visuals to register
4. **Demonstrations**: Leave 2-3 seconds pause after each action
5. **Live Coding**: Pre-test all code changes before recording
6. **Audio**: Record in quiet environment with good microphone
7. **Backup**: Record each section separately so you can re-record problem areas

---

## Expected Recording Timeline

| Part       | Duration      | Content                     |
| ---------- | ------------- | --------------------------- |
| Part 1     | 2-2.5 min     | K8s deployment setup        |
| Part 2     | 2.5-3 min     | Socket.IO scale-out demo    |
| Part 3     | 1.5-2 min     | CI/CD Docker build          |
| **Part 4** | **1-1.5 min** | **E2E Test Suite Overview** |
| Part 5     | 2-2.5 min     | E2E test failure demo       |
| Part 6     | 1.5-2 min     | Fix and success demo        |
| **Total**  | **~12 min**   | Complete walkthrough        |

---

**Good luck with your video demo! 🎬**
