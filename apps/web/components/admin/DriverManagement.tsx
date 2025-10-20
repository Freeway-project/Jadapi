'use client';

import { useState, useEffect } from 'react';
import { adminAPI, Driver, CreateDriverData } from '../../lib/api/admin';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { UserPlus, Search, CheckCircle, XCircle, AlertCircle, Car } from 'lucide-react';

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [formData, setFormData] = useState<CreateDriverData>({
    displayName: '',
    email: '',
    phone: '',
    vehicleType: '',
    licenseNumber: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

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

    if (!formData.displayName) {
      setFormError('Driver name is required');
      return;
    }

    if (!formData.email && !formData.phone) {
      setFormError('Either email or phone is required');
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
                <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">Driver Name *</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
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
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 h-10 text-sm"
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
                      <div className="text-sm font-medium text-gray-900">{driver.profile.displayName}</div>
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
