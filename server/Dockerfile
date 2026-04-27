# Multi-stage build for Node.js Express server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files (workspace)
COPY package.json package-lock.json ./
COPY shared/ ./shared/

# Copy server package files
COPY server/package.json server/tsconfig.json server/prisma.config.ts ./
COPY server/prisma ./prisma/

# Install dependencies
RUN npm ci --workspaces --include=shared --include=server

# Copy server source
COPY server/ ./

# Generate Prisma client
RUN npx prisma generate

# Build shared package first
RUN cd /app/shared && npm run build

# Build server
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/shared/ ./shared/
COPY --from=builder /app/server/package.json ./

# Install production dependencies only
RUN npm ci --omit=dev --workspaces --include=shared --include=server

# Copy built files
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
