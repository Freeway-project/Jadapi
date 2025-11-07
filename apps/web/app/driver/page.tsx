'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { driverAPI, type DriverOrder } from '../../lib/api/driver';
import { useAuthStore } from '../../lib/stores/authStore';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import Header from '../../components/layout/Header';
import { Package, CheckCircle, Clock, Loader2, MapPin, Phone, User, Navigation, ExternalLink, Radio } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useFcmToken } from '../../hooks/useFcmToken';
import toast from 'react-hot-toast';

type OrderStatus = 'available' | 'in_progress';

// Helper function to generate Google Maps directions URL with full route
const getRouteDirectionsUrl = (
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
) => {
  // Shows full route from pickup to dropoff in Google Maps
  return `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${dropoffLat},${dropoffLng}&travelmode=driving`;
};

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<DriverOrder[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>('available');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // FCM token management
  const { token: fcmToken, loading: fcmLoading, requestToken } = useFcmToken(user?._id || user?.id);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(!!fcmToken);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Get current active order ID for location tracking
  const activeOrderId = orders.find(o => ['assigned', 'picked_up', 'in_transit'].includes(o.status))?._id;

  // Initialize driver location tracking
  const { isTracking, lastUpdate, error: locationError } = useDriverLocation({
    enabled: locationEnabled,
    driverId: user?._id || user?.id,
    orderId: activeOrderId,
    updateInterval: 5000, // Update every 5 seconds
  });

  // Handle location toggle with permission request
  const handleLocationToggle = async () => {
    if (locationEnabled) {
      // Turning off - just disable
      setLocationEnabled(false);
      toast.success('Location sharing turned off');
      return;
    }

    // Turning on - request permission first
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return;
      }

      // Show message asking user to allow
      toast('Please allow location access when prompted', {
        icon: '📍',
        duration: 3000,
      });

      // Request permission
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        toast.error('Location permission denied. Please enable it in your browser settings.');
        setPermissionState('denied');
        return;
      }

      // Try to get current position to trigger permission prompt if needed
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success - enable location sharing
          setLocationEnabled(true);
          setPermissionState('granted');
          toast.success('✓ Location sharing enabled');
        },
        (error) => {
          // Handle errors
          if (error.code === error.PERMISSION_DENIED) {
            toast.error('Location permission denied. Please click "Allow" to share your location.');
            setPermissionState('denied');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            toast.error('Location unavailable. Please check your device settings.');
          } else if (error.code === error.TIMEOUT) {
            toast.error('Location request timed out. Please try again.');
          } else {
            toast.error('Failed to get your location. Please try again.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error('Error requesting location permission:', error);
      toast.error('Failed to request location permission');
    }
  };

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

  useEffect(() => {
    setIsNotificationsEnabled(!!fcmToken);
  }, [fcmToken]);

  const fetchOrders = async (showLoader = false) => {
    try {
      // Only show loading spinner on initial load or manual refresh
      if (showLoader) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      if (activeStatus === 'available') {
        // Fetch available orders (pending, no driver assigned)
        const response = await driverAPI.getAvailableOrders({ limit: 50 });
        setOrders(response.data?.orders || []);
      } else {
        // Fetch in-progress orders (assigned, picked_up, in_transit)
        // Note: Backend doesn't support multiple status filtering, so we'll fetch all driver orders
        // and filter client-side
        const response = await driverAPI.getMyOrders({ limit: 50 });
        const inProgressOrders = response.data?.orders?.filter((order: DriverOrder) =>
          ['assigned', 'picked_up', 'in_transit'].includes(order.status)
        ) || [];
        setOrders(inProgressOrders);
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
      // Switch to In Progress tab automatically
      setActiveStatus('in_progress');
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

      // If order is completed (delivered), it should be removed from in-progress
      // Silent refresh will handle this automatically
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

      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-11/12 max-w-md bg-white rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable notifications?</h3>
            <p className="text-sm text-gray-700 mb-4">Allow notifications so we can send you new job requests and route updates even when the app is closed.</p>
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 rounded bg-gray-100 text-gray-900 hover:bg-gray-200" onClick={() => setShowNotifModal(false)}>Not now</button>
              <button className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={async () => {
                setShowNotifModal(false);
                const t = await requestToken();
                if (t) {
                  setIsNotificationsEnabled(true);
                  toast.success('Push notifications enabled');
                } else {
                  toast.error('Failed to enable notifications');
                }
              }}>Enable</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Header with Location Toggle */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
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

          {/* Location Tracking Card */}
          <div className={`p-4 rounded-lg border-2 transition-all ${
            isTracking 
              ? 'bg-green-50 border-green-500' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  isTracking ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Location Sharing: {isTracking ? 'ON' : 'OFF'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {isTracking 
                      ? `Last updated: ${lastUpdate?.toLocaleTimeString() || 'Just now'}` 
                      : 'Enable to share your live location with customers'}
                  </p>
                  {locationError && (
                    <p className="text-xs text-red-600 mt-1">⚠️ {locationError}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleLocationToggle}
                variant={isTracking ? 'default' : 'outline'}
                size="sm"
                className={isTracking ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isTracking ? 'Turn Off' : 'Turn On'}
              </Button>
            </div>
          </div>
          {/* Notifications Card */}
          <div className={`mt-3 p-4 rounded-lg border-2 transition-all ${
            isNotificationsEnabled ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-600">{isNotificationsEnabled ? 'Enabled' : 'Disabled'}</p>
                {fcmLoading && <p className="text-xs text-gray-500">Enabling...</p>}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={async () => {
                    if (isNotificationsEnabled) {
                      // Disable: remove token from server (and optionally delete client token)
                      try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api';
                        // If we have a token, remove that specific token; otherwise clear all
                        const body: any = { driverId: user?._id || user?.id };
                        if (fcmToken) body.token = fcmToken;
                        else body.all = true;

                        await fetch(`${apiUrl}/fcm-token`, {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(body),
                        });

                        // Attempt to delete token client-side if messaging available
                        try {
                          if (typeof window !== 'undefined' && (window as any).navigator?.serviceWorker && fcmToken) {
                            const { deleteToken } = await import('firebase/messaging');
                            const { messaging } = await import('../../lib/utils/firebaseConfig');
                            if (messaging) {
                              await deleteToken(messaging);
                            }
                          }
                        } catch (e) {
                          // ignore client-side delete errors
                          console.warn('client deleteToken failed', e);
                        }

                        setIsNotificationsEnabled(false);
                        toast.success('Push notifications disabled');
                      } catch (err) {
                        console.error('Failed to remove FCM token', err);
                        toast.error('Failed to disable notifications');
                      }
                    } else {
                      // Enable: prompt flow
                      if (Notification.permission === 'denied') {
                        toast.error('Notifications are blocked. Please enable them in your browser settings.');
                        return;
                      }

                      if (Notification.permission === 'default') {
                        // show a brief explainer modal before requesting permission
                        setShowNotifModal(true);
                        return;
                      }

                      // Permission already granted
                      const t = await requestToken();
                      if (t) {
                        setIsNotificationsEnabled(true);
                        toast.success('Push notifications enabled');
                      }
                    }
                  }}
                  variant={isNotificationsEnabled ? 'default' : 'outline'}
                  size="sm"
                  className={isNotificationsEnabled ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                >
                  {isNotificationsEnabled ? 'Disable' : 'Enable'}
                </Button>

                {/* Quick copy token button for debugging */}
                {fcmToken && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(fcmToken).then(() => {
                        toast.success('FCM token copied');
                      }).catch(() => toast.error('Failed to copy token'));
                    }}
                  >
                    Copy token
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs - Mobile First */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'available' as OrderStatus, label: 'Pending', icon: Package, count: activeStatus === 'available' ? orders.length : null },
              { key: 'in_progress' as OrderStatus, label: 'In Progress', icon: Navigation, count: activeStatus === 'in_progress' ? orders.length : null },
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveStatus(key)}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-semibold transition-all ${
                  activeStatus === key
                    ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-base">{label}</span>
                {count !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeStatus === key ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    {count} orders
                  </span>
                )}
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
                </div>

                {/* Route Display */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-4 mb-4 border border-gray-200">
                  <div className="space-y-3">
                    {/* Pickup Location */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-blue-600 mb-1">PICKUP</p>
                        <p className="text-sm text-gray-900 font-medium">{order.pickup?.address}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{order.pickup?.contactName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a
                              href={`tel:${order.pickup?.contactPhone}`}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                            >
                              {order.pickup?.contactPhone}
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-auto h-8 px-3 text-xs bg-blue-50 hover:bg-blue-100 border-blue-300"
                              onClick={() => window.location.href = `tel:${order.pickup?.contactPhone}`}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                          </div>
                        </div>
                        {order.pickup?.notes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Pickup Notes:</p>
                            <p className="text-xs text-gray-700">{order.pickup.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Route Line */}
                    <div className="ml-4 border-l-2 border-dashed border-blue-300 h-4"></div>

                    {/* Dropoff Location */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-green-600 mb-1">DROPOFF</p>
                        <p className="text-sm text-gray-900 font-medium">{order.dropoff?.address}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{order.dropoff?.contactName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a
                              href={`tel:${order.dropoff?.contactPhone}`}
                              className="text-sm text-green-600 hover:text-green-700 font-medium underline"
                            >
                              {order.dropoff?.contactPhone}
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-auto h-8 px-3 text-xs bg-green-50 hover:bg-green-100 border-green-300"
                              onClick={() => window.location.href = `tel:${order.dropoff?.contactPhone}`}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                          </div>
                        </div>
                        {order.dropoff?.notes && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs font-semibold text-green-700 mb-1">Dropoff Notes:</p>
                            <p className="text-xs text-gray-700">{order.dropoff.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Get Directions Button */}
                    <button
                      onClick={() => window.open(getRouteDirectionsUrl(
                        order.pickup.coordinates.lat,
                        order.pickup.coordinates.lng,
                        order.dropoff.coordinates.lat,
                        order.dropoff.coordinates.lng
                      ), '_blank')}
                      className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Get Directions</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
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
