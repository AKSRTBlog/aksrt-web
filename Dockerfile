# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Ensure container build does not inherit host-only proxy values.
ENV HTTP_PROXY=
ENV HTTPS_PROXY=
ENV http_proxy=
ENV https_proxy=
ENV npm_config_proxy=
ENV npm_config_https_proxy=

COPY package.json package-lock.json* ./

# Include optional native deps used by Nuxt toolchain.
RUN npm config delete proxy || true && \
    npm config delete https-proxy || true && \
    HTTP_PROXY= HTTPS_PROXY= ALL_PROXY= NO_PROXY= \
    http_proxy= https_proxy= all_proxy= no_proxy= \
    npm_config_proxy= npm_config_https_proxy= npm_config_noproxy= \
    npm ci --include=optional --no-audit --no-fund --proxy="" --https-proxy=""

COPY . .

RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxt -u 1001

COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

USER nuxt

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "./.output/server/index.mjs"]
