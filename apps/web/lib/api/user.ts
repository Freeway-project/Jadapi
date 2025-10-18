import { apiClient } from './client';

export interface UserData {
  _id: string;
  uuid: string;
  accountType: 'individual' | 'business';
  email?: string;
  phone?: string;
  auth?: {
    email?: string;
    phone?: string;
  };
  profile?: {
    name: string;
    address?: string;
  };
  businessProfile?: {
    businessName?: string;
    gstNumber?: string;
  };
  roles: string[];
  status: string;
}

export interface SearchUserResponse {
  user: UserData;
}

export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
}

export interface RecentOrder {
  _id: string;
  orderId: string;
  status: string;
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

export interface DashboardData {
  user: {
    uuid: string;
    name?: string;
    email?: string;
    phone?: string;
    accountType: string;
    address?: string;
  };
  stats: DashboardStats;
  recentOrders: RecentOrder[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export const userAPI = {
  /**
   * Get user by UUID (unique identifier like roll number)
   */
  getUserByUuid: async (uuid: string): Promise<UserData> => {
    const response = await apiClient.get(`/users/uuid/${uuid}`);
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserData> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Get user dashboard data
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get('/users/dashboard');
    return response.data;
  },
};
