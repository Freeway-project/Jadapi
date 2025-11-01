# Docker Deployment Checklist

## Pre-Deployment

### 1. Environment Configuration ✅

**CRITICAL:** Docker deployment uses the **root `.env` file** (not individual app .env files)

```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit with your production values
nano .env

# 3. Verify all required variables are set
grep -v '^#' .env | grep -v '^$'
```

**Required Variables:**
- ✅ `MONGODB_URI` - Database connection string
- ✅ `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- ✅ `JWT_REFRESH_SECRET` - Generate with: `openssl rand -base64 32`
- ✅ `SESSION_SECRET` - Generate with: `openssl rand -base64 32`
- ✅ `STRIPE_SECRET_KEY` - Production Stripe key
- ✅ `SMTP_*` - Email configuration (all SMTP_ variables)
- ✅ `GOOGLE_MAPS_API_KEY` - Maps API key
- ✅ `FRONTEND_URL` - Your production frontend URL
- ✅ `NEXT_PUBLIC_API_URL` - Your production API URL

### 2. Build Configuration ✅

**The build script (`deployment/docker-build.sh`) automatically uses `--no-cache`**

This ensures:
- ✅ Fresh build every time
- ✅ No stale environment variables
- ✅ Latest dependencies installed
- ✅ All changes are picked up

### 3. Docker Compose Configuration ✅

The `docker-compose.yml` is configured to:
- ✅ Load environment from root `.env` file via `env_file: - .env`
- ✅ Pass environment variables to containers
- ✅ Use production NODE_ENV during build

## Deployment Steps

### Option 1: Using Deployment Scripts (Recommended)

```bash
# 1. Ensure .env is configured
cat .env | grep -v '^#' | head -5

# 2. Build images (with --no-cache)
cd /home/ubuntu/Jadapi
./deployment/docker-build.sh

# 3. Start services
./deployment/docker-start.sh

# 4. Verify services are running
docker compose ps
docker compose logs -f
```

### Option 2: Manual Docker Commands

```bash
cd /home/ubuntu/Jadapi

# Build without cache (IMPORTANT!)
docker compose build --no-cache

# Start services
docker compose up -d

# View logs
docker compose logs -f
```

## Post-Deployment Verification

### 1. Check Service Health

```bash
# Check all containers are running
docker compose ps

# Should show:
# - jaddpi-server (healthy)
# - jaddpi-web (healthy)
# - jaddpi-redis (healthy)
```

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# API test
curl http://localhost:5000/api/
```

### 3. Test Frontend

```bash
# Frontend health
curl http://localhost:3000

# Open in browser
# http://localhost:3000
```

### 4. View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f server
docker compose logs -f web
```

## Environment File Location Reference

| Deployment Method | Environment File Location | Notes |
|------------------|---------------------------|-------|
| **Docker Compose** | `/home/ubuntu/Jadapi/.env` | ✅ Uses root .env |
| **PM2 (Non-Docker)** | `/home/ubuntu/Jadapi/apps/server/.env` | Uses app-specific .env |
| **Development** | App-specific `.env` files | Each app has its own |

## Common Issues & Solutions

### Issue: "Environment variables not loading"

**Solution:**
```bash
# 1. Verify .env exists at project root
ls -la /home/ubuntu/Jadapi/.env

# 2. Rebuild with --no-cache
cd /home/ubuntu/Jadapi
docker compose build --no-cache

# 3. Restart services
docker compose down
docker compose up -d
```

### Issue: "Old code still running after build"

**Solution:**
```bash
# Always use --no-cache for deployments
docker compose build --no-cache

# Or use the deployment script which does this automatically
./deployment/docker-build.sh
```

### Issue: "Container fails to start"

**Solution:**
```bash
# Check logs for the specific service
docker compose logs server
docker compose logs web

# Verify environment variables are set
docker compose config

# Check if ports are already in use
sudo lsof -i :5000
sudo lsof -i :3000
```

## Quick Commands Reference

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild and restart everything
docker compose down
./deployment/docker-build.sh
./deployment/docker-start.sh

# View environment variables in container
docker compose exec server env | grep -E 'MONGO|JWT|STRIPE'

# Shell into container
docker compose exec server sh
docker compose exec web sh

# Restart specific service
docker compose restart server
docker compose restart web
```

## Security Checklist

Before production deployment:

- [ ] Change all default secrets in `.env`
- [ ] Use production Stripe keys (not test keys)
- [ ] Set strong JWT secrets (use `openssl rand -base64 32`)
- [ ] Configure proper CORS origins
- [ ] Set `NODE_ENV=production`
- [ ] Never commit `.env` to git (verify `.gitignore`)
- [ ] Use HTTPS in production (configure nginx/reverse proxy)
- [ ] Enable firewall rules (allow only 80, 443, 22)
- [ ] Regular backups of MongoDB data
- [ ] Set up monitoring and alerts

## Updating After Code Changes

```bash
# 1. Pull latest code
cd /home/ubuntu/Jadapi
git pull origin main

# 2. Rebuild images (no cache!)
./deployment/docker-build.sh

# 3. Restart services
docker compose down
docker compose up -d

# 4. Verify
docker compose ps
docker compose logs -f --tail=50
```

## Rollback Process

```bash
# 1. Stop current deployment
docker compose down

# 2. Checkout previous version
git log --oneline -10  # Find the commit to rollback to
git checkout <commit-hash>

# 3. Rebuild and deploy
./deployment/docker-build.sh
./deployment/docker-start.sh
```
