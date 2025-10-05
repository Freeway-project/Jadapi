# JadAPI Quick Start Guide

## 🚀 Deploy Server

```bash
cd /home/ubuntu/Jadapi/jadapi-app/apps/server
pnpm run deploy
```

This single command:
- Cleans old build
- Installs dependencies
- Builds TypeScript
- Restarts PM2 process

---

## 🔐 Create Super Admin

```bash
curl -X POST http://localhost:3006/api/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jadapi.com",
    "password": "Admin123!",
    "displayName": "Jadapi Admin"
  }'
```

**Response includes JWT token** - save it for API testing!

---

## 🌐 Access Admin Panel

1. **Start web app:**
   ```bash
   cd /home/ubuntu/Jadapi/jadapi-app/apps/web
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3004/admin/login
   ```

3. **Login with credentials:**
   - Email: `admin@jadapi.com`
   - Password: `Admin123!`

---

## 📊 Monitor Server

```bash
# View logs
pnpm run pm2:logs

# Real-time monitoring
pnpm run pm2:monit

# Process status
pm2 status
```

---

## 🛠️ Common Commands

### Server Management
```bash
cd apps/server

pnpm run deploy          # Build & restart
pnpm run pm2:restart     # Restart only
pnpm run pm2:stop        # Stop server
pnpm run pm2:logs        # View logs
```

### Development
```bash
cd apps/server
pnpm run dev            # Dev mode with auto-reload

cd apps/web
npm run dev             # Next.js dev server
```

---

## 🧪 Test API Endpoints

### Login
```bash
curl -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jadapi.com","password":"Admin123!"}'
```

### Get Drivers (with JWT)
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3006/api/admin/drivers \
  -H "Authorization: Bearer $TOKEN"
```

### Create Driver
```bash
curl -X POST http://localhost:3006/api/admin/drivers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Driver",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "Driver123!",
    "vehicleType": "Sedan",
    "licenseNumber": "DL123456"
  }'
```

---

## 📁 Project Structure

```
jadapi-app/
├── apps/
│   ├── server/              # Backend API
│   │   ├── src/
│   │   ├── dist/           # Built files
│   │   ├── package.json
│   │   └── DEPLOYMENT.md
│   │
│   └── web/                # Frontend (Next.js)
│       ├── app/
│       │   └── admin/      # Admin panel
│       ├── components/
│       ├── contexts/       # Auth context
│       └── lib/api/        # API clients
│
├── CREATE_SUPER_ADMIN.md   # JWT auth docs
└── QUICK_START.md          # This file
```

---

## ✅ Health Checks

### Server Running?
```bash
curl http://localhost:3006/api
# Should return: {"status":200,"ok":true}
```

### Database Connected?
```bash
pm2 logs jadapi-server --lines 10
# Look for: "MongoDB connected successfully"
```

### PM2 Status
```bash
pm2 list
# jadapi-server should show "online"
```

---

## 🔥 Troubleshooting

### Server won't start
```bash
# Check what's on port 3006
lsof -i :3006

# Kill it
kill -9 $(lsof -t -i:3006)

# Redeploy
pnpm run deploy
```

### Build errors
```bash
# Type check first
pnpm run typecheck

# Clean rebuild
rm -rf dist node_modules
pnpm install
pnpm run build
```

### Database issues
```bash
# Check MongoDB
sudo systemctl status mongod

# Start if stopped
sudo systemctl start mongod
```

### Reset admin password
```bash
# Just create a new admin (duplicate emails will fail)
# Or connect to MongoDB and update directly:
mongo jadapi
db.users.updateOne(
  { "auth.email": "admin@jadapi.com" },
  { $set: { "auth.password": "<new-bcrypt-hash>" }}
)
```

---

## 🎯 Next Steps

1. ✅ Deploy server: `pnpm run deploy`
2. ✅ Create admin: Use curl command above
3. ✅ Start web app: `npm run dev` in apps/web
4. ✅ Login to admin panel: http://localhost:3004/admin/login
5. ✅ Create drivers, manage orders, etc.

---

## 📚 Documentation

- **JWT Auth**: `/CREATE_SUPER_ADMIN.md`
- **Deployment**: `/apps/server/DEPLOYMENT.md`
- **Frontend Auth**: `/apps/web/AUTH_SETUP.md`
- **Admin Setup**: `/ADMIN_SETUP.md`

---

## 🆘 Need Help?

```bash
# View all PM2 commands
pm2 --help

# View server logs
pnpm run pm2:logs

# Check PM2 status
pm2 status

# Monitor everything
pnpm run pm2:monit
```
