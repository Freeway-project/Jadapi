#!/usr/bin/env bash
set -euo pipefail

# Configuration
CONTAINER_NAME="jadapi-server"
IMAGE_NAME="jadapi-server"
ENV_FILE="/etc/jadapi/.env.production"
UPLOADS_VOLUME="jadapi-uploads"
PORT=3001

# Ensure we have the latest image
echo "📥 Pulling latest image..."
docker pull "$IMAGE_NAME:latest"

# Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop "$CONTAINER_NAME" || true
docker rm "$CONTAINER_NAME" || true

# Start new container
echo "🚀 Starting new container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "$PORT:$PORT" \
  --env-file "$ENV_FILE" \
  -v "$UPLOADS_VOLUME:/app/uploads" \
  "$IMAGE_NAME:latest"

# Wait for health check
echo "🏥 Waiting for health check..."
timeout 30s bash -c \
  'until $(curl --output /dev/null --silent --fail http://localhost:'"$PORT"'/health); do
    printf "."
    sleep 2
  done' || {
    echo "❌ Health check failed!"
    docker logs "$CONTAINER_NAME"
    exit 1
  }

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo "✅ Deployment completed successfully!"