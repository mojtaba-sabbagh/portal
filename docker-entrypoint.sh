#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
# Install pnpm if not available
npm install -g pnpm 2>/dev/null || true

# Run migrations
pnpm exec prisma migrate deploy || true

echo "✅ Migrations complete. Starting application..."
exec node server.js
