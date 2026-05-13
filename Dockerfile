# -------- Builder --------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y python3 make g++ openssl && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Generate Prisma client and copy real files (works with pnpm)
RUN npx prisma generate && \
    mkdir -p /tmp/prisma-client && \
    cp -rL $(find node_modules -type d -name "@prisma" -print -quit) /tmp/prisma-client/@prisma && \
    (find node_modules -type d -name ".prisma" -print -quit | xargs -r cp -rL -t /tmp/prisma-client/.prisma) || true

COPY . .
COPY .env.local .env.local

ENV NEXT_TURBO=0
ENV NEXT_IGNORE_TYPECHECK=1

RUN pnpm run build

# -------- Runner --------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone server, static files, public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN rm -rf ./node_modules/@prisma

# Copy Prisma client (real files, not symlinks)
COPY --from=builder /tmp/prisma-client/@prisma ./node_modules/@prisma

# Copy Prisma schema and config for runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs && \
    chown -R nextjs:nodejs /app

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]