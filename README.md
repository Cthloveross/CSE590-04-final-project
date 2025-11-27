# GameBoost - CS2 Services Marketplace (Nuxt 3 + MongoDB Atlas)

A **CS2 game services marketplace** where authenticated users can browse listings, bid on auctions, and purchase boosting/coaching services. Sellers can create and manage their own listings. Built with Nuxt 3 + Tailwind on the client, Nitro APIs backed by MongoDB/Mongoose, Zod validation, JWT auth with **OAuth (Google & GitHub)**, and Pinia stores that run during SSR.

> **TL;DR** – Full-featured marketplace with OAuth login, role-based access control (buyer/seller/admin), shopping cart, and auction system.

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

### UI/UX
- **Responsive Nuxt UI** with Tailwind CSS
- **Modern dark theme** with gaming aesthetic
- **User profile dropdown** with avatar, role badge, and OAuth provider indication
- **Real-time cart badge** showing item count

## 🧱 Architecture

| Layer | Notes |
| --- | --- |
| UI | Nuxt 3 pages + layouts, TailwindCSS, modern gaming aesthetic |
| State | Pinia (`auth`, `catalog`, `cart`) with persisted auth/cart and SSR-safe fetch |
| APIs | Nitro server routes under `server/api/*`, Zod validation, JWT middleware |
| Auth | nuxt-auth-utils for OAuth, custom JWT for sessions |
| Data | MongoDB Atlas (or local Mongo), Mongoose models |
| Tooling | Node 22+, npm, Vitest |

## 🛠 Prerequisites

- **Node.js 22+** (tested on 22.11)
- **npm 10+** (ships with Node)
- **MongoDB** – Atlas cluster or local MongoDB 6.x
- **OAuth Apps** – Google Cloud Console + GitHub OAuth app (for OAuth login)

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and configure
cp .env.example .env

# 3. Configure OAuth (see OAuth Setup below)
# Edit .env with your OAuth credentials

# 4. Seed demo data
node scripts/seed.mjs

# 5. Start dev server
npm run dev
```

Visit **http://localhost:3000**

### Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `admin12345` |
| User | `user@example.com` | `user12345` |

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

## 🌐 MongoDB Atlas Setup

The repo ships with an Atlas URI in `.env.example`. To use:

1. **Copy the env file** – `cp .env.example .env`
2. **Append a database name** – e.g. `...mongodb.net/game-services?retryWrites=true&w=majority`
3. **Whitelist your IP** – In Atlas: *Security → Network Access*
4. **Run the seed** – `node scripts/seed.mjs`

### Using Local MongoDB

```bash
# macOS
brew services start mongodb-community@6.0

# Docker
docker run --name game-shop-mongo -p 27017:27017 -d mongo:6.0

# Set env
export MONGODB_URI="mongodb://127.0.0.1:27017/game-services"
node scripts/seed.mjs
```

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

| Task | Command |
| --- | --- |
| Start dev server | `npm run dev` |
| Build production | `npm run build` |
| Preview production | `npm run preview` |
| Run tests | `npm run test` |
| Regenerate types | `npx nuxi prepare` |
| Seed database | `node scripts/seed.mjs` |

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

| Feature | User (Buyer) | Seller | Admin |
| --- | :---: | :---: | :---: |
| Browse catalog | ✅ | ✅ | ✅ |
| View auctions | ✅ | ✅ | ✅ |
| Place bids | ✅ | ✅ | ✅ |
| Add to cart | ✅ | ✅ | ✅ |
| Place orders | ✅ | ✅ | ✅ |
| View own orders | ✅ | ✅ | ✅ |
| Create listings | ❌ | ✅ | ✅ |
| Manage listings | ❌ | ✅ | ✅ |
| View all orders | ❌ | ❌ | ✅ |
| Manage order status | ❌ | ❌ | ✅ |

## 🧹 Troubleshooting

| Symptom | Fix |
| --- | --- |
| OAuth redirect error | Ensure redirect URIs match exactly in OAuth provider settings |
| `fetcher is not a function` | Clear caches: `rm -rf .nuxt .output node_modules/.vite && npm run dev` |
| Hydration mismatch | Clear browser cache after pulling updates |
| Mongo connection fails | Check `.env` has valid URI and your IP is whitelisted |

## 📝 Course Requirements Met

- ✅ **Responsive Nuxt UI** (Tailwind) + Nuxt server + MongoDB
- ✅ **Non-login form with 4+ fields** (Checkout form: game handle, region, schedule, notes)
- ✅ **Scale-out REST API** (stateless endpoints, ready for replica-scale)
- ✅ **Multiple authenticated users** (buyer/seller/admin roles)
- ✅ **OAuth/OIDC** (Google + GitHub login)
- ✅ **Role-based access control** (different features per role)

Happy boosting! 🎮
# Demo commit
