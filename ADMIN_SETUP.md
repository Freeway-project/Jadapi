# Admin System - Setup Guide

## Overview
A complete admin system for monitoring and managing the Jadapi delivery platform.

## 🚀 What Was Built

### 1. **Database Models**
- **User Model** (`apps/server/src/models/user.model.ts`)
  - Added `admin` role to existing roles
  - Admins have full platform access

- **ActivityLog Model** (`apps/server/src/models/ActivityLog.ts`)
  - Tracks all API activity
  - Records user actions, endpoints, status codes, IP addresses
  - Indexed for fast queries

- **DeliveryOrder Model** (`apps/server/src/models/DeliveryOrder.ts`)
  - Complete delivery order schema
  - Tracks status, pricing, locations, timeline
  - Geospatial indexes for location queries

### 2. **Authentication & Middleware**
- **Admin Auth Middleware** (`apps/server/src/middlewares/adminAuth.ts`)
  - `requireAdmin` - Restricts to admin role only

- **Activity Logger** (`apps/server/src/middlewares/activityLogger.ts`)
  - Automatic API activity logging
  - Tracks request/response data
  - Custom admin action logging

### 3. **Backend Services**
- **Admin Service** (`apps/server/src/services/admin.service.ts`)
  - Dashboard statistics (users, orders, revenue)
  - Activity monitoring
  - Order management
  - User management
  - System metrics

### 4. **API Endpoints** (`apps/server/src/routes/admin.routes.ts`)

#### Admin Routes:
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/metrics` - System metrics
- `GET /api/admin/activity` - Recent activity logs
- `GET /api/admin/activity/user/:userId` - User-specific activity
- `GET /api/admin/orders/active` - Active orders
- `GET /api/admin/orders` - All orders with filters
- `GET /api/admin/users` - All users with filters

### 5. **Admin Dashboard UI** (`apps/web/app/admin/`)

#### Dashboard Page (`dashboard/page.tsx`)
- **Real-time Stats Cards:**
  - Total/Active Users
  - Active/Pending Orders
  - Revenue (Today/Week/Month)
  - Order trends

- **System Metrics:**
  - API calls (24h)
  - Error rate
  - Average response time
  - Server uptime

- **Activity Feed:**
  - Recent API calls
  - User actions
  - Status codes
  - Timestamps

- **Active Orders:**
  - Real-time order status
  - Customer details
  - Pickup/dropoff locations
  - Pricing

#### Features:
- Auto-refresh every 30 seconds
- Mobile responsive
- Clean Uber-like UI
- Color-coded status indicators

### 6. **API Client** (`apps/web/lib/api/admin.ts`)
- TypeScript types for all admin data
- Fetch functions for all endpoints
- Error handling

## 🔐 Security Features

1. **Role-based Access Control**
   - Admin role required for sensitive operations
   - Middleware validates user roles
   - Active account status required

2. **Activity Logging**
   - All admin actions tracked
   - IP address and user agent logged
   - Audit trail for compliance

3. **Session Management**
   - Uses existing auth system
   - Credentials included in requests

## 📊 Monitoring Capabilities

### Dashboard Metrics:
- User growth and activity
- Order volume and trends
- Revenue tracking (daily/weekly/monthly)
- System performance

### Activity Monitoring:
- API usage patterns
- Error tracking
- User behavior
- Resource access logs

### Order Management:
- Real-time order status
- Filter by status, date, user
- Driver assignment tracking
- Timeline tracking

## 🚦 Getting Started

### 1. Create Admin User
Run this in MongoDB or via API:
```javascript
// Update existing user to admin
db.users.updateOne(
  { "auth.email": "admin@jadapi.com" },
  { $addToSet: { roles: "admin" } }
)
```

### 2. Access Dashboard
Navigate to: `http://localhost:3000/admin/dashboard`

### 3. Configure Environment
Ensure `NEXT_PUBLIC_API_URL` is set in `.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📁 File Structure

```
apps/server/src/
├── models/
│   ├── ActivityLog.ts          # Activity tracking
│   ├── DeliveryOrder.ts        # Order management
│   └── user.model.ts           # Updated with admin role
├── middlewares/
│   ├── adminAuth.ts            # Admin authentication
│   └── activityLogger.ts       # Activity logging
├── services/
│   └── admin.service.ts        # Admin business logic
├── controllers/
│   └── admin.controller.ts     # Admin request handlers
└── routes/
    ├── admin.routes.ts         # Admin endpoints
    └── index.ts                # Updated with admin routes

apps/web/
├── app/admin/
│   ├── layout.tsx              # Admin layout
│   └── dashboard/
│       └── page.tsx            # Dashboard UI
└── lib/api/
    └── admin.ts                # Admin API client
```

## 🔄 Real-time Features

The dashboard includes:
- Auto-refresh every 30 seconds
- Live order status updates
- Recent activity feed
- System health monitoring

## 🎯 Next Steps

To enhance the admin system:

1. **Add WebSocket Support**
   - Real-time order updates
   - Live activity feed
   - Push notifications

2. **Additional Pages**
   - User management (suspend/activate)
   - Order details view
   - Analytics & reports
   - Settings & configuration

3. **Advanced Features**
   - Export data (CSV/Excel)
   - Custom date range filters
   - Advanced search
   - Bulk operations

4. **Security Enhancements**
   - 2FA for admins
   - IP whitelisting
   - Rate limiting
   - Audit log exports

## 📝 API Usage Examples

### Get Dashboard Stats
```typescript
const stats = await adminAPI.getDashboardStats();
console.log(stats.orders.today); // Today's orders
```

### Get Recent Activity
```typescript
const { activities } = await adminAPI.getRecentActivity(20);
activities.forEach(activity => {
  console.log(`${activity.action} ${activity.resource}`);
});
```

### Monitor Active Orders
```typescript
const { orders } = await adminAPI.getActiveOrders(10);
orders.forEach(order => {
  console.log(`Order #${order.orderId}: ${order.status}`);
});
```

## ⚠️ Important Notes

1. **Authentication Required**: All admin routes require authentication middleware (not implemented in routes - add your existing auth middleware)

2. **Role Assignment**: Only admin users can access dashboard stats and metrics

3. **Activity Logging**: Add `activityLogger` middleware to routes you want to track

4. **Database Indexes**: Ensure MongoDB indexes are created for optimal performance

## 🐛 Troubleshooting

**Dashboard not loading?**
- Check API URL in environment variables
- Verify admin role is assigned
- Check browser console for errors

**No data showing?**
- Seed some test orders
- Create test users
- Generate some API activity

**Authentication issues?**
- Add auth middleware to admin routes
- Verify session/token is valid
- Check user status is "active"
