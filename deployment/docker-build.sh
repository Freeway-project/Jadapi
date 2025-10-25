#!/bin/bash
set -e
echo "Building JadDPI Docker Images..."
cd ..
docker compose build --no-cache
echo "✓ Docker images built successfully!"
