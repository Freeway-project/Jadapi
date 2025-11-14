# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Accept Firebase public config as build args
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=""

# Set them as environment variables so the generator script can read them
ENV NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
ENV NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}

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
