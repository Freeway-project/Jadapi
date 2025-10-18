#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy.sh [branch]
BRANCH=${1:-main}
APP_DIR=$(cd "$(dirname "$0")" && pwd)
ENV_FILE="$APP_DIR/.env.production"
ECOSYSTEM="$APP_DIR/ecosystem.config.js"

echo "Deploying branch: $BRANCH"
cd "$APP_DIR"

# Stop and remove existing PM2 app if it exists
if pm2 describe jadapi-server > /dev/null 2>&1; then
  echo "Stopping existing pm2 process"
  pm2 stop jadapi-server || true
  pm2 delete jadapi-server || true
fi

# Pull latest changes
if [ -d .git ]; then
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

# Install dependencies
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# Build
if npm run | grep -q "build"; then
  npm run build
fi

# Ensure .env.production exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Warning: $ENV_FILE not found. Create it from .env.production.example"
fi

# Start with PM2 using the ecosystem file
pm2 start "$ECOSYSTEM" --env production
pm2 save

echo "Deploy complete. PM2 status:"
pm2 list --no-daemon || true
