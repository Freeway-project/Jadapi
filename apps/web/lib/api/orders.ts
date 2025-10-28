import { apiClient } from './client';

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  pickup: {
    address: string;
    coordinates: { lat: number; lng: number };
    contactName?: string;
    contactPhone?: string;
    notes?: string;
  };
  dropoff: {
    address: string;
    coordinates: { lat: number; lng: number };
    contactName?: string;
    contactPhone?: string;
    notes?: string;
  };
  package: {
    size: 'XS' | 'S' | 'M' | 'L';
    description?: string;
  };
  pricing: {
    baseFare: number;
    distanceFare: number;
    subtotal: number;
    tax: number;
    couponDiscount?: number;
    total: number;
    currency: string;
  };
  distance: {
    km: number;
    durationMinutes: number;
  };
  coupon?: {
    code: string;
    couponId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    orderId: string;
    status: string;
    pickup: { address: string };
    dropoff: { address: string };
    createdAt: string;
  };
}

export interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  orderId: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    businessName?: string;
    gstNumber?: string;
  };
  delivery: {
    pickup: {
      address: string;
      contactName?: string;
      contactPhone?: string;
    };
    dropoff: {
      address: string;
      contactName?: string;
      contactPhone?: string;
    };
    packageSize: string;
    distance: number;
    estimatedDuration: number;
  };
  pricing: {
    baseFare: number;
    distanceFare: number;
    subtotal: number;
    tax: number;
    taxRate: number;
    couponDiscount?: number;
    couponCode?: string;
    total: number;
    currency: string;
  };
  payment: {
    method: string;
    status: string;
    paidAt: string;
    transactionId?: string;
  };
  status: string;
  createdAt: string;
}

export const ordersAPI = {
  /**
   * Get all orders for the authenticated user
   */
  getUserOrders: async (params?: { limit?: number; skip?: number; status?: string }) => {
    const response = await apiClient.get('/users/orders', { params });
    return response.data;
  },

  /**
   * Get a single order by orderId
   */
  getOrder: async (orderId: string) => {
    const response = await apiClient.get(`/users/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get invoice/receipt for an order
   */
  getOrderInvoice: async (orderId: string) => {
    const response = await apiClient.get<{ success: boolean; data: { invoice: Invoice } }>(`/users/orders/${orderId}/invoice`);
    return response.data;
  },

  /**
   * Get payment history for the authenticated user
   */
  getUserPayments: async (params?: { limit?: number; skip?: number; status?: string }) => {
    const response = await apiClient.get('/users/payments', { params });
    return response.data;
  },
};
