#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   JadAPI Server Build & Restart${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the server directory."
    exit 1
fi

print_info "Current directory: $(pwd)"
echo ""

# Step 1: Clean old build
print_info "Cleaning old build..."
rm -rf dist
print_status "Old build cleaned"
echo ""

# Step 2: Install dependencies
print_info "Installing dependencies..."
pnpm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_status "Dependencies installed"
echo ""

# Step 3: Build TypeScript
print_info "Building TypeScript..."
pnpm run build
if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi
print_status "Build completed successfully"
echo ""

# Step 4: Check if dist directory exists
if [ ! -d "dist" ]; then
    print_error "Build directory (dist/) not found"
    exit 1
fi
print_status "Build directory verified"
echo ""

# Step 5: Stop PM2 process
# print_info "Stopping PM2 process..."
# pm2 stop jadapi-server 2>/dev/null || print_info "No existing PM2 process found"
# print_status "PM2 process stopped"
# echo ""

# Step 6: Start PM2 process
print_info "Starting PM2 process..."
pm2 restart-all
# if [ $? -ne 0 ]; then
#     print_error "Failed to start PM2 process"
#     exit 1
# fi
print_status "PM2 process started"
echo ""

# Step 7: Save PM2 configuration
print_info "Saving PM2 configuration..."
pm2 save
print_status "PM2 configuration saved"
echo ""

# Step 8: Show PM2 status
print_info "Current PM2 status:"
pm2 list
echo ""

# Step 9: Show logs
print_info "Recent logs:"
pm2 logs jadapi-server --lines 20 --nostream
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Server restarted successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Useful commands:"
echo -e "  ${BLUE}pm2 logs jadapi-server${NC}        - View logs"
echo -e "  ${BLUE}pm2 monit${NC}                      - Monitor all processes"
echo -e "  ${BLUE}pm2 restart jadapi-server${NC}     - Restart server"
echo -e "  ${BLUE}pm2 stop jadapi-server${NC}        - Stop server"
echo ""
