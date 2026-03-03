# ==============================================================================
# Stage 1 — Install ALL dependencies (dev + prod)
# ==============================================================================
FROM node:22-alpine AS all-deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ==============================================================================
# Stage 2 — Install PRODUCTION-ONLY dependencies
# ==============================================================================
FROM node:22-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ==============================================================================
# Stage 3 — Build (generate Prisma client + Next.js build)
# ==============================================================================
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=all-deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client (outputs to src/generated/prisma)
RUN npx prisma generate

# Build Next.js in standalone mode
RUN npm run build

# ==============================================================================
# Stage 4 — Production runner (minimal image)
# ==============================================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Least-privilege user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# ── Next.js standalone output ──────────────────────────────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# ── Prisma: generated client (dynamic require from src/generated/prisma) ──
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# ── Prisma: schema + config needed for `prisma db push` at startup ─────────
COPY --from=builder /app/prisma          ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# ── Copy production node modules from prod-deps (ensure paths exist)
# Simpler and more robust than copying individual package subpaths which
# may not exist in every npm install (avoids "not found" errors).
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Make prisma CLI runnable
RUN ln -s /app/node_modules/prisma/build/index.js /usr/local/bin/prisma \
 && chmod +x /usr/local/bin/prisma || true

# ── Startup script ─────────────────────────────────────────────────────────
COPY docker-entrypoint.sh ./
# Fix CRLF line endings (in case repo was edited on Windows) and make executable
RUN sed -i 's/\r//' ./docker-entrypoint.sh \
 && chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
