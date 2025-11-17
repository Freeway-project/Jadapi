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
    profile: { name: string };
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
  paymentStatus?: string;
  userId: {
    _id: string;
    profile: { name: string };
    auth: { phone?: string; email?: string };
  };
  driver?: {
    _id: string;
    profile: { name: string };
    auth: { phone?: string };
  };
  pickup: {
    address: string;
    contactName?: string;
    contactPhone?: string;
    coordinates?: { lat: number; lng: number };
  };
  dropoff: {
    address: string;
    contactName?: string;
    contactPhone?: string;
    coordinates?: { lat: number; lng: number };
  };
  package?: {
    size: string;
    description?: string;
    weight?: string;
  };
  distance?: {
    distanceKm: number;
    durationMinutes: number;
  };
  pricing: {
    total: number;
    currency: string;
    baseFare?: number;
    tax?: number;
  };
  coupon?: {
    code: string;
    discount: number;
  };
  timeline?: {
    createdAt?: string;
    assignedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };
  driverNote?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  uuid: string;
  accountType: 'individual' | 'business';
  profile: {
    name: string;
    address?: string;
    businessName?: string;
    gstNumber?: string;
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
  stats?: {
    totalOrders: number;
    totalSpent: number;
  };
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

export interface SmsUsageStats {
  usage: {
    hourly: number;
    daily: number;
    monthly: number;
    costDaily: number;
    costMonthly: number;
    limits: {
      perPhone: any;
      global: {
        hourly: number;
        daily: number;
        monthly: number;
      };
      costs: {
        dailyLimit: number;
        monthlyLimit: number;
        perSmsCost: number;
      };
      cooldown: any;
    };
  };
  percentages: {
    hourly: number;
    daily: number;
    monthly: number;
    costDaily: number;
    costMonthly: number;
  };
  warnings: string[];
  status: 'healthy' | 'warning';
}

export interface Driver {
  _id: string;
  uuid: string;
  profile: {
    name: string;
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
  name: string;
  address: string;
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

  async getAllOrders(filters: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    limit?: number;
    skip?: number;
  } = {}): Promise<{
    orders: Order[];
    total: number;
    pagination: any;
  }> {
    const res = await apiClient.get('/admin/orders', {
      params: filters
    });
    return res.data.data;
  },

  async getAllUsers(filters: {
    status?: string;
    accountType?: string;
    search?: string;
    limit?: number;
    skip?: number;
  } = {}): Promise<{
    users: User[];
    total: number;
    pagination: any;
  }> {
    const res = await apiClient.get('/admin/users', {
      params: filters
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

  async notifyDriver(driverId: string, notification: {
    title: string;
    body: string;
    url?: string;
    data?: Record<string, string>;
  }): Promise<void> {
    const res = await apiClient.post(`/admin/drivers/${driverId}/notify`, notification);
    return res.data;
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

  async getSmsUsage(): Promise<SmsUsageStats> {
    const res = await apiClient.get('/admin/sms/usage');
    return res.data.data;
  },

  async getCancelledOrders(filters: {
    limit?: number;
    skip?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{ orders: Order[]; total: number; hasMore: boolean }> {
    const res = await apiClient.get('/admin/orders/cancelled', {
      params: filters
    });
    return res.data.data;
  },

  async updateAdminNote(orderId: string, adminNote: string): Promise<{ order: Order }> {
    const res = await apiClient.patch(`/admin/orders/${orderId}/admin-note`, { adminNote });
    return res.data.data;
  },

  async getUserDetails(userId: string): Promise<{
    user: User;
    orders: Order[];
    activities: Activity[];
    stats: {
      totalOrders: number;
      byStatus: Record<string, number>;
      byPaymentStatus: Record<string, number>;
      totalRevenue: number;
    };
  }> {
    const res = await apiClient.get(`/admin/users/${userId}/details`);
    return res.data.data;
  },

  async getOrderDetails(orderId: string): Promise<{
    order: Order;
    activities: Activity[];
  }> {
    const res = await apiClient.get(`/admin/orders/${orderId}/details`);
    return res.data.data;
  },
};
