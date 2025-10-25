#!/bin/bash
set -e
echo "Starting JadDPI Services..."
cd ..
docker compose up -d
echo "✓ Services started!"
echo "  Frontend: http://localhost"
echo "  Backend:  http://localhost/api"
