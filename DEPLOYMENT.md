# Jadapi Server Deployment Guide

This guide covers deploying the Jadapi API server on your VPS with Nginx and PM2.

## Quick Start

### Initial Setup (Run Once)

1. **Setup Nginx**
   ```bash
   sudo bash setup-nginx.sh
   ```

2. **Deploy the Server**
   ```bash
   bash deploy.sh
   ```

That's it! Your API is now running at `http://your-server-ip/api`

---

## Detailed Instructions

### Prerequisites

- Ubuntu/Debian VPS
- Node.js 18+ installed
- pnpm installed
- Nginx installed (handled by setup script)
- Git repository cloned

### Files Created

- `deploy.sh` - Automated deployment script (pull, build, restart)
- `setup-nginx.sh` - One-time Nginx configuration
- `ecosystem.config.js` - PM2 process configuration
- `nginx-jadapi.conf` - Nginx reverse proxy configuration

---

## Deployment Workflow

### Regular Deployments

After making changes and pushing to the `main` branch:

```bash
cd /home/ubuntu/Development/Jadapi
bash deploy.sh
```

This script will:
1. ✅ Pull latest code from `main` branch
2. ✅ Install dependencies
3. ✅ Build the server
4. ✅ Restart PM2 process
5. ✅ Show logs and status

### What the Deployment Script Does

- Automatically switches to `main` branch
- Stashes any local changes
- Pulls latest code
- Installs dependencies with `pnpm install`
- Builds the server with `pnpm build`
- Restarts or starts the PM2 process
- Shows current status and logs

---

## PM2 Process Management

### View Logs
```bash
pm2 logs jadapi-server
```

### View Real-time Logs
```bash
pm2 logs jadapi-server --lines 100
```

### Restart Server
```bash
pm2 restart jadapi-server
```

### Stop Server
```bash
pm2 stop jadapi-server
```

### Start Server
```bash
pm2 start jadapi-server
```

### View Process Status
```bash
pm2 status
pm2 describe jadapi-server
```

### Monitor Resources
```bash
pm2 monit
```

### Startup Script (Auto-start on reboot)
```bash
pm2 startup
pm2 save
```

---

## Nginx Configuration

### Location
- **Config file:** `/etc/nginx/sites-available/jadapi`
- **Enabled symlink:** `/etc/nginx/sites-enabled/jadapi`

### Current Setup
- Listens on port 80
- Proxies `/api/*` to `http://localhost:4001`
- Removes `/api` prefix when forwarding to backend

### Test Nginx Configuration
```bash
sudo nginx -t
```

### Reload Nginx (after config changes)
```bash
sudo systemctl reload nginx
```

### View Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/jadapi-access.log

# Error logs
sudo tail -f /var/log/nginx/jadapi-error.log
```

---

## Adding a Domain Name

When you get a domain name:

1. **Point DNS to your server IP**
   - Add an A record pointing to your server's IP address

2. **Update Nginx configuration**
   ```bash
   sudo nano /etc/nginx/sites-available/jadapi
   ```

   Change this line:
   ```nginx
   server_name _;
   ```

   To:
   ```nginx
   server_name api.yourdomain.com yourdomain.com;
   ```

3. **Reload Nginx**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Adding SSL/HTTPS (with Let's Encrypt)

### Install Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

### Auto-renewal
Certbot sets up auto-renewal automatically. Test it with:
```bash
sudo certbot renew --dry-run
```

### Manual Renewal (if needed)
```bash
sudo certbot renew
```

---

## Environment Variables

Located at: `/home/ubuntu/Development/Jadapi/apps/server/.env`

### Important Variables to Configure

```bash
# Set to production
NODE_ENV=production

# Server port (default: 4001)
PORT=4001

# Database connection
MONGO_URI=your_mongodb_connection_string

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_secure_random_string_here

# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin notification email
ADMIN_NOTIFICATION_EMAIL=admin@yourdomain.com
```

**⚠️ IMPORTANT:** Change the `JWT_SECRET` to a secure random string before going to production!

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Testing the Deployment

### Test API Endpoint
```bash
# Health check
curl http://localhost/api/

# Or from external
curl http://your-server-ip/api/
```

### Check Server Status
```bash
# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# Check server is listening
sudo netstat -tulpn | grep :4001
```

### View All Logs
```bash
# Application logs
pm2 logs jadapi-server

# Nginx access logs
sudo tail -f /var/log/nginx/jadapi-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/jadapi-error.log

# System logs
journalctl -u nginx -f
```

---

## Troubleshooting

### Server Not Starting
```bash
# Check PM2 logs
pm2 logs jadapi-server --err

# Check if port 4001 is in use
sudo lsof -i :4001

# Restart the server
pm2 restart jadapi-server
```

### Nginx 502 Bad Gateway
```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/jadapi-error.log

# Restart both services
pm2 restart jadapi-server
sudo systemctl restart nginx
```

### Build Failures
```bash
# Clear node_modules and reinstall
cd /home/ubuntu/Development/Jadapi
rm -rf node_modules apps/*/node_modules
pnpm install

# Rebuild
cd apps/server
pnpm build
```

### Port Already in Use
```bash
# Find process using port 4001
sudo lsof -i :4001

# Kill the process (replace PID)
sudo kill -9 PID

# Restart PM2
pm2 restart jadapi-server
```

---

## Firewall Configuration

### Allow HTTP/HTTPS Traffic
```bash
# If using UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# If using iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

---

## Backup & Rollback

### Create Backup
```bash
cd /home/ubuntu/Development/Jadapi
git stash
git tag backup-$(date +%Y%m%d-%H%M%S)
git push origin --tags
```

### Rollback to Previous Version
```bash
cd /home/ubuntu/Development/Jadapi
git log --oneline  # Find the commit to rollback to
git reset --hard COMMIT_HASH
bash deploy.sh
```

---

## Performance Monitoring

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Enable web monitoring (optional)
pm2 install pm2-server-monit
```

### Server Resources
```bash
# CPU and Memory usage
htop

# Disk usage
df -h

# Network connections
sudo netstat -tulpn
```

---

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use production Stripe keys (not test keys)
- [ ] Configure proper CORS settings
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up firewall (UFW or iptables)
- [ ] Use environment variables (never commit secrets)
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Monitor logs for suspicious activity
- [ ] Set up automatic backups

---

## Quick Reference Commands

```bash
# Deploy latest code
bash deploy.sh

# View logs
pm2 logs jadapi-server

# Restart server
pm2 restart jadapi-server

# Nginx reload
sudo systemctl reload nginx

# Check status
pm2 status && sudo systemctl status nginx

# View real-time logs
pm2 logs jadapi-server --lines 100
```

---

## Support

For issues or questions:
1. Check logs: `pm2 logs jadapi-server`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/jadapi-error.log`
3. Review this deployment guide
4. Check application logs in `/home/ubuntu/Development/Jadapi/logs/`
