#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
    echo "Error: Please run with sudo"
    exit 1
fi

echo "Updating Nginx Configuration..."

# Backup
BACKUP="/etc/nginx/sites-available/jaddpi.backup.$(date +%Y%m%d_%H%M%S)"
if [ -f "/etc/nginx/sites-available/jaddpi" ]; then
    cp /etc/nginx/sites-available/jaddpi "$BACKUP"
    echo "✓ Backup created: $BACKUP"
fi

# Copy new config
cp ../nginx-jaddpi.conf /etc/nginx/sites-available/jaddpi

# Enable site
if [ ! -L "/etc/nginx/sites-enabled/jaddpi" ]; then
    ln -s /etc/nginx/sites-available/jaddpi /etc/nginx/sites-enabled/jaddpi
fi

# Test and reload
if nginx -t; then
    systemctl reload nginx
    echo "✓ Nginx reloaded successfully!"
else
    echo "✗ Config test failed, restoring backup"
    cp "$BACKUP" /etc/nginx/sites-available/jaddpi
    exit 1
fi
