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
| Storefront (web) | http://localhost:5180 |
| API | http://localhost:3000 |
| API docs (Swagger) | http://localhost:3000/docs |
| Mailhog (emails) | http://localhost:8025 |
| MinIO console | http://localhost:9001 |

The API container automatically runs migrations and seeds the database on first boot.

### Option B — Local dev (npm)

Prerequisites: **Node 20+**, Postgres + Redis (or `docker compose up -d postgres redis minio mailhog`).

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

cd backend && npm install && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed
cd ../frontend && npm install

# Run both (two terminals):
npm --prefix backend run start:dev   # http://localhost:3000
npm --prefix frontend run dev        # http://localhost:5173
```

---

## Seeding with your own product images

Place your images in `backend/uploads/products/<category>/` (e.g. `shoes/shoes-1.jpg`).
The seeder creates **one product per image file** and serves them from `/uploads/products/...`.
Product names follow the file: `shoes-3.jpg` → **Shoes 3**.

**Sync catalog after adding or changing images:**

```bash
npm --prefix backend run catalog:sync
```

**Before deploying to Render** (images are bundled in the Docker image), compress them for web:

```bash
npm --prefix backend install
npm --prefix backend run catalog:optimize
git add backend/uploads/products
git commit -m "Add catalog product images"
```

Optional: set `SEED_IMAGES_PATH` to import from an external folder on first seed:

```
<SEED_IMAGES_PATH>/
├── shoes/      ├── bags/     ├── wallets/
├── jacket/     ├── belt/     └── keys/
```

The seeder maps `jacket → jackets` and `belt → belts`, copies into `backend/uploads/products/`, then links each file to one product. Re-run seed anytime with `npm --prefix backend run prisma:seed`.

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
├── frontend/     # React + Vite storefront (deploy → Vercel)
├── backend/      # NestJS API + Prisma (deploy → Render)
├── infra/nginx/  # Reverse proxy config (prod Docker)
├── docker-compose.yml
├── docker-compose.prod.yml
├── render.yaml   # Render blueprint
└── docs: ARCHITECTURE.md · DEPLOYMENT.md · API.md
```

## Scripts

| Command | Description |
|---|---|
| `npm --prefix backend run start:dev` | API in watch mode |
| `npm --prefix frontend run dev` | Web dev server |
| `npm run db:migrate` | Prisma migrate (backend) |
| `npm run db:seed` | Seed database |
| `docker compose up --build` | Full local stack |
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
