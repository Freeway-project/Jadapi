# Server Deployment Guide

## Quick Deploy

The easiest way to build and restart the server:

```bash
pnpm run deploy
```

This command will:
1. Clean old build files
2. Install dependencies
3. Build TypeScript
4. Restart PM2 process

---

## NPM Scripts

### Build & Deploy
```bash
pnpm run deploy              # Build and restart (recommended)
pnpm run pm2:build           # Just build (no restart)
```

### PM2 Management
```bash
pnpm run pm2:restart         # Restart PM2 process
pnpm run pm2:stop            # Stop PM2 process
pnpm run pm2:logs            # View logs
pnpm run pm2:monit           # Monitor processes
```

### Development
```bash
pnpm run dev                 # Start dev server with nodemon
pnpm run build               # Build TypeScript
pnpm run start               # Start production server
pnpm run typecheck           # Type check without building
```

---

## Manual Deployment

If you prefer step-by-step deployment:

### 1. Build the Server
```bash
cd /home/ubuntu/Jadapi/jadapi-app/apps/server
rm -rf dist
pnpm install
pnpm run build
```

### 2. Verify Build
```bash
ls -la dist/
# Should see server.js and other compiled files
```

### 3. Restart PM2
```bash
pm2 restart jadapi-server
# OR if not running yet:
pm2 start dist/server.js --name jadapi-server --time
```

### 4. Save PM2 Configuration
```bash
pm2 save
pm2 startup  # To auto-start on server reboot
```

### 5. Check Status
```bash
pm2 status
pm2 logs jadapi-server --lines 50
```

---

## Using the Shell Script

Alternative method using the provided shell script:

```bash
cd /home/ubuntu/Jadapi/jadapi-app/apps/server
./build-and-restart.sh
```

The script provides:
- ✅ Colored output
- ✅ Step-by-step progress
- ✅ Error handling
- ✅ Automatic PM2 management
- ✅ Log preview

---

## PM2 Commands Reference

### Process Management
```bash
pm2 list                     # List all processes
pm2 restart jadapi-server    # Restart server
pm2 stop jadapi-server       # Stop server
pm2 delete jadapi-server     # Remove from PM2
pm2 reload jadapi-server     # Zero-downtime restart
```

### Monitoring
```bash
pm2 logs jadapi-server       # Stream logs
pm2 logs jadapi-server --lines 100  # Show last 100 lines
pm2 monit                    # Real-time monitoring
pm2 status                   # Process status
```

### Advanced
```bash
pm2 save                     # Save current process list
pm2 resurrect                # Restore saved processes
pm2 startup                  # Generate startup script
pm2 unstartup                # Disable startup script
```

---

## Environment Variables

Make sure these are set in `/home/ubuntu/Jadapi/jadapi-app/apps/server/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jadapi

# Server
PORT=3006
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# AWS SNS (if using SMS)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

---

## Troubleshooting

### Build Fails
```bash
# Check TypeScript errors
pnpm run typecheck

# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm run build
```

### PM2 Won't Start
```bash
# Check if port is in use
lsof -i :3006

# Kill process on port
kill -9 $(lsof -t -i:3006)

# Start fresh
pm2 delete jadapi-server
pnpm run deploy
```

### Check Logs for Errors
```bash
# PM2 logs
pm2 logs jadapi-server --lines 100

# Error logs only
pm2 logs jadapi-server --err

# Follow logs in real-time
pm2 logs jadapi-server --lines 0
```

### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection
mongo --eval "db.adminCommand('ping')"
```

---

## Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure proper database credentials
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerts
- [ ] Configure log rotation
- [ ] Test all endpoints
- [ ] Backup database
- [ ] Document API changes

---

## Quick Commands Summary

```bash
# Deploy everything
pnpm run deploy

# View logs
pnpm run pm2:logs

# Monitor server
pnpm run pm2:monit

# Stop server
pnpm run pm2:stop

# Restart server
pnpm run pm2:restart
```

---

## Auto-Deployment Script

For automated deployments, you can add this to crontab or use in CI/CD:

```bash
#!/bin/bash
cd /home/ubuntu/Jadapi/jadapi-app/apps/server
git pull origin main
pnpm run deploy
pm2 save
```

Save as `deploy.sh`, make executable: `chmod +x deploy.sh`
