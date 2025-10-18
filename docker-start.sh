#!/bin/bash

set -e

echo "======================================"
echo "Starting JadAPI Services"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "${YELLOW}Please copy .env.example to .env and configure it${NC}"
    exit 1
fi

# Start services
echo -e "${YELLOW}Starting services...${NC}"
echo ""

docker compose up -d

echo ""
echo -e "${GREEN}======================================"
echo "✓ Services started successfully!"
echo "======================================${NC}"
echo ""
echo "Services:"
echo "  - Frontend:  http://localhost"
echo "  - Backend:   http://localhost/api"
echo "  - Health:    http://localhost/health"
echo ""
echo "Commands:"
echo "  View logs:     docker compose logs -f"
echo "  Stop services: docker compose down"
echo "  Restart:       docker compose restart"
echo ""
