# Gofla — Architecture

## Overview

Gofla is a **modular monolith** backend (NestJS) paired with a **Feature-Sliced Design** frontend
(React), connected over a versioned REST API. The design keeps clear domain boundaries so the
monolith can be split into services later without rewrites.

```
┌─────────────┐    HTTPS/JSON     ┌──────────────────────┐
│  React SPA  │ ───────────────►  │  NestJS REST API     │
│  (Vite/FSD) │ ◄───────────────  │  /api/v1 + /docs     │
└─────────────┘                   └─────────┬────────────┘
                                            │
              ┌──────────────┬──────────────┼───────────────┬───────────────┐
              ▼              ▼               ▼               ▼               ▼
        PostgreSQL       Redis          MinIO/S3          SMTP          Stripe
        (+pgvector)   (cache/queue)   (product imgs)    (Mailhog)     (payments)
```

## Backend — modular monolith

Each domain lives under `backend/src/modules/<domain>` and follows a layered structure:

```
modules/product/
├── api/             # controllers + DTOs (HTTP boundary, Swagger)
├── application/     # use-cases / services (orchestration)
├── domain/          # entities, value objects, rules (where needed)
└── infrastructure/  # Prisma repositories / external adapters
```

> For pragmatic modules the service + Prisma access are co-located; richer domains (product, order)
> separate mapping/validation. The `product.mapper.ts` centralizes DTO mapping and price logic.

### Modules

| Module | Responsibility |
|---|---|
| `auth` | Register/login/refresh/logout, JWT issuance + rotation, password reset |
| `user` | Profile + address book |
| `category` | Category tree + CRUD |
| `product` | Catalog: list/filter/sort/search, detail, related, admin CRUD |
| `cart` | Cart + items, live pricing (shipping/tax/totals) |
| `wishlist` | Saved products |
| `order` | Checkout, stock reservation, Stripe payment, history, tracking |
| `review` | Reviews + ratings, moderation, rating recompute |
| `notification` | In-app notifications + email side-effects |
| `studio` | **Gofla Studio**: visual search, complete-the-look, live drops |
| `admin` | Dashboard analytics + management endpoints (RBAC) |

### Cross-cutting (`src/common`, `src/infra`)

- **Guards:** global `JwtAuthGuard` (with `@Public()` opt-out) + `RolesGuard` (`@Roles()`).
- **Filters:** `AllExceptionsFilter` → consistent error envelope (+ Prisma error mapping).
- **Interceptors:** `TransformInterceptor` → `{ success, data }` response envelope.
- **Validation:** global `ValidationPipe` (whitelist + transform) with class-validator DTOs.
- **Infra services:** `PrismaService`, `MailerService`, `StorageService` (local disk, S3-ready).
- **Security:** Helmet, CORS allow-list, throttling, argon2 password hashing, refresh-token rotation.

## Data model

Core entities (see `backend/prisma/schema.prisma`):

`User`–`Address`–`Order`–`OrderItem`–`Payment`, `Cart`–`CartItem`, `WishlistItem`,
`Category` (self-relation tree) – `Product` – `ProductImage` / `ProductVariant` / `Discount` /
`ProductTag`–`Tag`, `Review`, `Notification`, `RefreshToken`.

Prices use `Decimal(10,2)`. Stock lives on variants. Product `rating`/`reviewCount` are cached and
recomputed on review approval.

## Gofla Studio (the differentiator)

- **Visual search** (`POST /search/visual`): accepts an image + optional color/category, ranks
  in-stock products by a transparent heuristic (rating + featured + color affinity). The contract is
  embedding-ready: Phase 2 swaps the ranker for pgvector image embeddings with no frontend change.
- **Complete the Look** (`GET /products/:id/complete-the-look`): builds a complementary bundle from a
  category-affinity graph, preferring matching colors, with a 10% bundle discount.
- **Live Drops** (`GET /studio/live-drops`): time-boxed discounted collection with countdown.

## Frontend — Feature-Sliced Design

```
src/
├── app/       # providers, router, theme, global styles
├── pages/     # route screens (home, catalog, product, cart, checkout, admin, …)
├── widgets/   # composite UI (header, footer, layouts, home + product sections)
├── features/  # user interactions (auth, wishlist, visual-search, review, admin, theme)
├── entities/  # business entities (product, category, cart, order, user) + their UI/api
└── shared/    # ui kit, api client, lib, config
```

- **Server state:** TanStack Query (with a response-envelope `unwrap` helper).
- **Client state:** Zustand (auth session, theme), persisted.
- **Auth:** access token + auto-refresh interceptor with refresh-token rotation.
- **Design system:** HSL CSS variables → Tailwind tokens; dark (default) + light themes.

## Conventions

- Strict TypeScript across the monorepo.
- Shared DTO types live in `frontend/src/shared/types` (type-only contracts for the web app).
- API is URI-versioned (`/api/v1`). Errors and responses use consistent envelopes.
