# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (with cache)
RUN npm ci

# Copy source code
COPY . .

# Build Nuxt application
RUN npm run build

# ── Stage 2: Runtime ────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxt -u 1001

# Copy built application from builder
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nuxt

# Start Nuxt server
CMD ["node", "./.output/server/index.mjs"]
