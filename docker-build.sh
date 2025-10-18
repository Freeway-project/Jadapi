#!/bin/bash

set -e

echo "======================================"
echo "Building JadAPI Docker Images"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "${YELLOW}Please copy .env.example to .env and configure it${NC}"
    echo "  cp .env.example .env"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found .env file"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker Compose is installed"

# Build images
echo ""
echo -e "${YELLOW}Building Docker images...${NC}"
echo ""

docker compose build --no-cache

echo ""
echo -e "${GREEN}======================================"
echo "✓ Docker images built successfully!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Review your .env file"
echo "  2. Start services: ./docker-start.sh"
echo "  3. Or use: docker compose up -d"
echo ""
