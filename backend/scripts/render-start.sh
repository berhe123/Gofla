#!/bin/sh
set -e

echo "==> Applying database schema..."
npx prisma db push --skip-generate

echo "==> Bootstrapping admin users..."
node prisma/seed-bootstrap.js

echo "==> Syncing product catalog from bundled images..."
node prisma/catalog-bootstrap.js

echo "==> Starting API on port ${PORT:-3000}..."
if [ -f dist/main.js ]; then
  exec node dist/main.js
elif [ -f dist/src/main.js ]; then
  exec node dist/src/main.js
else
  echo "ERROR: Nest build output not found under dist/"
  ls -la dist/ 2>/dev/null || true
  exit 1
fi
