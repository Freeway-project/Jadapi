'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '../../../lib/api/admin';
import { Button } from '@workspace/ui/components/button';

import { Phone, Mail, MapPin, Calendar, Loader2, Badge } from 'lucide-react';
import toast from 'react-hot-toast';

interface EarlyAccessRequest {
  _id: string;
  pickupAddress: string;
  dropoffAddress: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  estimatedFare?: {
    distance?: number;
    total?: number;
    currency?: string;
  };
  notes?: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export default function EarlyAccessPage() {
  const [requests, setRequests] = useState<EarlyAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const filters = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const response = await adminAPI.getEarlyAccessRequests(filters);
      setRequests(response?.data?.requests || []);
    } catch (error) {
      console.error('Failed to fetch early access requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    setUpdatingStatus(requestId);
    try {
      await adminAPI.updateEarlyAccessRequestStatus(requestId, newStatus);
      toast.success('Status updated successfully');
      fetchRequests();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Early Access Requests</h1>
        <p className="text-gray-600 mt-1">Manage and respond to early access requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex gap-2">
            {['all', 'pending', 'contacted', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No early access requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{request.contactName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{formatDate(request.createdAt)}</span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(request.status)} border`}>
                  {request.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <a href={`tel:${request.contactPhone}`} className="text-sm text-blue-600 hover:underline">
                        {request.contactPhone}
                      </a>
                    </div>
                  </div>
                  {request.contactEmail && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <a href={`mailto:${request.contactEmail}`} className="text-sm text-blue-600 hover:underline">
                          {request.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Route Info */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Pickup</p>
                      <p className="text-sm text-gray-900">{request.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Dropoff</p>
                      <p className="text-sm text-gray-900">{request.dropoffAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare Info */}
              {request.estimatedFare && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Estimated Fare</p>
                  <div className="flex items-center gap-4">
                    {request.estimatedFare.distance && (
                      <span className="text-sm text-gray-900">
                        <strong>{request.estimatedFare.distance.toFixed(2)}</strong> km
                      </span>
                    )}
                    {request.estimatedFare.total && (
                      <span className="text-sm text-gray-900">
                        <strong>{request.estimatedFare.currency || 'CAD'} ${(request.estimatedFare.total / 100).toFixed(2)}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {request.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-700 font-medium mb-1">Notes</p>
                  <p className="text-sm text-blue-900">{request.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {request.status !== 'contacted' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(request._id, 'contacted')}
                    disabled={updatingStatus === request._id}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    {updatingStatus === request._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Mark as Contacted'
                    )}
                  </Button>
                )}
                {request.status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(request._id, 'completed')}
                    disabled={updatingStatus === request._id}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    {updatingStatus === request._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Mark as Completed'
                    )}
                  </Button>
                )}
                {request.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(request._id, 'cancelled')}
                    disabled={updatingStatus === request._id}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {updatingStatus === request._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Cancel'
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
