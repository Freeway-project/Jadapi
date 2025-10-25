#!/bin/bash

# Uptime Kuma Monitor Setup (Port 7001)
# Quick copy-paste configurations

echo "🎯 Uptime Kuma Monitor Setup (Port 7001)"
echo "========================================="
echo ""

# Get VPS IP
VPS_IP=$(hostname -I | awk '{print $1}')
echo "📍 VPS IP: $VPS_IP"
echo "🌐 Uptime Kuma: http://$VPS_IP:7001"
echo ""

cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 COPY THESE MONITORS INTO UPTIME KUMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MONITOR 1: Server Health Check ⭐ (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo "Name:           Jaddpi - Health Check"
echo "Monitor Type:   HTTP(s)"
echo "URL:            http://$VPS_IP:4001/health"
echo "Method:         GET"
echo "Heartbeat:      60 seconds"
echo "Retries:        3"
echo "Description:    Primary server health check"

cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MONITOR 2: API Status Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo "Name:           Jaddpi - API Status"
echo "Monitor Type:   HTTP(s)"
echo "URL:            http://$VPS_IP:4001/api/status"
echo "Method:         GET"
echo "Heartbeat:      120 seconds"
echo "Retries:        3"
echo "Description:    API layer health check"

cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MONITOR 3: Web Frontend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo "Name:           Jaddpi - Frontend"
echo "Monitor Type:   HTTP(s)"
echo "URL:            http://$VPS_IP:3000"
echo "Method:         GET"
echo "Heartbeat:      120 seconds"
echo "Retries:        3"
echo "Description:    User-facing web application"

cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo ""
echo "🧪 Testing Endpoints..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint() {
    local name=$1
    local url=$2

    echo -n "$name... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [ "$status" = "200" ]; then
        echo "✅ OK (HTTP $status)"
    elif [ "$status" = "000" ]; then
        echo "❌ Connection Failed"
    else
        echo "⚠️  HTTP $status"
    fi
}

test_endpoint "Health Check " "http://$VPS_IP:4001/health"
test_endpoint "API Status   " "http://$VPS_IP:4001/api/status"
test_endpoint "Frontend     " "http://$VPS_IP:3000"

echo ""
echo "✅ Setup Ready!"
echo ""
echo "Next Steps:"
echo "1. Open: http://$VPS_IP:7001"
echo "2. Click 'Add New Monitor'"
echo "3. Copy the settings above"
echo "4. Setup email notifications (see: scripts/setup-email-notifications.md)"
echo ""
