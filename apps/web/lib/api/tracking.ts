import { apiClient } from './client';

export interface TrackingInfo {
  order: {
    _id: string;
    orderId: string;
    status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    pickup: {
      address: string;
      coordinates: { lat: number; lng: number };
      contactName?: string;
      contactPhone?: string;
    };
    dropoff: {
      address: string;
      coordinates: { lat: number; lng: number };
      contactName?: string;
      contactPhone?: string;
    };
    package: {
      size: 'XS' | 'S' | 'M' | 'L';
      description?: string;
    };
    distance: {
      km: number;
      durationMinutes: number;
    };
    timeline: {
      createdAt: string;
      assignedAt?: string;
      pickedUpAt?: string;
      deliveredAt?: string;
      cancelledAt?: string;
    };
  };
  driver?: {
    _id: string;
    name: string;
    phone?: string;
    vehicle?: {
      type: string;
      plateNumber: string;
    };
  };
  driverLocation?: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    lastUpdated: string;
  };
}

export const trackingAPI = {
  /**
   * Track order by order ID (public endpoint - no auth required)
   */
  async trackOrder(orderId: string): Promise<{ success: boolean; data: TrackingInfo }> {
    const response = await apiClient.get(`/track/${orderId}`);
    return response.data;
  },

  /**
   * Get driver location for an order
   */
  async getDriverLocation(orderId: string): Promise<{ 
    success: boolean; 
    data: { 
      lat: number; 
      lng: number; 
      heading?: number; 
      speed?: number; 
      lastUpdated: string 
    } | null 
  }> {
    const response = await apiClient.get(`/track/${orderId}/driver-location`);
    return response.data;
  }
};
