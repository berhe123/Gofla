FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
RUN npm run build

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

# Production — keep this as the FINAL stage for Render and other hosts that build the default target.
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
RUN mkdir -p /app/uploads/products
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && node dist/main.js"]
