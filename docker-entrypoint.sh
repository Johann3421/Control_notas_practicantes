#!/bin/sh
set -e

echo "════════════════════════════════════════"
echo "  DevTrack — Docker startup"
echo "════════════════════════════════════════"

# Validation: DATABASE_URL must be set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Aborting."
  exit 1
fi

echo "▶  Applying database schema (prisma db push)..."
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss
echo "✔  Schema applied."

echo "▶  Starting Next.js server on port ${PORT:-3000}..."
exec node server.js
