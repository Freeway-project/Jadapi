# JadAPI Deployment

All deployment scripts and documentation.

## Files

- `docker-build.sh` - Build Docker images
- `docker-start.sh` - Start Docker containers
- `docker-stop.sh` - Stop Docker containers
- `update-nginx.sh` - Update Nginx configuration
- `DOCKER_DEPLOYMENT.md` - Complete Docker deployment guide
- `.env.example` - Environment variables template

## Quick Deploy

```bash
# 1. Configure environment
cp .env.example ../.env
nano ../.env

# 2. Build images
./docker-build.sh

# 3. Update Nginx
sudo ./update-nginx.sh

# 4. Start services
./docker-start.sh
```
