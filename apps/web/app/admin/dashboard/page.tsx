'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, DashboardStats, Activity, Order, SystemMetrics, User } from '../../../lib/api/admin';
import { Package, Users, DollarSign, Activity as ActivityIcon, TrendingUp, Clock, LogOut, Search, Filter, ChevronLeft, ChevronRight, Eye, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { useAuthStore } from '../../../lib/stores/authStore';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'orders' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadAllOrders();
    } else if (activeTab === 'users') {
      loadAllUsers();
    }
  }, [activeTab, searchQuery, statusFilter]);

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

  const loadAllOrders = async () => {
    setOrdersLoading(true);
    try {
      const filters: any = { limit: 100 };
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (searchQuery) filters.search = searchQuery;

      const data = await adminAPI.getAllOrders(filters);
      setAllOrders(data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setUsersLoading(true);
    try {
      const filters: any = { limit: 100 };
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (searchQuery) filters.search = searchQuery;

      const data = await adminAPI.getAllUsers(filters);
      setAllUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage orders, users, and system settings</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1">
            {[
              { key: 'overview' as Tab, label: 'Overview', icon: TrendingUp },
              { key: 'orders' as Tab, label: 'All Orders', icon: Package },
              { key: 'users' as Tab, label: 'Users', icon: Users },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} activities={activities} orders={orders} metrics={metrics} />}
        {activeTab === 'orders' && (
          <OrdersTab
            orders={allOrders}
            loading={ordersLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        )}
        {activeTab === 'users' && (
          <UsersTab
            users={allUsers}
            loading={usersLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats, activities, orders, metrics }: {
  stats: DashboardStats | null;
  activities: Activity[];
  orders: Order[];
  metrics: SystemMetrics | null;
}) {
  return (
    <div className="space-y-6">
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">System Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricItem label="API Calls (24h)" value={metrics.apiCalls24h.toLocaleString()} />
            <MetricItem label="Error Rate" value={`${metrics.errorRate24h}%`} />
            <MetricItem label="Avg Response" value={`${metrics.avgResponseTime}ms`} />
            <MetricItem label="Uptime" value={formatUptime(metrics.uptime)} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center">
              <ActivityIcon className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {activities.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No activity yet</p>
            ) : (
              activities.map((activity) => (
                <div key={activity._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action} {activity.resource}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.userId?.profile?.name || 'System'}
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
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Active Orders
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {orders.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No active orders</p>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{order.orderId}</p>
                      <p className="text-xs text-gray-500">{order.userId?.profile?.name}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
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
    <div className="text-center p-4 bg-gray-50 rounded-xl">
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

// Orders Tab Component
function OrdersTab({ orders, loading, searchQuery, setSearchQuery, statusFilter, setStatusFilter }: {
  orders: Order[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}) {
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order ID, customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dropoff</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-mono font-medium text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{order.userId?.profile?.name || 'N/A'}</div>
                        <div className="text-gray-500 text-xs">{order.userId?.auth?.phone || order.userId?.auth?.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">{order.pickup.address}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">{order.dropoff.address}</td>
                    <td className="px-4 py-4 text-sm">
                      {order.driver ? (
                        <div>
                          <div className="font-medium text-gray-900">{order.driver.profile.name}</div>
                          <div className="text-gray-500 text-xs">{order.driver.auth.phone}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{order.package?.size || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {order.distance?.distanceKm ? `${order.distance.distanceKm.toFixed(1)} km` : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      ${(order.pricing.total / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ users, loading, searchQuery, setSearchQuery, statusFilter, setStatusFilter }: {
  users: User[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}) {
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      deleted: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">
                      <div className="font-medium text-gray-900">{user.profile.name}</div>
                      {user.profile.businessName && (
                        <div className="text-xs text-gray-500">{user.profile.businessName}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm capitalize text-gray-600">{user.accountType}</td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{user.auth.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{user.auth.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <span key={role} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                      {user.stats?.totalOrders || 0}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-semibold">
                      ${((user.stats?.totalSpent || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Showing {users.length} user{users.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
