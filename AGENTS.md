# AppleVault — AI Agent Guide

> This file documents the architecture, conventions, and workflows for the **AppleVault** e-commerce platform. AppleVault is a full-stack multi-vendor marketplace specializing in Apple products (iPhones, iPads, AirPods, and accessories).

---

## Project Overview

AppleVault is a monorepo containing two independently runnable applications:

- **`Backend/`** — REST API built with Node.js, Express, and Prisma ORM.
- **`Frontend/`** — Single-page application (SPA) built with Vue 3, TypeScript, and Vite.

The backend exposes authentication and product-management endpoints backed by a PostgreSQL database. The frontend currently renders a polished storefront using **static mock data** (`src/data/products.ts`) and is **not yet wired to the backend API**.

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| Runtime | Node.js (ES Modules) |
| Backend Framework | Express 5 |
| ORM / Database | Prisma 7 + PostgreSQL (via `@prisma/adapter-pg`) |
| Validation | Zod |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Rate Limiting | `express-rate-limit` |
| Frontend Framework | Vue 3.5 (Composition API, `<script setup>`) |
| Build Tool | Vite 8 |
| Language | TypeScript (frontend only) |
| Styling | Tailwind CSS 3 |
| State Management | Pinia 3 (installed, not yet used) |
| Routing | Vue Router 5 |
| HTTP Client | Axios (installed, not yet used for API calls) |

---

## Directory Structure

```
.
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Prisma migration files
│   │   └── config.js           # Prisma CLI configuration (hardcodes DB URL)
│   ├── src/
│   │   ├── server.js           # Entry point — starts HTTP server
│   │   ├── app.js              # Express app setup (middleware + route mounting)
│   │   ├── config/db.js        # PrismaClient init with pg adapter
│   │   ├── controllers/        # Route handlers (auth, product)
│   │   ├── middleware/         # authMiddleware, role middleware
│   │   ├── routes/             # Express router definitions
│   │   └── utils/jwt.js        # JWT signing utility
│   ├── .env                    # Secrets (DATABASE_URL, JWT_SECRET, PORT)
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── main.ts             # Vue app bootstrap
│   │   ├── App.vue             # Root layout (NavBar + router-view + Footer)
│   │   ├── router/index.ts     # Route definitions
│   │   ├── style.css           # Tailwind directives + global styles
│   │   ├── vite-env.d.ts       # Vite ambient types
│   │   ├── views/              # Page components (Home, Search, ProductDetail, Cart)
│   │   ├── components/         # Reusable UI components
│   │   └── data/products.ts    # Static product catalog (mock data)
│   ├── index.html              # HTML template (loads Google Fonts + Material Symbols)
│   ├── tailwind.config.js      # Custom design system tokens
│   └── package.json
├── Docs/                       # Empty documentation folder
├── package.json                # Root manifest (contains zod + express-rate-limit deps)
└── AGENTS.md                   # This file
```

---

## Build and Run Commands

### Backend

```bash
cd Backend
npm install

# Development (nodemon auto-reload)
npm run dev

# Production
npm start

# Database
npm run db:generate   # Regenerate Prisma Client
npm run db:migrate    # Run migrations in dev mode
npm run db:studio     # Open Prisma Studio GUI
npm run db:seed       # Run seed script (currently no seed.js exists)
```

- Default port: `3000` (overridable via `PORT` env var).
- Requires `DATABASE_URL` and `JWT_SECRET` in `Backend/.env`.

### Frontend

```bash
cd Frontend
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

- Default Vite dev server port: `5173`.
- The build output lands in `Frontend/dist/`.

---

## Code Organization & Architecture

### Backend

The backend follows a layered MVC-like pattern:

1. **Entry (`server.js`)** — Loads environment variables via `dotenv/config`, imports the Express app, and calls `app.listen()`.
2. **App (`app.js`)** — Configures global middleware (`cors()`, `express.json()`), mounts routes at `/api/auth` and `/api/products`, and exports the app instance.
3. **Routes** — Define HTTP method + path combinations and attach middleware (rate limiters, auth, role checks) before controller functions.
4. **Controllers** — Handle request validation (Zod), business logic, database queries via Prisma, and HTTP responses.
5. **Middleware**
   - `authMiddleware` — Verifies `Authorization: Bearer <token>` header using `JWT_SECRET`.
   - `authorizeRoles(...roles)` — Checks `req.user.role` against allowed roles.
6. **Database (`config/db.js`)** — Creates a `PrismaClient` instance using the `@prisma/adapter-pg` driver. Logs queries in development.

### Frontend

The frontend is a standard Vue 3 SPA:

1. **Entry (`main.ts`)** — Creates the Vue app, imports global CSS, mounts to `#app`, and installs the router.
2. **Routing (`router/index.ts`)** — Uses `createWebHistory`. Routes: `/`, `/search`, `/product/:id`, `/cart`. `scrollBehavior` resets scroll to top on navigation.
3. **Views** — Top-level page components consumed by `<router-view>`.
4. **Components** — Reusable UI pieces (NavBar, AppFooter, HeroSection, ProductCard, etc.).
5. **Static Data (`data/products.ts`)** — Hardcoded catalog of 8 Apple products. The frontend searches, filters, and renders products entirely from this file.

> **Important:** There is currently **no API integration** on the frontend. All product data, cart state, and search logic are local. Axios and Pinia are installed but unused.

---

## Database Schema

PostgreSQL schema managed by Prisma. Key models:

- **`User`** — `id`, `email` (unique), `password`, `name`, `role` (CUSTOMER / SELLER / ADMIN).
- **`Category`** — Product categories.
- **`Product`** — `name`, `description`, `price` (Decimal), `stock`, `imageUrl`, linked to `Category` and `User` (seller).
- **`Order`** — Split buyer/seller design (`userId` = buyer, `sellerId` = seller). Status enum: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED.
- **`OrderItem`** — Line items within an order.
- **`Review`** — User reviews on products.
- **`CartItem`** — Shopping cart entries with `@@unique([userId, productId])`.
- **`StorefrontConfig`** — Key/value JSON config for dynamic frontend content (e.g., hero banners, featured product IDs).

Migrations live in `Backend/prisma/migrations/`.

---

## Code Style Guidelines

### Backend

- **ES Modules** are mandatory (`"type": "module"`). Always include the `.js` extension in relative imports (e.g., `import app from "./app.js"`).
- Use `try / catch` blocks in every async controller. Return structured JSON responses:
  ```json
  { "success": false, "error": "...", "details": [...] }
  ```
- Validate incoming payloads with **Zod** (`safeParse`) before touching the database.
- Use `console.error("[Context]:", err)` for server-side logging.
- HTTP status codes:
  - `400` — Validation failure
  - `401` — Unauthorized / bad credentials
  - `403` — Forbidden (insufficient role or not resource owner)
  - `404` — Resource not found
  - `409` — Conflict (e.g., duplicate email)
  - `500` — Internal server error

### Frontend

- **Vue 3 Composition API** with `<script setup>` is the standard.
- Use **TypeScript** for `.ts` files and type definitions.
- Tailwind CSS classes are written utility-first. Custom design tokens are defined in `tailwind.config.js` (colors like `warm-stone`, `charcoal`; shadows like `shadow-card`; radii like `rounded-pill`).
- Google Material Symbols are used for icons (loaded via CDN in `index.html`). Custom font families: **Inter** (body/display) and **Space Grotesk** (labels).
- Global styles are minimal; component-scoped styles are preferred when needed.

---

## Testing Instructions

> **Currently there are no automated tests in this project.** Neither the Backend nor the Frontend contains test files, test runners (Jest, Vitest, Playwright), or test scripts in `package.json`.

If you add tests, follow the existing language conventions:
- Backend: use a Node.js test runner or Jest with ES module support.
- Frontend: Vitest is the natural choice alongside the Vite toolchain.

---

## Security Considerations

1. **Environment Variables** — `Backend/.env` holds `DATABASE_URL` and `JWT_SECRET`. It is gitignored. Never commit it.
2. **Password Hashing** — Uses `bcrypt` with a cost factor of `12`.
3. **Input Validation** — Zod schemas enforce email format, password complexity (≥8 chars, uppercase, lowercase, number, special char), and presence checks.
4. **Rate Limiting** — Auth endpoints are rate-limited:
   - Login: `5` attempts per `15` minutes.
   - Register: `10` attempts per `1` hour.
5. **Anti-Enumeration** — Login returns a generic `"Invalid credentials"` message to prevent email discovery.
6. **Data Sanitization** — The `password` field is explicitly stripped from user objects before serialization in auth responses.
7. **Authorization** — Product mutations check ownership (`sellerId === req.user.userId`) or `ADMIN` role.
8. **JWT Expiry** — Tokens expire after `7` days.

---

## Deployment Notes

- The backend expects a PostgreSQL database accessible via `DATABASE_URL`.
- `prisma.config.js` currently hardcodes a connection string. For production, ensure `DATABASE_URL` is injected via environment variables and `prisma.config.js` is updated or removed in favor of standard Prisma environment resolution.
- The frontend is a static SPA. Build with `npm run build` and serve the `dist/` folder with any static file server.
- The root `package.json` contains `express-rate-limit` and `zod`. These dependencies should ideally be moved entirely into `Backend/package.json` to keep the root manifest clean.
