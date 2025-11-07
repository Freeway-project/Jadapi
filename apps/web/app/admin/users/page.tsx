'use client';

import { useState, useEffect } from 'react';
import { adminAPI, User } from '../../../lib/api/admin';
import { Input } from '@workspace/ui/components/input';
import { Users, Search, CheckCircle, XCircle, AlertCircle, Mail, Phone, Building2, User as UserIcon, Calendar, DollarSign } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [searchQuery, statusFilter, accountTypeFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        accountType: accountTypeFilter || undefined,
        limit: 100,
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
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

  const getAccountTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      individual: { bg: 'bg-blue-100', text: 'text-blue-800', icon: UserIcon },
      business: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Building2 },
    };

    const style = styles[type] || styles.individual;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {type}
      </span>
    );
  };

  const getVerificationBadge = (verified?: string) => {
    if (!verified) {
      return <span className="text-xs text-gray-400">Not verified</span>;
    }
    return (
      <span className="inline-flex items-center text-xs text-green-600">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Users className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <p className="text-sm text-gray-600">{total} total users</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 text-sm"
          />
        </div>
        <select
          value={accountTypeFilter}
          onChange={(e) => setAccountTypeFilter(e.target.value)}
          className="h-10 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Types</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
        </select>
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

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-sm text-gray-600">
              {searchQuery || statusFilter || accountTypeFilter ? 'Try adjusting your filters' : 'No users in the system yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Account Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Stats</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.profile?.name}</div>
                          {user.accountType === 'business' && user.profile?.businessName && (
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <Building2 className="w-3 h-3 mr-1" />
                              {user.profile.businessName}
                            </div>
                          )}
                          {user.profile?.gstNumber && (
                            <div className="text-xs text-gray-500 mt-1">
                              GST: {user.profile.gstNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="space-y-1">
                        {user.auth?.email && (
                          <div className="flex items-center text-xs text-gray-900">
                            <Mail className="w-3 h-3 mr-1.5 text-gray-400" />
                            <span className="truncate max-w-[200px]">{user.auth.email}</span>
                            <span className="ml-1.5">{getVerificationBadge(user.auth.emailVerifiedAt)}</span>
                          </div>
                        )}
                        {user.auth?.phone && (
                          <div className="flex items-center text-xs text-gray-900">
                            <Phone className="w-3 h-3 mr-1.5 text-gray-400" />
                            <span>{user.auth.phone}</span>
                            <span className="ml-1.5">{getVerificationBadge(user.auth.phoneVerifiedAt)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      {getAccountTypeBadge(user.accountType)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        {getStatusIcon(user.status)}
                        <span className={`text-xs sm:text-sm font-medium capitalize ${
                          user.status === 'active' ? 'text-green-800' :
                          user.status === 'suspended' ? 'text-yellow-800' :
                          'text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                      {user.stats ? (
                        <div className="text-xs space-y-1">
                          <div className="text-gray-900">
                            {user.stats.totalOrders} orders
                          </div>
                          <div className="flex items-center text-green-600">
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            {user.stats.totalSpent?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No activity</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-xs text-gray-500 hidden xl:table-cell">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(user.createdAt).toLocaleTimeString()}
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
