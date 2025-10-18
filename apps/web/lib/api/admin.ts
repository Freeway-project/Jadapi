import { apiClient } from './client'; 

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  orders: {
    total: number;
    today: number;
    week: number;
    month: number;
    pending: number;
    active: number;
    completed: number;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
  };
}

export interface Activity {
  _id: string;
  userId?: {
    _id: string;
    profile: { displayName: string };
    auth: { email?: string };
  };
  action: string;
  resource: string;
  resourceId?: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  timestamp: string;
}

export interface Order {
  _id: string;
  orderId: string;
  status: string;
  userId: {
    _id: string;
    profile: { displayName: string };
    auth: { phone?: string };
  };
  pickup: {
    address: string;
  };
  dropoff: {
    address: string;
  };
  pricing: {
    total: number;
    currency: string;
  };
  createdAt: string;
}

export interface SystemMetrics {
  apiCalls24h: number;
  errorRate24h: string;
  avgResponseTime: string;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

export interface Driver {
  _id: string;
  uuid: string;
  profile: {
    displayName: string;
  };
  auth: {
    email?: string;
    phone?: string;
    emailVerifiedAt?: string;
    phoneVerifiedAt?: string;
  };
  status: 'active' | 'suspended' | 'deleted';
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverData {
  email?: string;
  phone?: string;
  password?: string;
  displayName: string;
  vehicleType?: string;
  licenseNumber?: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'eliminate_fee' | 'fixed_discount' | 'percentage_discount';
  discountValue?: number;
  expiryDate?: string;
  isActive: boolean;
  maxUsesTotal?: number;
  maxUsesPerUser?: number;
  currentUsesTotal: number;
  minOrderAmount?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  code: string;
  discountType: 'eliminate_fee' | 'fixed_discount' | 'percentage_discount';
  discountValue?: number;
  expiryDate?: string;
  maxUsesTotal?: number;
  maxUsesPerUser?: number;
  minOrderAmount?: number;
  description?: string;
}

export const adminAPI = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await apiClient.get('/admin/dashboard/stats');
    return res.data.data;
  },

  async getRecentActivity(limit = 50, skip = 0): Promise<{
    activities: Activity[];
    pagination: any;
  }> {
    const res = await apiClient.get('/admin/activity', {
      params: { limit, skip }
    });
    return res.data.data;
  },

  async getActiveOrders(limit = 50, skip = 0): Promise<{
    orders: Order[];
    pagination: any;
  }> {
    const res = await apiClient.get('/admin/orders/active', {
      params: { limit, skip }
    });
    return res.data.data;
  },

  async getSystemMetrics(): Promise<SystemMetrics> {
    const res = await apiClient.get('/admin/metrics');
    return res.data.data;
  },

  async getDrivers(filters: {
    status?: string;
    search?: string;
    limit?: number;
    skip?: number;
  } = {}): Promise<{
    drivers: Driver[];
    pagination: any;
  }> {
    const res = await apiClient.get('/admin/drivers', {
      params: filters
    });
    return res.data.data;
  },

  async createDriver(driverData: CreateDriverData): Promise<Driver> {
    const res = await apiClient.post('/admin/drivers', driverData);
    return res.data.data;
  },

  async updateDriverStatus(driverId: string, status: 'active' | 'suspended' | 'deleted'): Promise<Driver> {
    const res = await apiClient.put(`/admin/drivers/${driverId}/status`, { status });
    return res.data.data;
  },

  async getCoupons(filters: {
    isActive?: boolean;
    limit?: number;
    skip?: number;
  } = {}): Promise<{
    coupons: Coupon[];
    count: number;
  }> {
    const res = await apiClient.get('/coupons/admin', {
      params: filters
    });
    return res.data.data;
  },

  async createCoupon(couponData: CreateCouponData): Promise<Coupon> {
    const res = await apiClient.post('/coupons/admin', couponData);
    return res.data.data.coupon;
  },

  async getAppConfig(): Promise<{
    id: string;
    appActive: boolean;
    promo: { activeCodes: string[] };
    updatedAt: string;
    updatedBy: string;
    version: number;
  }> {
    const res = await apiClient.get('/admin/config');
    return res.data.data;
  },

  async updateAppActiveStatus(isActive: boolean): Promise<void> {
    await apiClient.put('/admin/config/active', { isActive });
  },

  async getEarlyAccessRequests(filters: {
    status?: string;
    limit?: number;
    skip?: number;
  } = {}): Promise<any> {
    const res = await apiClient.get('/admin/early-access-requests', {
      params: filters
    });
    return res.data;
  },

  async updateEarlyAccessRequestStatus(requestId: string, status: string): Promise<any> {
    const res = await apiClient.put(`/admin/early-access-requests/${requestId}/status`, { status });
    return res.data;
  },
};
