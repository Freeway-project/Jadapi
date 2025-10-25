import { apiClient } from './client';

export interface DriverDashboardData {
  profile: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    isOnline: boolean;
  };
  stats: {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    totalEarnings: number;
  };
  activeOrders: DriverOrder[];
}

export interface DriverOrder {
  _id: string;
  orderId: string;
  status: string;
  pickup: {
    address: string;
    coordinates: { lat: number; lng: number };
    contactName: string;
    contactPhone: string;
  };
  dropoff: {
    address: string;
    coordinates: { lat: number; lng: number };
    contactName: string;
    contactPhone: string;
  };
  package: {
    size: string;
    weight?: string;
    description?: string;
  };
  pricing: {
    baseFare: number;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
  };
  distance: {
    distanceKm: number;
    durationMinutes: number;
  };
  createdAt: string;
  assignedAt?: string;
}

export interface OrdersListResponse {
  success: boolean;
  data: {
    orders: DriverOrder[];
    total: number;
    hasMore: boolean;
  };
}

export const driverAPI = {
  getDashboard: async () => {
    const response = await apiClient.get('/driver/dashboard');
    return response.data;
  },

  getMyOrders: async (params?: { status?: string; limit?: number; skip?: number }): Promise<OrdersListResponse> => {
    const response = await apiClient.get('/driver/orders', { params });
    return response.data;
  },

  getAvailableOrders: async (params?: { limit?: number; skip?: number }): Promise<OrdersListResponse> => {
    const response = await apiClient.get('/driver/orders/available', { params });
    return response.data;
  },

  acceptOrder: async (orderId: string) => {
    const response = await apiClient.post(`/driver/orders/${orderId}/accept`);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await apiClient.patch(`/driver/orders/${orderId}/status`, { status });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/driver/stats');
    return response.data;
  },
};
