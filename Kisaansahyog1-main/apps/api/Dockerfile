# Multi-stage Dockerfile for KisaanSahyog API
# Build context: repository root

# 1. Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root manifest and workspace configuration
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/skills/package.json ./packages/skills/
COPY apps/api/package.json ./apps/api/

# Install dependencies across workspaces
RUN npm ci

# Copy source trees
COPY packages/shared ./packages/shared
COPY packages/skills ./packages/skills
COPY apps/api ./apps/api

# Build shared library and API
RUN npm run build:shared
RUN npm run build:api

# 2. Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy root package files
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install production dependencies only
RUN npm ci --omit=dev

# Non-root user for security
USER node

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["npm", "run", "start:api"]
