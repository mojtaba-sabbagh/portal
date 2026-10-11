# -------- Builder --------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Pin the package manager. `npm install -g pnpm` without a version now installs
# pnpm 11/12, which ignores the package.json "pnpm" field, has to be told about
# every approved dependency build script (otherwise the install fails with
# ERR_PNPM_IGNORED_BUILDS) and re-verifies the whole lockfile against
# supply-chain policies on every install. 10.34.6 matches pnpm-lock.yaml v9.
ARG PNPM_VERSION=10.34.6

RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update -o Acquire::Retries=5 \
    && apt-get install -y --no-install-recommends python3 make g++ openssl -o Acquire::Retries=5 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# The store lives in a cache mount so a failed/slow download is reused by the
# next build instead of being downloaded again.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    npm install -g pnpm@${PNPM_VERSION} && pnpm install --frozen-lockfile

# Generate the Prisma client. It is written into the pnpm virtual store
# (node_modules/.pnpm/@prisma+client@.../node_modules/.prisma), which Next's
# output tracing copies into .next/standalone together with the pnpm symlinks.
RUN pnpm exec prisma generate

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

# NOTE: node_modules/@prisma is left exactly as Next traced it (a folder of pnpm
# symlinks into node_modules/.pnpm). Replacing it with dereferenced copies breaks
# the generated client, because @prisma/client resolves the sibling paths
# .prisma/client and @prisma/client-runtime-utils that only exist inside the pnpm
# virtual store (otherwise: Cannot find module '.prisma/client/default').

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