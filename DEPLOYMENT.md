# Gofla — Deployment (Vercel + Render + GitHub)

## Project layout

```
gofla/
├── frontend/     → Deploy to Vercel (Root Directory: frontend)
├── backend/      → Deploy to Render (Root Directory: backend)
├── infra/        → Nginx config for production Docker
├── docker-compose.yml
└── render.yaml   → Render blueprint (optional)
```

## 1. GitHub

Push the whole repo once. Do **not** split into separate repos.

```bash
git add .
git commit -m "Restructure to frontend/backend layout"
git push origin main
```

## 2. Database (Render PostgreSQL)

1. Render Dashboard → **New → PostgreSQL** (or use `render.yaml` blueprint).
2. Copy the **Internal Database URL**.
3. Use it as `DATABASE_URL` on the backend service.

## 3. Backend on Render

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Runtime | Docker (uses `backend/Dockerfile` **production** stage — must be the last stage in the Dockerfile) |
| Health Check | `/health` |

**Required env vars:** `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` (your Vercel URL), `REDIS_URL` (optional), S3/Stripe as needed.

## 4. Frontend on Vercel

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output | `dist` |

**Env var:**

```env
VITE_API_URL=https://your-api.onrender.com
```

Then set on Render:

```env
CORS_ORIGIN=https://your-app.vercel.app
```

## 5. Local development

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up -d postgres redis minio mailhog
cd backend && npm install && npx prisma migrate deploy && npm run prisma:seed
cd ../frontend && npm install

# two terminals:
npm --prefix backend run start:dev
npm --prefix frontend run dev
```

Or full Docker stack:

```bash
docker compose up --build
```

## 6. Production Docker (self-hosted)

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Troubleshooting Render deploy

**Symptom:** Logs show `start:dev`, `nest start --watch`, then `No open ports detected` / exit 1.

**Cause:** Render builds the **last** stage in `backend/Dockerfile`. If `development` is last, it runs the dev server (watch mode) instead of production.

**Fix:** Keep `production` as the **final** stage in `backend/Dockerfile`, push to GitHub, and redeploy.

**Product images on Render:** `backend/uploads/` is not in git. Seed still creates admin/customer users; add S3 or a persistent disk for product images in production.
