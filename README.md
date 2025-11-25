# Game Services Auction Platform (Nuxt 3 + MongoDB Atlas)

Modernized the original cart-based shop into a hybrid **auction + storefront** where legacy catalog/cart/orders still work, but every service is now sold through live bids with “buy it now” fallbacks. The stack is Nuxt 3 + Tailwind on the client, Nitro APIs backed by MongoDB/Mongoose, Zod validation, JWT auth, and Pinia stores that run during SSR.

> **TL;DR** – Auctions render server-side, cart/orders remain intact, and the shared MongoDB Atlas cluster already contains seed data + demo accounts.

## ✅ What’s implemented so far

- **Auction listings per game** – `/games/[slug]` lists live services sorted by bid price with timers, SSR rendering, and ofetch fallbacks to prevent hydration errors.
- **Service detail + bidding UX** – `/services/[id]` shows auction metadata, mock bidding CTA, and “buy now” cart hooks for compatibility with the legacy checkout flow.
- **Cart + Orders compatibility** – Reintroduced `price` on the `Service` serializer/types so cart snapshots, order creation, and badges work without refactoring downstream components.
- **Navigation + layouts** – Header exposes Catalog, Auctions, Orders, Cart, Admin, and Login/Logout buttons with hydration guards to avoid client-only flashes.
- **Seeded Atlas data** – `scripts/seed.mjs` populates 4 games × 5 services each, with one admin and one user account that line up with the UI copy.

## 🧱 Architecture at a glance

| Layer | Notes |
| --- | --- |
| UI | Nuxt 3 pages + layouts, TailwindCSS, Headless UI patterns |
| State | Pinia (`auth`, `catalog`, `cart`) with persisted auth/cart and SSR-safe fetch fallbacks |
| APIs | Nitro server routes under `server/api/*`, Zod validation, JWT middleware |
| Data | MongoDB Atlas (or local Mongo), Mongoose models under `server/schemas` |
| Tooling | Node 22+, npm, Vitest (empty harness today) |

## 🛠 Prerequisites

- **Node.js 22+** (tested on 22.11)
- **npm 10+** (ships with Node)
- **MongoDB** – either the provided Atlas cluster **or** a local MongoDB 6.x instance
- macOS/Linux shell utilities (`bash`, `cp`, `rm`) for the helper scripts

## 🚀 Quick Start (local dev)

```bash
# 1. Install deps (also runs patch-package)
npm install

# 2. Copy env template
cp .env.example .env

# 3. Seed demo data (uses whatever MONGODB_URI points to)
node scripts/seed.mjs

# 4. Start Nuxt in dev mode
npm run dev
```

Visit **http://localhost:3000**. Auctions, catalog, cart, and orders load instantly because their data is already hydrated from the store.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `admin12345` |
| User | `user@example.com` | `user12345` |

## 🌐 Using the shared MongoDB Atlas cluster

The repo ships with an Atlas URI in `.env.example`:

```
MONGODB_URI=mongodb+srv://tc442_db_user:3F4KfldcB7rQBXUl@cse590web.ijcouzi.mongodb.net/
```

To let a teammate use the same cluster:

1. **Copy the env file** – `cp .env.example .env`.
2. **Append a database name** – e.g. `...mongodb.net/game-services?retryWrites=true&w=majority`.
3. **Allow their IP** – add their public IP to the Atlas Network Access list (UI: *Security → Network Access*). Without this, Nuxt will throw “handshake failed” errors during SSR.
4. **Run the seed** – `node scripts/seed.mjs` against Atlas to ensure both of you see identical data/snippets.
5. **Verify connectivity** – `mongosh "$MONGODB_URI" --eval 'db.stats().db'` should print the DB name.

> Atlas best practices: avoid committing `.env`, rotate the shared password periodically, and prefer per-user DB users once teammates move beyond demos.

### Using local Mongo instead

If you prefer a local database:

```bash
brew services start mongodb-community@6.0   # macOS
# or
docker run --name game-shop-mongo -p 27017:27017 -d mongo:6.0

export MONGODB_URI="mongodb://127.0.0.1:27017/game-services"
node scripts/seed.mjs
```

## 🧪 Running and continuing development

| Task | Command |
| --- | --- |
| Start dev server | `npm run dev` |
| Build production bundle | `npm run build` |
| Preview production build | `npm run preview` |
| Run Vitest (passes even with no suites yet) | `npm run test -- --passWithNoTests` |
| Regenerate Nuxt types | `npx nuxi prepare` |
| Seed data again | `node scripts/seed.mjs` |

While developing, keep Nuxt running (`npm run dev`) and edits to pages/stores/APIs will hot-reload.

## 🧹 Troubleshooting the “tons of errors” seen in demos

These are the issues I hit and fixed while building the auction merge:

| Symptom | Fix |
| --- | --- |
| Nuxt overlay spams `fetcher is not a function` during SSR | Both `catalog` and `cart` stores now prefer `useRequestFetch()`. If the error reappears, delete Nuxt caches: `rm -rf .nuxt .output node_modules/.vite && npm run dev`. |
| Vue warns about hydration mismatch in the header | Hydration guards are already in `layouts/default.vue`. Clear browser cache after pulling latest to ensure compiled assets align. |
| Mongo connection fails when teammates run locally | Make sure `.env` has a valid Atlas URI **with** a DB name and that their IP is whitelisted. |
| PostCSS / Tailwind import-meta errors | Ensure `@nuxtjs/tailwindcss@6.12.0` is installed (already pinned). Clearing caches usually resolves stale Vite metadata. |

## 📁 Repo cues for teammates

- `server/api/games/[slug]/services.get.ts` – auction-aware listings sorted by `currentBid`.
- `server/utils/serializers.ts` – bridges `currentBid → price` for cart/order compatibility.
- `stores/catalog.ts` & `stores/cart.ts` – SSR-safe fetch wrappers and state persistence.
- `pages/games/[slug].vue` – auctions per title using Pinia store hydration.
- `pages/services/[id].vue` – detail screen with bidding CTA + buy-now.

## 🧭 Suggested next steps

1. Wire up actual bid mutations + websocket updates.
2. Add Vitest suites for the Pinia stores and server routes.
3. Gate `/cart` and `/orders` behind auth middleware again once UX is finalized.

Happy grinding, and ping me if you need the Atlas IP allowlist updated! 🎮
