# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the web app
WORKDIR /app/apps/web
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS runner

# Install pnpm
RUN npm install -g pnpm@10.4.1

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages

# Copy web package.json
COPY apps/web/package.json ./apps/web/
COPY apps/web/next.config.mjs ./apps/web/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod --filter web

# Copy built files from builder
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set working directory to web
WORKDIR /app/apps/web

# Expose port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js
CMD ["pnpm", "start"]
