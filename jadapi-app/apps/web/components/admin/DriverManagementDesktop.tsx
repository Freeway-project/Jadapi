'use client';

import { useState, useEffect } from 'react';
import { adminAPI, Driver, CreateDriverData } from '@/lib/api/admin';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { UserPlus, Search, CheckCircle, XCircle, AlertCircle, Car, Mail, Phone, Calendar } from 'lucide-react';

export default function DriverManagementDesktop() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [formData, setFormData] = useState<CreateDriverData>({
    displayName: '',
    email: '',
    phone: '',
    vehicleType: '',
    licenseNumber: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, [searchQuery, statusFilter]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDrivers({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        limit: 100,
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
    setIsSubmitting(true);

    if (!formData.displayName) {
      setFormError('Driver name is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.email && !formData.phone) {
      setFormError('Either email or phone is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.password) {
      setFormError('Password is required');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== confirmPassword) {
      setFormError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await adminAPI.createDriver(formData);
      setFormSuccess('Driver created successfully!');
      setFormData({
        displayName: '',
        email: '',
        phone: '',
        vehicleType: '',
        licenseNumber: '',
        password: '',
      });
      setConfirmPassword('');
      setTimeout(() => {
        setShowCreateModal(false);
        setFormSuccess(null);
      }, 1500);
      loadDrivers();
    } catch (error: any) {
      setFormError(error.message || 'Failed to create driver');
    } finally {
      setIsSubmitting(false);
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

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      deleted: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status === 'active' && <CheckCircle className="w-3 h-3 mr-1.5" />}
        {status === 'suspended' && <AlertCircle className="w-3 h-3 mr-1.5" />}
        {status === 'deleted' && <XCircle className="w-3 h-3 mr-1.5" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
              <p className="text-sm text-gray-600">Manage your delivery drivers</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Driver
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
          <p className="text-sm text-gray-600">Total Drivers</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {drivers.filter(d => d.status === 'active').length}
          </p>
          <p className="text-sm text-gray-600">Active Drivers</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {drivers.filter(d => d.status === 'suspended').length}
          </p>
          <p className="text-sm text-gray-600">Suspended</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {drivers.filter(d => {
              const createdDate = new Date(d.createdAt);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - createdDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 7;
            }).length}
          </p>
          <p className="text-sm text-gray-600">New This Week</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-gray-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 px-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading drivers...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-16 text-center">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Drivers Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter ? 'Try adjusting your filters' : 'Get started by adding your first driver'}
            </p>
            {!searchQuery && !statusFilter && (
              <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Driver
              </Button>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {driver.profile.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{driver.profile.displayName}</div>
                        <div className="text-xs text-gray-500">ID: {driver.uuid.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      {driver.auth.email && (
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {driver.auth.email}
                        </div>
                      )}
                      {driver.auth.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {driver.auth.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(driver.status)}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {new Date(driver.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-5 text-right space-x-2">
                    {driver.status !== 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(driver._id, 'active')}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Activate
                      </Button>
                    )}
                    {driver.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(driver._id, 'suspended')}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      >
                        Suspend
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Driver Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Driver</h2>
                  <p className="text-sm text-gray-600">Create a new driver account</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="mt-2 h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="driver@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (234) 567-8900"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-2 h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleType" className="text-sm font-medium text-gray-700">
                    Vehicle Type
                  </Label>
                  <Input
                    id="vehicleType"
                    type="text"
                    placeholder="Sedan, Van, Truck..."
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">
                    License Number
                  </Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    placeholder="ABC123456"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Email or phone is required for login. Password must be at least 6 characters. The driver will be created with an active status.
                </p>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              )}

              {formSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">{formSuccess}</p>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-12"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Driver'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
