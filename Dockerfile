# -------- Builder --------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Install system dependencies with retry + cached apt directories
RUN --mount=type=cache,target=/var/cache/apt \
     --mount=type=cache,target=/var/lib/apt \
     apt-get update -o Acquire::Retries=5 \
     && apt-get install -y --no-install-recommends \
         python3 \
         make \
         g++ \
         openssl \
         -o Acquire::Retries=5 \
     && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy project and environment
COPY . .
COPY .env.local .env.local

# Load environment variables and disable features
RUN set -a && . ./.env.local && set +a
ENV NEXT_TURBO=0
ENV NEXT_IGNORE_TYPECHECK=1

# Build Next.js
RUN npm run build

# -------- Runner --------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone server
COPY --from=builder /app/.next/standalone ./

# Copy Next static files
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs \
    && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]