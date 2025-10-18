#!/bin/bash

# Jadapi Server Deployment Script
# This script pulls latest code from main branch and deploys using PM2

set -e  # Exit on any error

echo "🚀 Starting Jadapi Server Deployment..."
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/home/ubuntu/Development/Jadapi"
cd "$PROJECT_DIR"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "Current branch is '$CURRENT_BRANCH', switching to 'main'..."
    git checkout main
fi

# Stash any local changes
if ! git diff-index --quiet HEAD --; then
    print_warning "Local changes detected, stashing..."
    git stash
fi

# Pull latest code
echo ""
echo "📥 Pulling latest code from main branch..."
git pull origin main
print_success "Code updated successfully"

# Create logs directory if it doesn't exist
mkdir -p logs
print_success "Logs directory ready"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile
print_success "Dependencies installed"

# Build the server
echo ""
echo "🔨 Building server..."
cd apps/server
pnpm build
print_success "Server built successfully"

# Go back to project root
cd "$PROJECT_DIR"

# Restart or start PM2 process
echo ""
echo "🔄 Managing PM2 process..."

if pm2 describe jadapi-server > /dev/null 2>&1; then
    print_warning "Restarting existing PM2 process..."
    pm2 restart ecosystem.config.js --update-env
else
    print_warning "Starting new PM2 process..."
    pm2 start ecosystem.config.js
fi

# Save PM2 process list
pm2 save

print_success "PM2 process updated"

# Show PM2 status
echo ""
echo "📊 PM2 Status:"
pm2 list

# Show recent logs
echo ""
echo "📝 Recent logs (last 20 lines):"
pm2 logs jadapi-server --lines 20 --nostream

echo ""
echo "============================================"
print_success "Deployment completed successfully! 🎉"
echo ""
echo "Useful commands:"
echo "  - View logs:    pm2 logs jadapi-server"
echo "  - Stop server:  pm2 stop jadapi-server"
echo "  - Restart:      pm2 restart jadapi-server"
echo "  - Status:       pm2 status"
echo ""
