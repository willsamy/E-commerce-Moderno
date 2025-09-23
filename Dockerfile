# -----------------------------------------------------------------------------
# Build stage
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies required for prisma engines and sharp (if later needed)
RUN apk add --no-cache openssl libc6-compat python3 make g++ bash

# Copy deps manifests first
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Copy prisma BEFORE install so postinstall/prisma generate can see the schema
COPY prisma ./prisma

# Prefer npm but allow other managers if lockfiles present
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
    else npm i --no-audit --no-fund; fi

# Generate prisma client explicitly (some envs skip postinstall)
RUN npx prisma generate

# App source
COPY . .

# Build Next.js
RUN npm run build

# -----------------------------------------------------------------------------
# Runtime stage
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8180

# Add glibc compatibility
RUN apk add --no-cache openssl libc6-compat bash

# Non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy needed files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Prisma: engines and schema for runtime + migrations/seed
COPY --from=builder /app/prisma ./prisma

# Expose and default command
EXPOSE 8180

USER nextjs

# Migrate + seed + start (will be overridden by docker-compose command if provided)
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm run start"]