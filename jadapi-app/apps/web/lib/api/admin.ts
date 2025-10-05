const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  displayName: string;
  vehicleType?: string;
  licenseNumber?: string;
}

export const adminAPI = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    const data = await res.json();
    return data.data;
  },

  async getRecentActivity(limit = 50, skip = 0): Promise<{
    activities: Activity[];
    pagination: any;
  }> {
    const res = await fetch(
      `${API_URL}/api/admin/activity?limit=${limit}&skip=${skip}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch activity");
    const data = await res.json();
    return data.data;
  },

  async getActiveOrders(limit = 50, skip = 0): Promise<{
    orders: Order[];
    pagination: any;
  }> {
    const res = await fetch(
      `${API_URL}/api/admin/orders/active?limit=${limit}&skip=${skip}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch orders");
    const data = await res.json();
    return data.data;
  },

  async getSystemMetrics(): Promise<SystemMetrics> {
    const res = await fetch(`${API_URL}/api/admin/metrics`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch metrics");
    const data = await res.json();
    return data.data;
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
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.skip) params.append('skip', filters.skip.toString());

    const res = await fetch(
      `${API_URL}/api/admin/drivers?${params.toString()}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("Failed to fetch drivers");
    const data = await res.json();
    return data.data;
  },

  async createDriver(driverData: CreateDriverData): Promise<Driver> {
    const res = await fetch(`${API_URL}/api/admin/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(driverData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create driver");
    }

    const data = await res.json();
    return data.data;
  },

  async updateDriverStatus(driverId: string, status: 'active' | 'suspended' | 'deleted'): Promise<Driver> {
    const res = await fetch(`${API_URL}/api/admin/drivers/${driverId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update driver status");
    }

    const data = await res.json();
    return data.data;
  },
};
