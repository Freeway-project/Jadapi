'use client';

import { useState, useEffect } from 'react';
import { adminAPI, Order } from '../../../lib/api/admin';
import { Input } from '@workspace/ui/components/input';
import { Package, Search, CheckCircle, Clock, XCircle, MapPin, User, DollarSign, ArrowUpDown, ArrowUp, ArrowDown, FileText } from 'lucide-react';

type SortField = 'createdAt' | 'orderId' | 'total' | 'status';
type SortOrder = 'asc' | 'desc';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    loadOrders();
  }, [searchQuery, statusFilter, paymentFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllOrders({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined,
        limit: 100,
      });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      'driver-assigned': { bg: 'bg-purple-100', text: 'text-purple-800', icon: User },
      'in-transit': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Package },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };

    const style = styles[status] ?? styles.pending;
    const Icon = style?.icon ?? Clock;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style?.bg ?? 'bg-gray-100'} ${style?.text ?? 'text-gray-800'}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('-', ' ')}
      </span>
    );
  };

  const getPaymentBadge = (status?: string) => {
    if (!status) return null;

    const styles: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      paid: { bg: 'bg-green-100', text: 'text-green-800' },
      failed: { bg: 'bg-red-100', text: 'text-red-800' },
    };

    const style = styles[status] ?? styles.pending;

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style?.bg ?? 'bg-gray-100'} ${style?.text ?? 'text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />;
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let compareA: any;
    let compareB: any;

    switch (sortField) {
      case 'createdAt':
        compareA = new Date(a.createdAt).getTime();
        compareB = new Date(b.createdAt).getTime();
        break;
      case 'orderId':
        compareA = a.orderId.toLowerCase();
        compareB = b.orderId.toLowerCase();
        break;
      case 'total':
        compareA = a.pricing?.total || 0;
        compareB = b.pricing?.total || 0;
        break;
      case 'status':
        compareA = a.status.toLowerCase();
        compareB = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
    if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Package className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
            <p className="text-sm text-gray-600">{total} total orders</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by order ID, user, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="driver-assigned">Driver Assigned</option>
          <option value="in-transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-10 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-sm text-gray-600">
              {searchQuery || statusFilter || paymentFilter ? 'Try adjusting your filters' : 'No orders in the system yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('orderId')}
                  >
                    <div className="flex items-center gap-2">
                      Order ID
                      {getSortIcon('orderId')}
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Route</th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Payment</th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      {getSortIcon('total')}
                    </div>
                  </th>
                  <th
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden 2xl:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                      {order.driver && (
                        <div className="text-xs text-gray-500 mt-1">
                          Driver: {order.driver.profile?.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-gray-900">{order.userId?.profile?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.userId?.auth?.phone || order.userId?.auth?.email}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <div className="text-xs space-y-1 max-w-xs">
                        <div className="flex items-start">
                          <MapPin className="w-3 h-3 text-green-600 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-900 truncate">{order.pickup?.address}</span>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="w-3 h-3 text-red-600 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-900 truncate">{order.dropoff?.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        {((order.pricing?.total || 0) / 100).toFixed(2)}
                      </div>
                      {order.distance && (
                        <div className="text-xs text-gray-500 mt-1">
                          {order.distance.distanceKm?.toFixed(1)} km
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-xs text-gray-500 hidden xl:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden 2xl:table-cell">
                      <div className="space-y-1 max-w-xs">
                        {order.driverNote && (
                          <div className="flex items-start gap-1">
                            <FileText className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate" title={order.driverNote}>
                              Driver: {order.driverNote}
                            </span>
                          </div>
                        )}
                        {order.adminNote && (
                          <div className="flex items-start gap-1">
                            <FileText className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate" title={order.adminNote}>
                              Admin: {order.adminNote}
                            </span>
                          </div>
                        )}
                        {!order.driverNote && !order.adminNote && (
                          <span className="text-xs text-gray-400">No notes</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
