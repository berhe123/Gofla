FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
RUN npm run build
RUN test -f dist/main.js || test -f dist/src/main.js
RUN npx tsc prisma/seed-bootstrap.ts prisma/catalog-bootstrap.ts \
  --module commonjs \
  --target ES2021 \
  --esModuleInterop \
  --skipLibCheck \
  --outDir prisma

# Local docker-compose dev target (must NOT be the final stage — Render builds the last stage).
FROM node:20-alpine AS development
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && npm run prisma:seed && npm run start:dev"]

# Production — keep this as the FINAL stage for Render and other hosts.
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/uploads/products ./uploads/products
COPY --from=builder /app/scripts/render-start.sh ./scripts/render-start.sh
RUN chmod +x ./scripts/render-start.sh && mkdir -p /app/uploads/products
EXPOSE 3000
CMD ["./scripts/render-start.sh"]
