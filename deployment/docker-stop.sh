#!/bin/bash
set -e
echo "Stopping JadDPI Services..."
cd ..
docker compose down
echo "✓ Services stopped!"
