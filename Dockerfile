
# syntax=docker/dockerfile:1

FROM node:18-alpine3.19
ARG CACHEBUST=1

WORKDIR /usr/src/app
RUN addgroup -g 1001 -S nodegroup \
    && adduser -S nodeuser -u 1001 -G nodegroup \
    && apk update && apk upgrade && apk add --no-cache curl \
    && npm install -g npm@latest && npm --version

# Copy all necessary files
COPY package.json package-lock.json ./
COPY src ./src
COPY config ./config
COPY tsconfig*.json ./
COPY .env.example .env

# Install dependencies and build
RUN npm ci --ignore-scripts \
    && npm run build \
    && npm ci --omit=dev --ignore-scripts && npm prune --omit=dev \
    # Ensure logs directory exists and is owned by nodeuser after all COPYs
    && mkdir -p /usr/src/app/logs \
    && chown -R nodeuser:nodegroup /usr/src/app/logs

USER nodeuser
ENV NODE_ENV=production
ENV NODE_OPTIONS="--enable-source-maps --no-deprecation"
EXPOSE 3000
# Use curl for healthcheck (already installed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 CMD curl -f http://localhost:3000/healthz || exit 1
CMD ["node", "dist/index.js"]
