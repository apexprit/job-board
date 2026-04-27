# Multi-stage build for React + Vite client
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY client/package.json ./client/

# Install dependencies
RUN npm ci --workspaces --include=client

# Copy client source
COPY client/ ./client/

# Build client
RUN cd /app/client && npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS runner

# Copy built files to nginx
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copy nginx config
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
