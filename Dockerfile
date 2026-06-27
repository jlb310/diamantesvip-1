FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .npmrc pnpm-lock.yaml ./
# Genera el cliente Prisma, crea la DB con schema y seed, y builda la app.
RUN mkdir -p prisma/data && \
    pnpm exec prisma generate && \
    DATABASE_URL="file:/app/prisma/data/dev.db" pnpm exec prisma db push --skip-generate && \
    SEED_ON_PRODUCTION=true DATABASE_URL="file:/app/prisma/data/dev.db" node scripts/seed-safe.js && \
    pnpm run build

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
# so even if Dockploy hard-codes "node server.js" our migrations run first
RUN mv server.js server-next.js && mv server-wrapper.js server.js
RUN mkdir -p prisma/data public/uploads public/webp && chown -R nextjs:nodejs prisma/data public/uploads public/webp
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
