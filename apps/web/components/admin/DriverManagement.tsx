'use client';

import { useState, useEffect } from 'react';
import { adminAPI, Driver, CreateDriverData } from '../../lib/api/admin';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { UserPlus, Search, CheckCircle, XCircle, AlertCircle, Car, Bell, X } from 'lucide-react';

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [formData, setFormData] = useState<CreateDriverData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: '',
    licenseNumber: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Notification modal state
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [notifyData, setNotifyData] = useState({ title: '', body: '' });
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);

  useEffect(() => {
    loadDrivers();
  }, [searchQuery, statusFilter]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDrivers({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        limit: 50,
      });
      setDrivers(data.drivers);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.name) {
      setFormError('Driver name is required');
      return;
    }

    if (!formData.address) {
      setFormError('Driver address is required');
      return;
    }

    if (!formData.email && !formData.phone) {
      setFormError('Either email or phone is required');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setFormError('Password is required and must be at least 6 characters');
      return;
    }

    try {
      await adminAPI.createDriver(formData);
      setFormSuccess('Driver created successfully!');
      setFormData({
        name: '',
        address: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: '',
        licenseNumber: '',
      });
      setShowCreateForm(false);
      loadDrivers();
    } catch (error: any) {
      setFormError(error.message || 'Failed to create driver');
    }
  };

  const handleUpdateStatus = async (driverId: string, status: 'active' | 'suspended' | 'deleted') => {
    try {
      await adminAPI.updateDriverStatus(driverId, status);
      loadDrivers();
    } catch (error: any) {
      alert(error.message || 'Failed to update driver status');
    }
  };

  const handleOpenNotifyModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setNotifyData({ title: '', body: '' });
    setNotifyError(null);
    setNotifySuccess(null);
    setShowNotifyModal(true);
  };

  const handleCloseNotifyModal = () => {
    setShowNotifyModal(false);
    setSelectedDriver(null);
    setNotifyData({ title: '', body: '' });
    setNotifyError(null);
    setNotifySuccess(null);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    setNotifyError(null);
    setNotifySuccess(null);

    if (!notifyData.title || !notifyData.body) {
      setNotifyError('Title and message are required');
      return;
    }

    try {
      setNotifyLoading(true);
      await adminAPI.notifyDriver(selectedDriver._id, {
        title: notifyData.title,
        body: notifyData.body,
      });
      setNotifySuccess('Notification sent successfully!');
      setTimeout(() => {
        handleCloseNotifyModal();
      }, 1500);
    } catch (error: any) {
      setNotifyError(error.message || 'Failed to send notification');
    } finally {
      setNotifyLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'deleted':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-2">
          <Car className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Driver Management</h2>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
          size="sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Driver
        </Button>
      </div>

      {/* Success Message */}
      {formSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-green-800">{formSuccess}</p>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Create New Driver</h3>
          <form onSubmit={handleCreateDriver} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Driver Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 h-10 text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address *</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main St, City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 h-10 text-sm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="driver@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 h-10 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={10}
                  placeholder="6041234567"
                  value={formData.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: digits });
                  }}
                  className="mt-1 h-10 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 h-10 text-sm"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="vehicleType" className="text-sm font-medium text-gray-700">Vehicle Type</Label>
                <Input
                  id="vehicleType"
                  type="text"
                  placeholder="Sedan, Van, etc."
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="mt-1 h-10 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">License Number</Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="ABC123456"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="mt-1 h-10 text-sm"
                />
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{formError}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="w-full sm:w-auto text-sm"
                size="sm"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm" size="sm">
                Create Driver
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search drivers..."
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
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Drivers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading drivers...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Car className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Drivers Found</h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchQuery || statusFilter ? 'Try adjusting your filters' : 'Create your first driver to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Contact</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Created</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="text-sm font-medium text-gray-900">{driver.profile?.name}</div>
                      <div className="text-xs text-gray-500 sm:hidden">{driver.auth.email || driver.auth.phone}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{driver.auth.email}</div>
                      <div className="text-xs text-gray-500">{driver.auth.phone}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center space-x-1.5">
                        {getStatusIcon(driver.status)}
                        <span className={`text-xs sm:text-sm font-medium capitalize ${
                          driver.status === 'active' ? 'text-green-800' :
                          driver.status === 'suspended' ? 'text-yellow-800' :
                          'text-red-800'
                        }`}>
                          {driver.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                        {driver.status !== 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(driver._id, 'active')}
                            className="text-xs h-8"
                          >
                            Activate
                          </Button>
                        )}
                        {driver.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(driver._id, 'suspended')}
                            className="text-xs h-8 text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                          >
                            Suspend
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenNotifyModal(driver)}
                          className="text-xs h-8 text-blue-700 border-blue-300 hover:bg-blue-50"
                          title="Send notification"
                        >
                          <Bell className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotifyModal && selectedDriver && (
        <div className="fixed inset-0 bg-blur-50  bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Send Notification</h3>
              </div>
              <button
                onClick={handleCloseNotifyModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Send notification to: <span className="font-medium text-gray-900">{selectedDriver.profile?.name}</span>
                </p>
              </div>

              <div>
                <Label htmlFor="notif-title" className="text-sm font-medium text-gray-700">
                  Title *
                </Label>
                <Input
                  id="notif-title"
                  type="text"
                  placeholder="e.g., New ride request"
                  value={notifyData.title}
                  onChange={(e) => setNotifyData({ ...notifyData, title: e.target.value })}
                  className="mt-1 h-10 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                  required
                  disabled={notifyLoading}
                />
              </div>

              <div>
                <Label htmlFor="notif-body" className="text-sm font-medium text-gray-700">
                  Message *
                </Label>
                <textarea
                  id="notif-body"
                  placeholder="e.g., You have a new ride request nearby"
                  value={notifyData.body}
                  onChange={(e) => setNotifyData({ ...notifyData, body: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  rows={3}
                  required
                  disabled={notifyLoading}
                />
              </div>

              {notifySuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">{notifySuccess}</p>
                </div>
              )}

              {notifyError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{notifyError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseNotifyModal}
                  className="flex-1 text-sm"
                  disabled={notifyLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                  disabled={notifyLoading}
                >
                  {notifyLoading ? 'Sending...' : 'Send Notification'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
