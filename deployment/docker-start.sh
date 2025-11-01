#!/bin/bash
set -e

echo "======================================"
echo "  Starting JadDPI Services"
echo "======================================"
echo ""

# Move to project root
cd "$(dirname "$0")/.."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found!"
    echo "   Please copy .env.example to .env and configure it:"
    echo "   cp .env.example .env"
    echo ""
    exit 1
fi

echo "🚀 Starting Docker Compose services..."
echo ""

docker compose up -d

echo ""
echo "======================================"
echo "✓ Services started successfully!"
echo "======================================"
echo ""
echo "Access your application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  API:      http://localhost/api (with nginx)"
echo ""
echo "View logs:"
echo "  docker compose logs -f"
echo ""
echo "Check status:"
echo "  docker compose ps"
echo ""
