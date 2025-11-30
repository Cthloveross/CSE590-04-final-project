# GameBoost - CS2 Services Marketplace (Nuxt 3 + MongoDB Atlas)

A **CS2 game services marketplace** with **CI/CD pipeline** where authenticated users can browse listings, bid on auctions, and purchase boosting/coaching services. Sellers can create and manage their own listings. Built with Nuxt 3 + Tailwind on the client, Nitro APIs backed by MongoDB/Mongoose, Zod validation, JWT auth with **OAuth (Google & GitHub)**, and Pinia stores that run during SSR.

> **TL;DR** – Full-featured marketplace with OAuth login, role-based access control (buyer/seller/admin), shopping cart, auction system, and automated CI/CD with GitHub Actions.

## ✅ Features Implemented

### Authentication & Authorization
- **OAuth Login** – Sign in with Google or GitHub (+ traditional email/password)
- **Role-Based Access Control (RBAC)** – Three user roles: `user` (buyer), `seller`, `admin`
- **JWT stored in httpOnly cookies** – Secure session management
- **Protected routes** – Cart, checkout, orders require authentication; admin/seller pages require elevated roles

### Core Marketplace Features
- **Auction listings per game** – `/games/[slug]` lists live services sorted by bid price with timers
- **Service detail + bidding UX** – `/services/[id]` shows auction metadata and "buy now" cart options
- **Shopping Cart** – Add services, adjust quantities, proceed to checkout
- **Order Management** – Place orders with game credentials, track order status
- **Seller Dashboard** – Create/edit/delete service listings (sellers & admins only)

### Real-Time Features (Socket.IO)
- **Live Order Status Updates** – Instant notifications when order status changes
- **New Service Alerts** – Real-time notifications for new services
- **Online Users Counter** – See how many users are currently online
- **Stock Updates** – Real-time inventory changes across all clients
- **System Notifications** – In-app notification system with history
- **Connection Status** – Visual indicator showing WebSocket connection state

### CI/CD Pipeline
- **GitHub Actions Workflow** – Automated build, test, and deployment
- **Docker Containerization** – Multi-stage Dockerfile for optimized production builds
- **Automated Testing** – Unit tests (Vitest) and E2E tests (Playwright)
- **Container Registry** – Automatic image push to GitHub Container Registry (ghcr.io)
- **Deployment Ready** – Optional SSH deployment to staging/production servers

### UI/UX
- **Responsive Nuxt UI** with Tailwind CSS
- **Modern dark theme** with gaming aesthetic
- **User profile dropdown** with avatar, role badge, and OAuth provider indication
- **Real-time cart badge** showing item count
- **Socket.IO status indicator** with live notifications panel

## 🧱 Architecture

| Layer     | Notes                                                                         |
| --------- | ----------------------------------------------------------------------------- |
| UI        | Nuxt 3 pages + layouts, TailwindCSS, modern gaming aesthetic                  |
| State     | Pinia (`auth`, `catalog`, `cart`) with persisted auth/cart and SSR-safe fetch |
| APIs      | Nitro server routes under `server/api/*`, Zod validation, JWT middleware      |
| Auth      | nuxt-auth-utils for OAuth, custom JWT for sessions                            |
| Data      | MongoDB Atlas (cloud database), Mongoose models                               |
| Real-Time | Socket.IO for bidirectional event-based communication                         |
| Tooling   | Node 22+, npm, Vitest                                                         |

## 🛠 Prerequisites

- **Node.js 22+** (tested on 22.11)
- **npm 10+** (ships with Node)
- **MongoDB Atlas** – Cloud database (free M0 cluster available)
- **OAuth Apps** – Google Cloud Console + GitHub OAuth app (for OAuth login)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Cthloveross/CSE590-04-final-project.git
cd CSE590-04-final-project

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (for E2E tests)
npx playwright install

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and OAuth credentials

# 5. Set up MongoDB Atlas (REQUIRED)
# - Visit https://cloud.mongodb.com/
# - Navigate to Network Access → Add IP Address
# - Add your current IP or allow from anywhere (0.0.0.0/0) for development
# - Wait 1-2 minutes for the change to take effect

# 6. Seed the database
node scripts/seed.mjs

# 7. Start development server
npm run dev
```

Visit **http://localhost:3000**

### Demo Accounts

| Role  | Email               | Password     |
| ----- | ------------------- | ------------ |
| Admin | `admin@example.com` | `admin12345` |
| User  | `user@example.com`  | `user12345`  |

## 🔐 OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env`:
   ```
   NUXT_OAUTH_GOOGLE_CLIENT_ID=your-client-id
   NUXT_OAUTH_GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github` (development)
   - `https://your-domain.com/api/auth/callback/github` (production)
4. Copy Client ID and Client Secret to `.env`:
   ```
   NUXT_OAUTH_GITHUB_CLIENT_ID=your-client-id
   NUXT_OAUTH_GITHUB_CLIENT_SECRET=your-client-secret
   ```

### Session Password

Generate a secure session password (at least 32 characters) for cookie encryption:
```
NUXT_SESSION_PASSWORD=your-super-secret-session-password-at-least-32-chars
```

## 🌐 MongoDB Setup

### ⚠️ Important: This Project Uses MongoDB Atlas ONLY

This project is configured to use **MongoDB Atlas** (cloud database) exclusively. Local MongoDB is not supported.

### Setup Steps

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a Cluster**
   - Create a free M0 cluster (sufficient for development)
   - Choose your preferred cloud provider and region

3. **Configure Network Access** (CRITICAL)
   - Navigate to **Network Access** in the left sidebar
   - Click **Add IP Address**
   - Choose one of:
     - **Add Current IP Address** (recommended for security)
     - **Allow Access from Anywhere** (`0.0.0.0/0` - convenient for development)
   - Click **Confirm**
   - ⏱️ Wait 1-2 minutes for changes to take effect

4. **Create Database User**
   - Navigate to **Database Access**
   - Click **Add New Database User**
   - Create a user with **Read and Write** permissions
   - Save the username and password

5. **Get Connection String**
   - Go back to **Database** view
   - Click **Connect** on your cluster
   - Choose **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `game-services`

6. **Update `.env` File**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/game-services?retryWrites=true&w=majority
   ```

7. **Seed the Database**
   ```bash
   node scripts/seed.mjs
   ```

### ✅ Expected Output
```
🌱 Starting database seed...
✅ Connected to MongoDB Atlas
✅ Database cleared
✅ Created 2 games
✅ Created 2 users
✅ Created 3 services
✅ Database seeded successfully!
```

### ❌ Common Issues

| Error                              | Solution                                      |
| ---------------------------------- | --------------------------------------------- |
| "Could not connect to any servers" | Add your IP to Atlas Network Access whitelist |
| "Authentication failed"            | Check username/password in connection string  |
| "Database name not specified"      | Ensure `/game-services` is in the URI         |
| Connection timeout                 | Wait 1-2 minutes after adding IP to whitelist |

## 📋 REST API Endpoints

### Auth
- `POST /auth/register` – Register new user
- `POST /auth/login` – Login with email/password
- `POST /auth/logout` – Logout
- `GET /auth/me` – Get current user profile
- `GET /auth/google` – Google OAuth
- `GET /auth/github` – GitHub OAuth

### Listings
- `GET /api/services` – List all services
- `GET /api/services/:id` – Get service by ID
- `POST /api/services` – Create service (seller/admin)
- `PUT /api/services/:id` – Update service (seller/admin)
- `DELETE /api/services/:id` – Delete service (seller/admin)
- `POST /api/services/:id/bid` – Place bid on service

### Cart
- `GET /api/cart` – Get cart items
- `POST /api/cart` – Add item to cart
- `PATCH /api/cart/:itemId` – Update cart item
- `DELETE /api/cart/:itemId` – Remove cart item

### Orders
- `GET /api/orders` – List user's orders
- `POST /api/orders` – Create order from cart
- `GET /api/orders/:id` – Get order details

### Games/Categories
- `GET /api/games` – List all games
- `GET /api/games/:slug/services` – List services for game

## 🧪 Development Commands

| Task                    | Command                 |
| ----------------------- | ----------------------- |
| Start dev server        | `npm run dev`           |
| Build production        | `npm run build`         |
| Preview production      | `npm run preview`       |
| Run unit tests          | `npm run test`          |
| Run E2E tests           | `npm run test:e2e`      |
| Run E2E tests (UI mode) | `npm run test:e2e:ui`   |
| Regenerate types        | `npx nuxi prepare`      |
| Seed database           | `node scripts/seed.mjs` |

## 🧪 E2E Testing

This project includes a comprehensive E2E test suite using **Playwright**, covering all major user flows across multiple browsers.

### Test Structure

| Test File            | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `home.spec.ts`       | Home page display, hero section, feature highlights          |
| `auth.spec.ts`       | Login page, OAuth buttons, form validation, protected routes |
| `catalog.spec.ts`    | Game listings, CS2 page, service details                     |
| `cart.spec.ts`       | Cart authentication requirement                              |
| `checkout.spec.ts`   | Checkout authentication requirement                          |
| `orders.spec.ts`     | Orders authentication requirement                            |
| `navigation.spec.ts` | Header navigation, login link visibility                     |
| `api.spec.ts`        | REST API endpoint testing (games, services, auth)            |
| `socket.spec.ts`     | Socket.IO server health check (local + K8s ports)            |
| `happy-path.spec.ts` | Complete user journey: login → browse → cart → checkout      |

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/happy-path.spec.ts

# Run tests with verbose output
npx playwright test --reporter=list
```

### Browser Coverage

Tests run across **5 browser configurations**:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)
- Mobile Chrome (Android)
- Mobile Safari (iOS)

### Happy Path Test

The `happy-path.spec.ts` tests the complete user journey:

1. **Start unauthenticated** → Visit home page
2. **Login** → Authenticate with demo credentials
3. **Browse catalog** → Navigate to CS2 services
4. **View service** → Click on service details
5. **Add to cart** → Add service to shopping cart
6. **Go to cart** → Review cart contents
7. **Checkout** → Proceed to checkout page

### Socket.IO Testing

Socket tests automatically detect the server on:
- Local development: `localhost:3001`
- Kubernetes NodePort: `localhost:30001`

### Test Results

```
145 passed (17s)
- 10 test files
- 29 unique tests
- 5 browser configurations
```

## 🐳 Docker Commands

| Task                    | Command                                    |
| ----------------------- | ------------------------------------------ |
| Build Docker image      | `docker build -t gaming-platform:latest .` |
| Run with Docker Compose | `docker-compose up -d`                     |
| Stop Docker Compose     | `docker-compose down`                      |
| Rebuild and restart     | `docker-compose up --build -d`             |
| View logs               | `docker-compose logs -f app`               |

**Note**: Docker Compose uses MongoDB Atlas from your `.env` file. Ensure:
- `.env` file exists with valid `MONGODB_URI`
- Your IP is whitelisted in MongoDB Atlas
- All OAuth credentials are set

## ☸️ Kubernetes Deployment

This project supports deployment to Kubernetes. See [k8s/README.md](k8s/README.md) for detailed instructions.

### Quick Start (Docker Desktop Kubernetes)

```bash
# 1. Enable Kubernetes in Docker Desktop
# Docker Desktop → Settings → Kubernetes → Enable Kubernetes

# 2. Build Docker image with Socket.IO URL
docker build \
  --build-arg NUXT_PUBLIC_SOCKET_URL=http://localhost:30001 \
  --build-arg NUXT_PUBLIC_SITE_URL=http://localhost:30000 \
  -t gaming-platform:latest .

# 3. Update secrets (edit k8s/secrets.yaml with your credentials)

# 4. Deploy to Kubernetes
kubectl apply -k k8s/

# 5. Check deployment status
kubectl get all -n gaming-platform
```

### Access the Application

| Service          | URL                    |
| ---------------- | ---------------------- |
| Application      | http://localhost:30000 |
| Socket.IO Server | http://localhost:30001 |

### Useful Kubernetes Commands

```bash
# View pod logs
kubectl logs -f deployment/gaming-platform-app -n gaming-platform

# Scale deployment
kubectl scale deployment gaming-platform-app --replicas=3 -n gaming-platform

# Restart deployment
kubectl rollout restart deployment/gaming-platform-app -n gaming-platform

# Delete all resources
kubectl delete -k k8s/
```

## 🚀 CI/CD Pipeline

This project includes a complete GitHub Actions CI/CD pipeline:

### Pipeline Stages

1. **Build** – Builds Docker image and pushes to GitHub Container Registry
2. **Test (Unit)** – Runs Vitest unit tests
3. **Test (E2E)** – Runs Playwright end-to-end tests across multiple browsers
4. **Deploy** – Optional SSH deployment to staging/production (requires server configuration)

### Triggering the Pipeline

The pipeline automatically runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### GitHub Actions Setup

The workflow is defined in `.github/workflows/ci-cd.yml`. No additional setup required for build and test stages.

For deployment (optional):
1. Go to repository **Settings → Secrets and variables → Actions**
2. Add the following secrets:
   - `SSH_PRIVATE_KEY` – SSH private key for deployment
   - `STAGING_SERVER` – Staging server hostname
   - `STAGING_USER` – SSH user for staging
   - `PRODUCTION_SERVER` – Production server hostname
   - `PRODUCTION_USER` – SSH user for production

### Docker Registry

Built images are automatically pushed to:
```
ghcr.io/cthloveross/cse590-04-final-project:latest
ghcr.io/cthloveross/cse590-04-final-project:main
```

To pull and run:
```bash
docker pull ghcr.io/cthloveross/cse590-04-final-project:latest
docker run -p 3000:3000 --env-file .env ghcr.io/cthloveross/cse590-04-final-project:latest
```

### CI/CD Documentation

For detailed CI/CD setup and demo instructions, see:
- **[CI_CD_SETUP.md](CI_CD_SETUP.md)** – Complete setup guide
- **[DEMO_GUIDE.md](DEMO_GUIDE.md)** – Step-by-step demo instructions

## 📁 Project Structure

```
├── pages/                 # Nuxt pages
│   ├── login.vue         # OAuth + email login
│   ├── cart.vue          # Shopping cart
│   ├── checkout.vue      # Checkout form (4+ fields)
│   ├── orders.vue        # Order history
│   ├── games/[slug].vue  # Game auctions
│   ├── services/[id].vue # Service detail + bidding
│   └── admin/            # Admin/seller pages
├── server/
│   ├── api/              # REST API routes
│   ├── routes/auth/      # OAuth callback handlers
│   ├── models/           # Mongoose models
│   ├── schemas/          # Zod validation schemas
│   └── utils/            # Auth, DB, serializers
├── stores/               # Pinia stores (auth, cart, catalog)
├── layouts/              # App layout with nav
├── components/           # Vue components
└── types/                # TypeScript interfaces
```

## 🎮 User Roles & Permissions

| Feature             | User (Buyer) | Seller | Admin |
| ------------------- | :----------: | :----: | :---: |
| Browse catalog      |      ✅       |   ✅    |   ✅   |
| View auctions       |      ✅       |   ✅    |   ✅   |
| Place bids          |      ✅       |   ✅    |   ✅   |
| Add to cart         |      ✅       |   ✅    |   ✅   |
| Place orders        |      ✅       |   ✅    |   ✅   |
| View own orders     |      ✅       |   ✅    |   ✅   |
| Create listings     |      ❌       |   ✅    |   ✅   |
| Manage listings     |      ❌       |   ✅    |   ✅   |
| View all orders     |      ❌       |   ❌    |   ✅   |
| Manage order status |      ❌       |   ❌    |   ✅   |

## 🧹 Troubleshooting

| Symptom                         | Fix                                                                                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MongoDB connection fails**    | 1. Check Atlas IP whitelist<br>2. Verify credentials in `.env`<br>3. Wait 1-2 minutes after adding IP<br>4. Ensure database name is `game-services` |
| **OAuth redirect error**        | Ensure redirect URIs match exactly in OAuth provider settings                                                                                       |
| **`fetcher is not a function`** | Clear caches: `rm -rf .nuxt .output node_modules/.vite && npm install && npm run dev`                                                               |
| **Hydration mismatch**          | Clear browser cache, restart dev server                                                                                                             |
| **Docker build fails**          | Ensure `.env` file exists and `MONGODB_URI` is set                                                                                                  |
| **E2E tests fail**              | Run `npx playwright install` to install browser dependencies                                                                                        |
| **Session password error**      | Ensure `NUXT_SESSION_PASSWORD` is at least 32 characters                                                                                            |

### MongoDB Atlas Specific Issues

```bash
# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
"
```

### Getting Help

1. Check MongoDB Atlas connection: https://cloud.mongodb.com/
2. Review CI/CD logs: https://github.com/Cthloveross/CSE590-04-final-project/actions
3. See detailed setup: [CI_CD_SETUP.md](CI_CD_SETUP.md)

## 📝 Course Requirements Met

- ✅ **Responsive Nuxt UI** (Tailwind) + Nuxt server + MongoDB
- ✅ **Non-login form with 4+ fields** (Checkout form: game handle, region, schedule, notes)
- ✅ **Scale-out REST API** (stateless endpoints, ready for replica-scale)
- ✅ **Multiple authenticated users** (buyer/seller/admin roles)
- ✅ **OAuth/OIDC** (Google + GitHub login)
- ✅ **Role-based access control** (different features per role)
- ✅ **CI/CD Pipeline** (GitHub Actions with Docker build, automated testing, and deployment)
- ✅ **Containerization** (Docker + Docker Compose for local and production deployment)
- ✅ **Automated Testing** (Unit tests with Vitest, E2E tests with Playwright)
- ✅ **Socket.IO Integration** (Real-time bidirectional communication, live updates, notifications)

## 📊 Project Statistics

- **Lines of Code**: ~5,000+
- **API Endpoints**: 20+
- **Database Models**: 6 (User, Game, Service, Order, CartItem, Bid)
- **Test Coverage**: Unit + E2E tests
- **CI/CD Stages**: Build → Test → Deploy
- **Supported Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari

## 🔒 Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcrypt
- OAuth 2.0 integration (Google + GitHub)
- Role-based access control (RBAC)
- Input validation with Zod schemas
- MongoDB injection protection
- CORS configuration
- Environment variable security

## 📚 Additional Documentation

- **[k8s/README.md](k8s/README.md)** – Complete Kubernetes deployment guide
- **[CI_CD_SETUP.md](CI_CD_SETUP.md)** – Complete CI/CD setup and configuration guide
- **[DEMO_GUIDE.md](DEMO_GUIDE.md)** – Step-by-step instructions for CI/CD demos
- **[docs/architecture.md](docs/architecture.md)** – System architecture documentation

Happy boosting! 🎮
