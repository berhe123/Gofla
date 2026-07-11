# Gofla 🛍️

> Snap. Match. Shop smarter.

Gofla is a modern, production-grade e-commerce platform for shoes, bags, wallets, jackets, belts, keys and more — with a signature discovery experience, **Gofla Studio** (visual search + complete-the-look bundles + live drops).

- **Frontend:** React + TypeScript + Vite, Feature-Sliced Design, Tailwind + shadcn-style UI, TanStack Query, React Router, Zustand, Framer Motion.
- **Backend:** NestJS modular monolith, Prisma + PostgreSQL, JWT auth + RBAC, Swagger/OpenAPI, Stripe payments, Redis-ready.
- **Infra:** Docker Compose (Postgres+pgvector, Redis, MinIO, Mailhog), Nginx, CI-ready.

---

## Quick start

### Option A — Docker (everything, one command)

```bash
cp .env.example .env
docker compose up --build
```

Then open:

| Service | URL |
|---|---|
| Storefront (web) | http://localhost:5173 |
| API | http://localhost:3000 |
| API docs (Swagger) | http://localhost:3000/docs |
| Mailhog (emails) | http://localhost:8025 |
| MinIO console | http://localhost:9001 |

The API container automatically runs migrations and seeds the database on first boot.

### Option B — Local dev (pnpm)

Prerequisites: **Node 20+**, **pnpm 9+**, and Postgres + Redis running (use `docker compose up -d postgres redis minio mailhog` for the infra only).

```bash
cp .env.example .env
pnpm install

# Database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Run both apps
pnpm dev
# or individually:
pnpm dev:api   # http://localhost:3000
pnpm dev:web   # http://localhost:5173
```

---

## Seeding with your own product images

Place your images in category subfolders and point `SEED_IMAGES_PATH` at the parent folder
(already set in `.env.example`):

```
<SEED_IMAGES_PATH>/
├── shoes/      ├── bags/     ├── wallets/
├── jacket/     ├── belt/     └── keys/
```

The seeder maps `jacket → jackets` and `belt → belts` automatically, copies the images into
`apps/api/uploads/products/<category>/`, and generates realistic products, variants, tags and
discounts. If the path is missing, it falls back to high-quality placeholder images so the app
always looks great.

Re-run anytime with `pnpm db:seed`.

---

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gofla.com` | `Admin123!` |
| Customer | `customer@gofla.com` | `Customer123!` |

Admin dashboard: http://localhost:5173/admin

---

## Commerce defaults

Currency **USD** · Shipping **flat $5, free over $60** · Tax **10%** · Returns **30 days** ·
Reviews **require moderation**. All configurable via `.env`.

## Payments

Stripe is used in **test mode**. If `STRIPE_SECRET_KEY` is not a real test key, Gofla falls back to a
**mock payment** that auto-confirms the order — so checkout works end-to-end out of the box. Add real
test keys to enable the full Stripe flow + webhook (`/api/v1/payments/webhook`).

---

## Project structure

```
gofla/
├── apps/
│   ├── api/      # NestJS modular monolith (see ARCHITECTURE.md)
│   └── web/      # React app, Feature-Sliced Design
├── packages/
│   └── shared/   # Shared TypeScript contracts (type-only)
├── infra/nginx/  # Reverse proxy config (prod)
├── docker-compose.yml / docker-compose.prod.yml
└── docs: ARCHITECTURE.md · DEPLOYMENT.md · API.md
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run web + api in watch mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all unit tests |
| `pnpm typecheck` | Type-check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm db:migrate` / `db:seed` / `db:generate` | Prisma helpers |

## Testing

- **API:** `pnpm --filter @gofla/api test` (Jest unit) · `test:e2e` (supertest)
- **Web:** `pnpm --filter @gofla/web test` (Vitest) · `e2e` (Playwright)

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design, modules, data model
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment guide
- [API.md](./API.md) — REST API reference (live Swagger at `/docs`)

## License

MIT
