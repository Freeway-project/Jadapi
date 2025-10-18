#!/bin/bash

set -e

echo "======================================"
echo "Stopping JadAPI Services"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping services...${NC}"
echo ""

docker compose down

echo ""
echo -e "${GREEN}✓ Services stopped successfully!${NC}"
echo ""
