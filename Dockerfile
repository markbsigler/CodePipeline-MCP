# syntax=docker/dockerfile:1

# --- Build Stage ---
FROM node:20-alpine3.19 AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk update && apk upgrade && npm ci --omit=dev
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine3.19 AS prod
WORKDIR /usr/src/app
# Create non-root user
RUN addgroup -g 1001 -S nodegroup && adduser -S nodeuser -u 1001 -G nodegroup && apk update && apk upgrade && apk add --no-cache curl
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/config ./config
RUN npm ci --omit=dev --ignore-scripts
USER nodeuser
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1
CMD ["node", "dist/index.js"]
