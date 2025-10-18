#!/bin/bash
set -e
echo "Stopping JadAPI Services..."
cd ..
docker compose down
echo "✓ Services stopped!"
