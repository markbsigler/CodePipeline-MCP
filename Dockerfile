# syntax=docker/dockerfile:1

# --- Build Stage ---
FROM node:20-alpine3.19 AS build
WORKDIR /usr/src/app
# Copy only package files first for better layer caching
COPY package*.json ./
RUN apk update && apk upgrade && npm ci --omit=dev
# Copy only necessary files for build
COPY src ./src
COPY config ./config
COPY tsconfig*.json ./
COPY .env.example ./
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine3.19 AS prod
WORKDIR /usr/src/app
# Create non-root user
RUN addgroup -g 1001 -S nodegroup && adduser -S nodeuser -u 1001 -G nodegroup && apk update && apk upgrade && apk add --no-cache curl
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/config ./config
COPY --from=build /usr/src/app/.env.example ./
COPY --from=build /usr/src/app/tsconfig*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm prune --omit=dev
USER nodeuser
ENV NODE_ENV=production
ENV NODE_OPTIONS="--enable-source-maps --no-deprecation"
EXPOSE 3000
# Use curl for healthcheck (already installed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 CMD curl -f http://localhost:3000/healthz || exit 1
CMD ["node", "dist/index.js"]
