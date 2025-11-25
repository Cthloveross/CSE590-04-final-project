# 🚀 Quick Start Guide

## Prerequisites
- MongoDB Atlas connection string (already in your `.env`)
- Node.js 20.x installed

## Start the Application (3 steps)

### 1. Seed the Database
```bash
node scripts/seed.mjs
```

This creates:
- **Admin:** `admin@example.com` / `admin123`
- **User:** `user@example.com` / `user123`
- **4 Games:** CS2, Valorant, LoL, Apex Legends
- **20 Services:** Boosting, coaching, placements for each game

### 2. Start Dev Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 3. Login and Test

#### As a regular user:
1. Go to http://localhost:3000
2. Login with: `user@example.com` / `user123`
3. Browse games → Click a service → Add to cart
4. Go to cart → Checkout
5. View your orders at `/orders`

#### As an admin:
1. Go to http://localhost:3000
2. Login with: `admin@example.com` / `admin123`
3. Manage services at `/admin/services`
   - Create/edit/delete services
   - Filter by game or type
4. Manage orders at `/admin/orders`
   - Update order statuses
   - View customer details

## Key URLs

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Home page (game catalog) |
| http://localhost:3000/register | Register new account |
| http://localhost:3000/login | Login |
| http://localhost:3000/cart | Shopping cart |
| http://localhost:3000/checkout | Checkout form |
| http://localhost:3000/orders | Order history (user) |
| http://localhost:3000/admin/services | Service management (admin) |
| http://localhost:3000/admin/orders | Order management (admin) |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Nuxt 3 App                        │
├─────────────────────────────────────────────────────┤
│  Frontend (Vue 3 + Tailwind CSS)                    │
│  ├─ Pages: /, /register, /login, /cart, etc.       │
│  ├─ Stores (Pinia): auth, catalog, cart            │
│  └─ Middleware: auth.ts, admin.ts                   │
├─────────────────────────────────────────────────────┤
│  Backend (Nitro Server)                             │
│  ├─ REST APIs: /api/auth/*, /api/games/*,          │
│  │              /api/services/*, /api/cart/*,       │
│  │              /api/orders/*, /api/admin/*         │
│  └─ Models (Mongoose): User, Game, Service,         │
│                         CartItem, Order             │
├─────────────────────────────────────────────────────┤
│  Database: MongoDB Atlas                            │
│  └─ Collections: users, games, services,            │
│                   cartitems, orders                 │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend:** Nuxt 3, Vue 3, Tailwind CSS, Pinia, Heroicons
- **Backend:** Nitro (built into Nuxt), Zod validation
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (HTTP-only cookies), bcryptjs
- **Build:** Vite 7, TypeScript

## Fixed Issues

✅ **PostCSS "import.meta" error** - Downgraded @nuxtjs/tailwindcss to 6.12.0  
✅ **Mongoose ESM imports** - Changed from named imports to default import  
✅ **Duplicate index warning** - Removed redundant `gameSchema.index({ slug: 1 })`  
✅ **MongoDB Atlas connection** - Using connection string from `.env`

## Next Steps

- Test all user flows (browse → cart → checkout → orders)
- Test admin flows (CRUD services, manage order statuses)
- Add payment integration (optional)
- Write tests with Vitest (optional)
- Deploy to production (optional)
