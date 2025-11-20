#!/bin/bash
set -e
echo "Stopping Jaddpi Services..."
cd ..
docker compose down
echo "✓ Services stopped!"
