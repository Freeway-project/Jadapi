# Frontend Authentication Setup

## Overview

The frontend now has complete JWT authentication with protected routes.

## Components

### 1. AuthContext (`/contexts/AuthContext.tsx`)
Provides authentication state and methods throughout the app.

**Methods:**
- `login(email, password)` - Authenticate user and store JWT
- `logout()` - Clear token and redirect to login
- `checkAuth()` - Verify if user is authenticated
- `isAuthenticated` - Boolean flag for auth status
- `user` - Current user object
- `token` - JWT token

**Usage:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  // ...
}
```

### 2. ProtectedRoute (`/components/auth/ProtectedRoute.tsx`)
Wraps routes that require authentication. Redirects to `/admin/login` if not authenticated.

### 3. Login Page (`/app/admin/login/page.tsx`)
Beautiful login UI with:
- Email and password fields
- Error handling
- Loading states
- Responsive design

## Route Structure

```
/admin
├── login/              (Public - has its own layout without AdminLayout)
│   ├── layout.tsx     (AuthProvider only)
│   └── page.tsx       (Login form)
│
├── layout.tsx         (AuthProvider + ProtectedRoute + AdminLayout)
├── dashboard/         (Protected)
├── drivers/           (Protected)
└── ...other routes    (Protected)
```

## How It Works

1. **User visits `/admin/dashboard`**
   - `AuthProvider` checks for stored JWT token
   - `ProtectedRoute` verifies authentication
   - If not authenticated → redirect to `/admin/login`
   - If authenticated → render page

2. **User logs in**
   - Submit email/password to `/api/auth/login`
   - Receive JWT token
   - Store in localStorage
   - Redirect to `/admin/dashboard`

3. **API Requests**
   - `apiClient` automatically adds `Authorization: Bearer TOKEN` header
   - Server validates JWT
   - Returns data or 401 if invalid

4. **Logout**
   - Click "Sign Out" button
   - Token removed from localStorage
   - Redirect to `/admin/login`

## Features

- ✅ JWT token authentication
- ✅ Automatic token injection in API calls
- ✅ Protected routes
- ✅ Automatic redirect to login
- ✅ Token persistence (localStorage)
- ✅ Auto logout on 401
- ✅ Loading states
- ✅ Error handling
- ✅ User info display in sidebar
- ✅ Responsive design

## Testing

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Create an admin (if not exists):**
   ```bash
   curl -X POST http://localhost:3006/api/auth/create-admin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@jaddpi.com","password":"Admin123!","displayName":"jaddpi Admin"}'
   ```

3. **Access the admin panel:**
   - Visit: `http://localhost:3004/admin/dashboard`
   - You'll be redirected to `/admin/login`
   - Login with: `admin@jaddpi.com` / `Admin123!`
   - You'll be redirected to the dashboard

4. **Try protected features:**
   - Visit `/admin/drivers` - should work
   - Click "Sign Out" - redirects to login
   - Try accessing `/admin/drivers` - redirects to login

## Security

- Passwords hashed with bcrypt on server
- JWT tokens expire in 7 days
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Password field excluded from DB queries by default
- Admin routes require valid JWT + admin role

## Future Enhancements

- [ ] Refresh tokens
- [ ] Remember me functionality
- [ ] Password reset flow
- [ ] 2FA support
- [ ] Session timeout warnings
- [ ] Activity logging
