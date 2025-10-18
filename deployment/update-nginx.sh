#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
    echo "Error: Please run with sudo"
    exit 1
fi

echo "Updating Nginx Configuration..."

# Backup
BACKUP="/etc/nginx/sites-available/jadapi.backup.$(date +%Y%m%d_%H%M%S)"
if [ -f "/etc/nginx/sites-available/jadapi" ]; then
    cp /etc/nginx/sites-available/jadapi "$BACKUP"
    echo "✓ Backup created: $BACKUP"
fi

# Copy new config
cp ../nginx-jadapi.conf /etc/nginx/sites-available/jadapi

# Enable site
if [ ! -L "/etc/nginx/sites-enabled/jadapi" ]; then
    ln -s /etc/nginx/sites-available/jadapi /etc/nginx/sites-enabled/jadapi
fi

# Test and reload
if nginx -t; then
    systemctl reload nginx
    echo "✓ Nginx reloaded successfully!"
else
    echo "✗ Config test failed, restoring backup"
    cp "$BACKUP" /etc/nginx/sites-available/jadapi
    exit 1
fi
