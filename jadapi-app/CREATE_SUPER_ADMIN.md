# JWT Authentication System

## Overview

The application uses JWT (JSON Web Token) authentication. All admin routes require a valid JWT token.

---

## 1. Create Super Admin

**Endpoint:** `POST /api/auth/create-super-admin`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "displayName": "Super Admin"
}
```

**Response:**
```json
{
  "message": "Super admin created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uuid": "...",
    "email": "admin@example.com",
    "displayName": "Super Admin",
    "roles": ["super_admin"],
    "status": "active"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3006/api/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jadapi.com",
    "password": "Admin123!",
    "displayName": "Jadapi Admin"
  }'
```

---

## 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uuid": "...",
    "email": "admin@example.com",
    "displayName": "Super Admin",
    "roles": ["super_admin"],
    "status": "active",
    "accountType": "individual"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jadapi.com",
    "password": "Admin123!"
  }'
```

---

## 3. Using the JWT Token

All admin endpoints require the JWT token in the `Authorization` header:

```bash
curl -X GET http://localhost:3006/api/admin/drivers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Example: Get Drivers List

```bash
# First, login and get the token
TOKEN=$(curl -s -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jadapi.com","password":"Admin123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Then use the token to access admin endpoints
curl -X GET http://localhost:3006/api/admin/drivers \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4. Client-Side Authentication

The client automatically handles JWT tokens:

```javascript
import { authAPI, tokenManager } from '@/lib/api/auth';

// Login
const { token, user } = await authAPI.login('admin@jadapi.com', 'Admin123!');
// Token is automatically stored in localStorage

// Check if authenticated
const isAuth = authAPI.isAuthenticated();

// Logout
authAPI.logout();
// Token is automatically removed
```

All subsequent API calls will automatically include the JWT token in the Authorization header.

---

## 5. Admin Routes (Require JWT)

All these routes require `Authorization: Bearer TOKEN` header:

- `GET /api/admin/drivers` - List drivers
- `POST /api/admin/drivers` - Create driver
- `PUT /api/admin/drivers/:id/status` - Update driver status
- `GET /api/admin/dashboard/stats` - Dashboard stats
- `GET /api/admin/metrics` - System metrics
- `GET /api/admin/activity` - Recent activity
- `GET /api/admin/orders` - Orders list

---

## Quick Setup

```bash
# 1. Create super admin
curl -X POST http://localhost:3006/api/auth/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jadapi.com","password":"Admin123!","displayName":"Jadapi Admin"}'

# 2. Login and save token
TOKEN=$(curl -s -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jadapi.com","password":"Admin123!"}' \
  | jq -r '.token')

# 3. Use token for admin requests
curl -X GET http://localhost:3006/api/admin/drivers \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notes

- Tokens expire in 7 days
- `admin` and `super_admin` roles are treated the same
- Token is stored in localStorage on the client
- Token is automatically included in all API requests
- 401 responses automatically clear the token
