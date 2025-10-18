#!/bin/bash

# Nginx Setup Script for Jadapi API
# This script configures Nginx to proxy /api requests to the backend server

set -e

echo "🔧 Setting up Nginx for Jadapi API..."
echo "============================================"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo bash setup-nginx.sh"
    exit 1
fi

# Copy Nginx configuration
echo ""
echo "📋 Copying Nginx configuration..."
cp /home/ubuntu/Jadapi/nginx-jadapi.conf /etc/nginx/sites-available/jadapi
print_success "Configuration copied to /etc/nginx/sites-available/jadapi"

# Remove default site if it exists
if [ -L /etc/nginx/sites-enabled/default ]; then
    print_warning "Removing default Nginx site..."
    rm /etc/nginx/sites-enabled/default
fi

# Create symlink to enable the site
echo ""
echo "🔗 Enabling Jadapi site..."
if [ -L /etc/nginx/sites-enabled/jadapi ]; then
    print_warning "Removing existing symlink..."
    rm /etc/nginx/sites-enabled/jadapi
fi
ln -s /etc/nginx/sites-available/jadapi /etc/nginx/sites-enabled/jadapi
print_success "Site enabled"

# Test Nginx configuration
echo ""
echo "🧪 Testing Nginx configuration..."
nginx -t
print_success "Nginx configuration is valid"

# Reload Nginx
echo ""
echo "🔄 Reloading Nginx..."
systemctl reload nginx
print_success "Nginx reloaded successfully"

# Check Nginx status
echo ""
echo "📊 Nginx status:"
systemctl status nginx --no-pager | head -10

echo ""
echo "============================================"
print_success "Nginx setup completed! 🎉"
echo ""
echo "Your API is now accessible at:"
echo "  http://your-server-ip/api"
echo ""
echo "To add a domain later:"
echo "  1. Update server_name in /etc/nginx/sites-available/jadapi"
echo "  2. Run: sudo systemctl reload nginx"
echo ""
echo "To add SSL/HTTPS later:"
echo "  1. Install certbot: sudo apt install certbot python3-certbot-nginx"
echo "  2. Run: sudo certbot --nginx -d your-domain.com"
echo ""
