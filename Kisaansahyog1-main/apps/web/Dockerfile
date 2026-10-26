# Multi-stage Dockerfile for KisaanSahyog Web PWA
# Build context: repository root

# 1. Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments for frontend environment injection
ARG VITE_API_URL=""
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy root manifest and workspace configuration
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/skills/package.json ./packages/skills/
COPY apps/web/package.json ./apps/web/

# Install dependencies across workspaces
RUN npm ci

# Copy source trees
COPY packages/shared ./packages/shared
COPY packages/skills ./packages/skills
COPY apps/web ./apps/web

# Build shared library, agronomic skills, and web PWA
RUN npm run build:shared
RUN npm run build -w @kisaansahyog/skills
RUN npm run build:web

# 2. Production Stage (Nginx Alpine)
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built PWA from builder stage
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
