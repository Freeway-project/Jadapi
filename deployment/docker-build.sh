#!/bin/bash
set -e
echo "Building JadAPI Docker Images..."
cd ..
docker compose build --no-cache
echo "✓ Docker images built successfully!"
