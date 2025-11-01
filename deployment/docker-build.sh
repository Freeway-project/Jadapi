#!/bin/bash
set -e

echo "======================================"
echo "  Building JadDPI Docker Images"
echo "======================================"
echo ""

# Move to project root
cd "$(dirname "$0")/.."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "   Please copy .env.example to .env and configure it:"
    echo "   cp .env.example .env"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Building Docker images with --no-cache..."
echo ""

docker compose build --no-cache

echo ""
echo "======================================"
echo "✓ Docker images built successfully!"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Ensure .env is configured properly"
echo "  2. Start services: ./deployment/docker-start.sh"
echo ""
