# Docker Deployment Guide for JadAPI

Complete guide for deploying JadAPI using Docker and Docker Compose with Nginx reverse proxy.

## Architecture

```
Internet → Nginx (Port 80/443)
    ├── / → Frontend (Next.js on port 3000)
    └── /api → Backend (Express on port 5000)
```

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Freeway-project/Jadapi.git
cd Jadapi
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

### 3. Build Images

```bash
# Using build script
./docker-build.sh

# Or manually
docker compose build
```

### 4. Start Services

```bash
# Using start script
./docker-start.sh

# Or manually
docker compose up -d
```

### 5. Access Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost/api
- **Health Check:** http://localhost/health

## Environment Variables

### Required Variables

#### Backend
```env
MONGODB_URI=mongodb://localhost:27017/jadapi
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
STRIPE_SECRET_KEY=sk_test_your_key
GOOGLE_MAPS_API_KEY=your_key
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
NEXT_PUBLIC_APP_NAME=JadAPI
```

See `.env.example` for complete list.

## Docker Commands

### Build

```bash
# Build all images
docker compose build

# Build without cache
docker compose build --no-cache

# Build specific service
docker compose build web
docker compose build server
```

### Start/Stop

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# Restart services
docker compose restart

# Restart specific service
docker compose restart web
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f web
docker compose logs -f server
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail=100
```

### Execute Commands

```bash
# Access container shell
docker compose exec web sh
docker compose exec server sh

# Run commands
docker compose exec server npm run migrate
```

## Services

### Nginx (Reverse Proxy)
- **Container:** jadapi-nginx
- **Ports:** 80, 443
- **Config:** `nginx-docker.conf`

### Frontend (Next.js)
- **Container:** jadapi-web
- **Internal Port:** 3000
- **Dockerfile:** `apps/web/Dockerfile`

### Backend (Express)
- **Container:** jadapi-server
- **Internal Port:** 5000
- **Dockerfile:** `apps/server/Dockerfile`

## Production Deployment

### On VPS/Cloud Server

#### 1. Install Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Verify
docker --version
docker compose version
```

#### 2. Setup Application

```bash
# Clone repository
git clone https://github.com/Freeway-project/Jadapi.git
cd Jadapi

# Configure environment
cp .env.example .env
nano .env
```

#### 3. Build and Deploy

```bash
# Build images
./docker-build.sh

# Start services
./docker-start.sh

# Check status
docker compose ps
```

#### 4. Configure Domain (Optional)

Update `nginx-docker.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # ... rest of config
}
```

Restart nginx:
```bash
docker compose restart nginx
```

### SSL/HTTPS Setup

#### Using Let's Encrypt

1. **Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Get Certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Update docker-compose.yml:**
```yaml
nginx:
  volumes:
    - ./nginx-docker.conf:/etc/nginx/conf.d/default.conf:ro
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

4. **Update nginx-docker.conf:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring

### Health Checks

All services have built-in health checks:

```bash
# Check service health
docker compose ps

# Manual health check
curl http://localhost/health
curl http://localhost/api/health
```

### View Service Status

```bash
# Container status
docker compose ps

# Resource usage
docker stats

# Service logs
docker compose logs -f
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose logs

# Check individual service
docker compose logs server
docker compose logs web

# Restart services
docker compose restart
```

### Port Already in Use

```bash
# Check what's using port 80
sudo lsof -i :80

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead
```

### Container Keeps Restarting

```bash
# Check logs for errors
docker compose logs server

# Check environment variables
docker compose exec server env

# Verify .env file
cat .env
```

### Build Fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache

# Check disk space
df -h
```

### Database Connection Issues

```bash
# Check MongoDB is running (if using Docker MongoDB)
docker compose ps mongodb

# Test connection
docker compose exec server node -e "console.log(process.env.MONGODB_URI)"

# View server logs
docker compose logs server
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker compose build

# Restart services
docker compose down
docker compose up -d
```

### Backup Data

```bash
# Backup MongoDB (if using Docker MongoDB)
docker compose exec -T mongodb mongodump --archive > backup.dump

# Restore
docker compose exec -T mongodb mongorestore --archive < backup.dump
```

### Clear Logs

```bash
# Clear all Docker logs
sudo sh -c "truncate -s 0 /var/lib/docker/containers/*/*-json.log"

# Or use logrotate
```

## Scaling

### Scale Services

```bash
# Run multiple web instances
docker compose up -d --scale web=3

# Note: Nginx will load balance between instances
```

## Security Best Practices

1. **Use secrets for sensitive data:**
   - Never commit `.env` to git
   - Use Docker secrets in production

2. **Enable firewall:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

3. **Regular updates:**
```bash
# Update base images
docker compose pull
docker compose up -d
```

4. **Limit resources:**
```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

## Performance Optimization

### Enable Caching

Already configured in `nginx-docker.conf`:
- Static files: 60 minutes
- Images: 24 hours

### Use Production Mode

Ensure `.env` has:
```env
NODE_ENV=production
```

### Monitor Resources

```bash
# View resource usage
docker stats

# View logs
docker compose logs -f --tail=100
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/Jadapi
            git pull
            ./docker-build.sh
            docker compose down
            docker compose up -d
```

## Support

For issues:
1. Check logs: `docker compose logs`
2. Review configuration
3. Check GitHub issues
4. Contact support

## Quick Reference

```bash
# Build
./docker-build.sh

# Start
./docker-start.sh

# Stop
./docker-stop.sh

# Logs
docker compose logs -f

# Status
docker compose ps

# Restart
docker compose restart

# Update
git pull && docker compose build && docker compose up -d
```
