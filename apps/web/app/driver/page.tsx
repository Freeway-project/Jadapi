'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { driverAPI, type DriverOrder } from '../../lib/api/driver';
import { useAuthStore } from '../../lib/stores/authStore';
import Header from '../../components/layout/Header';
import { Package, CheckCircle, Clock, Loader2, MapPin, Phone, User, Navigation } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import toast from 'react-hot-toast';

type OrderStatus = 'available' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('assigned');

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated() || !user?.roles?.includes('driver')) {
      toast.error('Please sign in as a driver to access this page');
      router.push('/driver/login');
      return;
    }

    // Initial fetch
    fetchOrders(true);

    // Silent background polling every 5 seconds
    const pollInterval = setInterval(() => {
      fetchOrders(false); // Silent refresh
    }, 5000);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(pollInterval);
  }, [activeStatus, user, router]);

  const fetchOrders = async (showLoader = false) => {
    try {
      // Only show loading spinner on initial load or manual refresh
      if (showLoader) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      if (activeStatus === 'available') {
        const response = await driverAPI.getAvailableOrders({ limit: 50 });
        setOrders(response.data?.orders || []);
      } else {
        const statusMap: Record<string, string> = {
          assigned: 'assigned',
          picked_up: 'picked_up',
          in_transit: 'in_transit',
          delivered: 'delivered',
        };

        const response = await driverAPI.getMyOrders({
          status: statusMap[activeStatus],
          limit: 50,
        });
        setOrders(response.data?.orders || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);

      // Handle auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        toast.error('Session expired. Please login again');
        router.push('/driver/login');
        return;
      }

      // Only show error toast on initial load, not during background polling
      if (showLoader) {
        toast.error('Failed to load orders');
      }
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await driverAPI.acceptOrder(orderId);
      toast.success('Order accepted');
      // Silent refresh after accepting
      fetchOrders(false);
    } catch (error: any) {
      console.error('Failed to accept order:', error);
      toast.error(error?.response?.data?.message || 'Failed to accept order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setActionLoading(orderId);
      await driverAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus.replace('_', ' ')}`);
      // Silent refresh after status update
      fetchOrders(false);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderOrderActions = (order: DriverOrder) => {
    const isLoading = actionLoading === order._id;

    if (activeStatus === 'available') {
      return (
        <Button
          size="sm"
          onClick={() => handleAcceptOrder(order._id)}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Accepting...</span>
            </div>
          ) : (
            'Accept Order'
          )}
        </Button>
      );
    }

    if (order.status === 'assigned') {
      return (
        <Button
          size="sm"
          onClick={() => handleUpdateStatus(order._id, 'picked_up')}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            'Mark as Picked Up'
          )}
        </Button>
      );
    }

    if (order.status === 'picked_up') {
      return (
        <Button
          size="sm"
          onClick={() => handleUpdateStatus(order._id, 'in_transit')}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            'Start Delivery'
          )}
        </Button>
      );
    }

    if (order.status === 'in_transit') {
      return (
        <Button
          size="sm"
          onClick={() => handleUpdateStatus(order._id, 'delivered')}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Completing...</span>
            </div>
          ) : (
            'Complete Delivery'
          )}
        </Button>
      );
    }

    return null;
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your deliveries</p>
          </div>
          {/* Silent refresh indicator */}
          {isRefreshing && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Updating...</span>
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="mb-4">
          <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
            {[
              { key: 'available' as OrderStatus, label: 'Available', icon: Package },
              { key: 'assigned' as OrderStatus, label: 'Assigned', icon: Clock },
              { key: 'picked_up' as OrderStatus, label: 'Picked Up', icon: Navigation },
              { key: 'in_transit' as OrderStatus, label: 'In Transit', icon: Navigation },
              { key: 'delivered' as OrderStatus, label: 'Delivered', icon: CheckCircle },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveStatus(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeStatus === key
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders?.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {order.orderId}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${((order.pricing?.total || 0) / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{order.pricing?.currency || 'CAD'}</p>
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Pickup</p>
                      <p className="text-sm text-gray-900 font-medium truncate">{order.pickup?.address}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          <span>{order.pickup?.contactName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{order.pickup?.contactPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dropoff Location */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Dropoff</p>
                      <p className="text-sm text-gray-900 font-medium truncate">{order.dropoff?.address}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          <span>{order.dropoff?.contactName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{order.dropoff?.contactPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Package: </span>
                      <span className="font-medium text-gray-900">{order.package?.size}</span>
                      {order.package?.weight && (
                        <span className="text-gray-600"> • {order.package.weight}</span>
                      )}
                    </div>
                    <div className="text-gray-600">
                      {order.distance?.distanceKm?.toFixed(1)} km • {order.distance?.durationMinutes} min
                    </div>
                  </div>
                  {order.package?.description && (
                    <p className="text-xs text-gray-600 mt-2">{order.package.description}</p>
                  )}
                </div>

                {/* Actions */}
                {renderOrderActions(order)}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {activeStatus === 'available'
                  ? 'No available orders at the moment'
                  : `No ${activeStatus.replace('_', ' ')} orders`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
