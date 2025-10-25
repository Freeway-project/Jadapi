'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/stores/authStore';
import { userAPI, type DashboardData } from '../../lib/api/user';
import Header from '../../components/layout/Header';
import { Package, TruckIcon, CheckCircle, Clock, Loader2, FileText, Receipt } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import toast from 'react-hot-toast';

type TabType = 'orders' | 'invoices';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to view dashboard');
      router.push('/auth/signin');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Filter paid orders for invoices
  const paidOrders = dashboardData?.recentOrders?.filter(order => order.paymentStatus === 'paid') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Welcome Section - Hidden on mobile */}
        <div className="hidden sm:block mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {dashboardData?.user.name || 'User'}!</h1>
          <p className="text-gray-600 mt-2">Here's your delivery overview</p>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 sm:py-4 px-4 text-sm sm:text-base font-medium text-center transition-colors ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Orders</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex-1 py-3 sm:py-4 px-4 text-sm sm:text-base font-medium text-center transition-colors ${
                activeTab === 'invoices'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Invoices</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Grid - Only show on Orders tab */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{dashboardData?.stats.totalOrders || 0}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{dashboardData?.stats.activeOrders || 0}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Done</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{dashboardData?.stats.completedOrders || 0}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Spent</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    ${((dashboardData?.stats.totalSpent || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/search')}
                className="text-xs sm:text-sm"
              >
                New Order
              </Button>
            </div>

            {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                          <span className="font-mono text-xs sm:text-sm font-semibold text-gray-900">
                            {order.orderId}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Pickup</p>
                              <p className="text-xs sm:text-sm text-gray-900 truncate">{order.pickup.address}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">Dropoff</p>
                              <p className="text-xs sm:text-sm text-gray-900 truncate">{order.dropoff.address}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-2 sm:mt-3">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          ${((order.pricing?.total || 0) / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{order.pricing?.currency || 'CAD'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Start by creating your first delivery order</p>
                <Button onClick={() => router.push('/search')}>
                  Create Order
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab Content */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Invoices</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Paid orders with invoice details</p>
            </div>

            {paidOrders && paidOrders.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {paidOrders.map((order) => (
                  <div key={order._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          <span className="font-mono text-xs sm:text-sm font-semibold text-gray-900">
                            {order.orderId}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          ${((order.pricing?.total || 0) / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{order.pricing?.currency || 'CAD'}</p>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="space-y-2 text-xs sm:text-sm bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Fare</span>
                        <span className="font-medium text-gray-900">
                          ${((order.pricing?.baseFare || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">
                          ${((order.pricing?.subtotal || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium text-gray-900">
                          ${((order.pricing?.tax || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      {order.pricing?.couponDiscount && order.pricing.couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">
                            -${((order.pricing.couponDiscount) / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-900">Total Paid</span>
                        <span className="font-bold text-gray-900">
                          ${((order.pricing?.total || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">From</p>
                          <p className="text-xs sm:text-sm text-gray-900 truncate">{order.pickup.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">To</p>
                          <p className="text-xs sm:text-sm text-gray-900 truncate">{order.dropoff.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <Receipt className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Invoices will appear here after payment</p>
                <Button onClick={() => router.push('/search')}>
                  Create Order
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
