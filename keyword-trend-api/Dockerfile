# Multi-stage Dockerfile for production build
# Note: This is run from repo root, so we need to cd into keyword-trend-api

FROM node:20-alpine AS builder
WORKDIR /app
COPY keyword-trend-api/package*.json ./
RUN npm ci
COPY keyword-trend-api/. .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/package.json ./dist/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
USER appuser
EXPOSE 3001
CMD ["node", "dist/index.js"]
