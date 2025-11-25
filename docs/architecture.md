Game Services Shop – Architecture Overview (Aligned with PPT)
Tech Stack

Nuxt 3 + Nitro (TypeScript) for unified frontend + REST backend.

MongoDB + Mongoose for persistence (users, games/categories, services, carts, orders).

Pinia for client-side state (auth, cart, catalog caching).

Tailwind CSS for responsive UI.

JWT stored via HTTP-only cookies for authenticated sessions.

Zod for schema validation and shared types.

Roles & Permissions
Role	Capabilities
Guest	Browse games and services. Cannot use cart or place orders.
User	All guest features + manage cart, checkout, and view orders.
Admin/Seller	All user features + manage games (categories), seller item list, create/edit services, update any order.

The authorization middleware checks the JWT from cookies and rejects unauthorized access to /cart, /checkout, /orders, and /admin/*.

Data Model (Matched to PPT’s “Users, Listings, Orders, Categories”)
User {
  username: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

Game {               // represents “categories” from PPT
  slug: string;      // e.g., 'cs2'
  name: string;
  iconUrl: string;
  description: string;
}

Service {            // represents “items” in the Item List Page
  gameId: ObjectId<Game>;
  title: string;
  price: number;
  type: string;      // boosting, coaching, etc.
  description: string;
  imageUrl?: string;
  isActive: boolean;
}

CartItem {
  userId: ObjectId<User>;
  serviceId: ObjectId<Service>;
  quantity: number;
  notes?: string;
  updatedAt: Date;
}

Order {
  userId: ObjectId<User>;
  items: Array<{ serviceId; title; price; quantity }>;  // snapshot
  totalPrice: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  instructions: {       // ≥4-field checkout form
    gameHandle: string;
    region: string;
    scheduleWindow: string;
    notes?: string;
  };
}

REST API Surface (Aligned with PPT)
Auth

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

Categories / Games

GET /api/games – list categories

POST /api/games – admin create

PUT /api/games/:id

DELETE /api/games/:id

Services (“Item List Page”)

GET /api/games/:slug/services – services under a category

GET /api/services/:id – detail

POST /api/services – admin create new item

PUT /api/services/:id

DELETE /api/services/:id

Cart

GET /api/cart

POST /api/cart

PATCH /api/cart/:id

DELETE /api/cart/:id

Orders (“Order Page” in PPT)

POST /api/orders – checkout + ≥4-field form

GET /api/orders – user orders

Admin/Seller features (extended beyond PPT but OK)

GET /api/admin/orders

PATCH /api/admin/orders/:id/status

Frontend Pages (Matched to PPT Slides)

Home (/) – list of game categories (PPT Main Page).

Signup / Login – user authentication.

Game Catalog (/games/[slug]) – Item List Page per PPT.

Service Detail (/services/[id]) – full description + add to cart.

Cart (/cart) – user cart.

Checkout (/checkout) – ≥4-field form.

Orders (/orders) – the PPT “Order Page”.

Admin

/admin/services – matches seller “Item List Page” functionality

/admin/orders – extended capability

Validation & Error Handling

All server routes enforce input validation via Zod.

Consistent error responses with status codes.

Global UI error banners for user feedback.

Deployment

Environment variables: MONGODB_URI, JWT_SECRET.

Docker image for the Nuxt app.

Kubernetes manifests for Nuxt deployment + MongoDB service.