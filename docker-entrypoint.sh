#!/bin/sh
set -e

echo "[entrypoint] Syncing database schema with prisma db push..."
node /app/prisma-cli/node_modules/.bin/prisma db push --schema=/app/prisma/schema.prisma --accept-data-loss --skip-generate

echo "[entrypoint] Checking if seed is needed..."
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(n => { console.log(n); p.\$disconnect(); }).catch(() => { console.log(0); p.\$disconnect(); });
")

if [ "$USER_COUNT" = "0" ]; then
  echo "[entrypoint] No users found, running seed..."
  node /app/prisma/seed.js
else
  echo "[entrypoint] Users exist ($USER_COUNT), skipping seed."
fi

echo "[entrypoint] Starting Next.js..."
exec node server.js
