# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
# Cache de npm via BuildKit: si package-lock no cambia, este step es casi
# instantaneo (tarda solo en contar el cache hit).
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DB y secret de build: placeholders para que el build complete. El sitemap es
# force-dynamic (ya no consulta la DB en build) y auth.ts requiere AUTH_SECRET
# en production mode. Los valores reales vienen del env en runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV AUTH_SECRET="build-time-placeholder-not-used-at-runtime"
# `prisma generate` (cliente para TS/Next). El schema se aplica en runtime
# (server-wrapper.js corre db push en el arranque contra el Postgres real).
RUN npx prisma generate && \
    npm run build --no-lint

# bust cache so mv wrapper always runs: v4
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
# Fallback si el env de despliegue no trae DATABASE_URL (la URL real de
# Postgres viene de docker-compose/Dokploy). Con file: el sitio sigue
# funcionando con la SQLite del volumen, como antes.
ENV DATABASE_URL=file:./prisma/data/dev.db
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img
COPY --from=builder /app/scripts/seed-safe.js ./scripts/seed-safe.js
COPY --from=builder /app/scripts/ensure-test-accounts.js ./scripts/ensure-test-accounts.js
COPY --from=builder /app/scripts/migrate-sqlite-to-postgres.js ./scripts/migrate-sqlite-to-postgres.js
COPY server-wrapper.js ./server-wrapper.js
# Rename original server.js → server-next.js, put wrapper as server.js
# so even if Dokploy hard-codes "node server.js" our migrations run first
RUN mv server.js server-next.js && mv server-wrapper.js server.js
RUN mkdir -p prisma/data public/uploads public/webp && chown -R nextjs:nodejs prisma/data public/uploads public/webp
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]