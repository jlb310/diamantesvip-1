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
# DB y secret de build: el sitemap.ts prerendera consultando Prisma, y auth.ts
# requiere AUTH_SECRET en production mode. Los valores reales vienen del env
# de Dokploy en runtime; estos solo permiten que el build complete.
ENV DATABASE_URL="file:/app/prisma/data/dev.db"
ENV AUTH_SECRET="build-time-placeholder-not-used-at-runtime"
# `prisma generate` (cliente para TS/Next) + `db push` (crea la DB SQLite vacia
# necesaria para prerenderar /sitemap.xml y /robots.txt). El seed se deja al
# runtime (server-wrapper.js ya lo corre en startup): el seed tardaba ~3s y
# duplicaba trabajo; el db push solo ~200ms.
RUN mkdir -p prisma/data && \
    npx prisma generate && \
    npx prisma db push --skip-generate && \
    npm run build --no-lint

# bust cache so mv wrapper always runs: v4
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV DATABASE_URL=file:./prisma/data/dev.db
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma/data/dev.db ./prisma/data/dev.db
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img
COPY --from=builder /app/scripts/seed-safe.js ./scripts/seed-safe.js
COPY server-wrapper.js ./server-wrapper.js
# Rename original server.js → server-next.js, put wrapper as server.js
# so even if Dokploy hard-codes "node server.js" our migrations run first
RUN mv server.js server-next.js && mv server-wrapper.js server.js
RUN mkdir -p prisma/data public/uploads public/webp && chown -R nextjs:nodejs prisma/data public/uploads public/webp
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]