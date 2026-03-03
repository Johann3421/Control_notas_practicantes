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
# Use the prisma CLI without unsupported flags. Prefer the installed binary
# (symlinked to /usr/local/bin/prisma during image build) so it works in
# the minimal runner image. Accept data-loss explicitly for CI/deploy flows.
prisma db push --accept-data-loss
echo "✔  Schema applied."

echo "▶  Starting Next.js server on port ${PORT:-3000}..."
exec node server.js
