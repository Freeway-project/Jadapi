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
};
