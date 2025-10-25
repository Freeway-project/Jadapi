'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/stores/authStore';
import { userAPI, type UserData } from '../../lib/api/user';
import Header from '../../components/layout/Header';
import { User, Mail, Phone, MapPin, Briefcase, Building2, Loader2, LogOut } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to view profile');
      router.push('/auth/signin');
      return;
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userAPI.getProfile();
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                {profile?.accountType === 'business' ? (
                  <Building2 className="w-12 h-12 text-blue-600" />
                ) : (
                  <User className="w-12 h-12 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-6 px-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.profile?.name || 'User'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.accountType === 'business'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {profile?.accountType === 'business' ? 'Business Account' : 'Individual Account'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {profile?.status?.charAt(0).toUpperCase()}{profile?.status?.slice(1)}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">
                  {profile?.auth?.email || profile?.email || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base font-medium text-gray-900">
                  {profile?.auth?.phone || profile?.phone || 'Not provided'}
                </p>
              </div>
            </div>

            {profile?.profile?.address && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-base font-medium text-gray-900">
                    {profile.profile.address}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Information (if business account) */}
        {profile?.accountType === 'business' && profile?.businessProfile && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
            </div>

            <div className="p-6 space-y-4">
              {profile.businessProfile.businessName && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="text-base font-medium text-gray-900">
                      {profile.businessProfile.businessName}
                    </p>
                  </div>
                </div>
              )}

              {profile.businessProfile.gstNumber && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="text-base font-medium text-gray-900 font-mono">
                      {profile.businessProfile.gstNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">User ID</span>
              <span className="text-sm font-mono font-medium text-gray-900">{profile?.uuid}</span>
            </div>

            {profile?.createdAt && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}

            {profile?.roles && profile.roles.length > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Role</span>
                <div className="flex gap-2">
                  {profile.roles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/search')}
          >
            New Order
          </Button>
        </div>
      </div>
    </div>
  );
}
