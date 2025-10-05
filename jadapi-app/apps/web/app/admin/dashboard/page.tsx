'use client';

import { useEffect, useState } from 'react';
import { adminAPI, DashboardStats, Activity, Order, SystemMetrics } from '@/lib/api/admin';
import { Package, Users, DollarSign, Activity as ActivityIcon, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsData, activityData, ordersData, metricsData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentActivity(10),
        adminAPI.getActiveOrders(10),
        adminAPI.getSystemMetrics(),
      ]);

      setStats(statsData);
      setActivities(activityData.activities);
      setOrders(ordersData.orders);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your delivery platform</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.users.total || 0}
            subtitle={`${stats?.users.active || 0} active`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Orders"
            value={stats?.orders.active || 0}
            subtitle={`${stats?.orders.pending || 0} pending`}
            icon={Package}
            color="green"
          />
          <StatCard
            title="Revenue (Month)"
            value={`$${(stats?.revenue.month || 0).toFixed(2)}`}
            subtitle={`$${(stats?.revenue.week || 0).toFixed(2)} this week`}
            icon={DollarSign}
            color="purple"
          />
          <StatCard
            title="Orders (Today)"
            value={stats?.orders.today || 0}
            subtitle={`${stats?.orders.week || 0} this week`}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* System Metrics */}
        {metrics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricItem label="API Calls (24h)" value={metrics.apiCalls24h.toLocaleString()} />
              <MetricItem label="Error Rate" value={`${metrics.errorRate24h}%`} />
              <MetricItem label="Avg Response" value={`${metrics.avgResponseTime}ms`} />
              <MetricItem label="Uptime" value={formatUptime(metrics.uptime)} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <ActivityIcon className="w-5 h-5 mr-2" />
                Recent Activity
              </h2>
            </div>
            <div className="divide-y">
              {activities.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No activity yet</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action} {activity.resource}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.userId?.profile.displayName || 'System'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{activity.method}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.endpoint}</span>
                      {activity.statusCode && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className={`text-xs ${activity.statusCode >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                            {activity.statusCode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Active Orders
              </h2>
            </div>
            <div className="divide-y">
              {orders.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No active orders</p>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">#{order.orderId}</p>
                        <p className="text-xs text-gray-500">{order.userId?.profile.displayName}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>From: {order.pickup.address}</p>
                      <p>To: {order.dropoff.address}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {order.pricing.currency} ${order.pricing.total.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
