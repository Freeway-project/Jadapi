'use client';

import { useState, useEffect } from 'react';
import { adminAPI, Order } from '../../../lib/api/admin';
import { Input } from '@workspace/ui/components/input';
import {
  XCircle,
  Search,
  MapPin,
  User,
  DollarSign,
  Calendar,
  FileText,
  Save,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CancelledOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [editingNote, setEditingNote] = useState<{ orderId: string; note: string } | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadCancelledOrders();
  }, []);

  const loadCancelledOrders = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getCancelledOrders({ limit: 100 });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load cancelled orders:', error);
      toast.error('Failed to load cancelled orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.userId?.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.userId?.auth?.phone?.includes(searchQuery) ||
    order.userId?.auth?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveNote = async (orderId: string, note: string) => {
    try {
      setSavingNote(true);
      await adminAPI.updateAdminNote(orderId, note);

      // Update local state
      setOrders(orders.map(o =>
        o.orderId === orderId ? { ...o, adminNote: note } : o
      ));

      setEditingNote(null);
      toast.success('Admin note saved successfully');
    } catch (error) {
      console.error('Failed to save admin note:', error);
      toast.error('Failed to save admin note');
    } finally {
      setSavingNote(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <XCircle className="w-7 h-7 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cancelled Orders</h2>
            <p className="text-sm text-gray-600">{total} cancelled orders - For refund processing</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by order ID, customer name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm"
          />
        </div>
      </div>

      {/* Alert Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Refund Processing Information</h4>
            <p className="text-sm text-blue-800">
              This page shows all cancelled orders with complete information for refund processing.
              Use the "Admin Note" field to track refund status, amounts, and reasons.
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading cancelled orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cancelled Orders</h3>
            <p className="text-sm text-gray-600">
              {searchQuery ? 'No cancelled orders match your search' : 'No cancelled orders found'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order._id} className="p-4 sm:p-6 hover:bg-gray-50">
                {/* Order Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-gray-900">{order.orderId}</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Cancelled
                      </span>
                      {order.paymentStatus === 'paid' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Paid - Refund Required
                        </span>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{order.userId?.profile?.name || 'N/A'}</span>
                      <span>•</span>
                      <span>{order.userId?.auth?.phone || order.userId?.auth?.email}</span>
                    </div>

                    {/* Driver Info */}
                    {order.driver && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <User className="w-4 h-4" />
                        <span>Driver: {order.driver.profile?.name}</span>
                        {order.driver.auth?.phone && <span>({order.driver.auth.phone})</span>}
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Cancelled: {formatDateTime(order.timeline?.cancelledAt)}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-2 text-right">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      ${((order.pricing?.total || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Route Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500">Pickup</p>
                        <p className="text-sm text-gray-900">{order.pickup?.address}</p>
                        {order.pickup?.contactName && (
                          <p className="text-xs text-gray-600 mt-1">
                            {order.pickup.contactName} • {order.pickup.contactPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500">Dropoff</p>
                        <p className="text-sm text-gray-900">{order.dropoff?.address}</p>
                        {order.dropoff?.contactName && (
                          <p className="text-xs text-gray-600 mt-1">
                            {order.dropoff.contactName} • {order.dropoff.contactPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Driver Note (Read-only) */}
                  {order.driverNote && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-900">Driver Note</span>
                      </div>
                      <p className="text-sm text-blue-800">{order.driverNote}</p>
                    </div>
                  )}

                  {/* Admin Note (Editable) */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-900">Admin Note (Refund)</span>
                      </div>
                      {editingNote?.orderId !== order.orderId && (
                        <button
                          onClick={() => setEditingNote({ orderId: order.orderId, note: order.adminNote || '' })}
                          className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                        >
                          {order.adminNote ? 'Edit' : 'Add Note'}
                        </button>
                      )}
                    </div>

                    {editingNote?.orderId === order.orderId ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingNote.note}
                          onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                          placeholder="Add refund details, amount, reason, etc..."
                          className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveNote(order.orderId, editingNote.note)}
                            disabled={savingNote}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {savingNote ? 'Saving...' : 'Save Note'}
                          </button>
                          <button
                            onClick={() => setEditingNote(null)}
                            className="px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-800">
                        {order.adminNote || 'No admin note yet. Click "Add Note" to track refund status.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
