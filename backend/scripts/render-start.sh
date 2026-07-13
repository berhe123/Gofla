#!/bin/sh
set -e

echo "==> Applying database schema..."
npx prisma db push --skip-generate

echo "==> Bootstrapping admin users..."
node prisma/seed-bootstrap.js

echo "==> Starting API on port ${PORT:-3000}..."
exec node dist/main.js
