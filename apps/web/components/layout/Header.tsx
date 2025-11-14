'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, Users, Building2, LogOut, ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAuthStore } from '../../lib/stores/authStore';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  // Determine the correct dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/dashboard';
    
    // Check roles array
    if (user.roles?.includes('admin')) return '/admin/dashboard';
    if (user.roles?.includes('driver')) return '/driver';
    
    // Default to user dashboard
    return '/dashboard';
  };

  const dashboardUrl = getDashboardUrl();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
    setShowDropdown(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href={user ? "/" : "/"} className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg sm:rounded-xl">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">Jaddpi</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link href={dashboardUrl} className="hidden sm:block">
                  <Button size="sm" className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white">
                    Dashboard
                  </Button>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {user.accountType === 'business' ? (
                        <Building2 className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Users className="w-4 h-4 text-green-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden sm:block">
                        {user.profile?.name || user.auth?.email || user.email || 'User'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.profile?.name || user.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.auth?.email || user.email || user.auth?.phone || user.phone}
                          </p>
                        </div>

                        {/* Dashboard Link - Mobile Only */}
                        <Link
                          href={dashboardUrl}
                          className="sm:hidden block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowDropdown(false)}
                        >
                          Dashboard
                        </Link>

                        {/* Track Order Link - Only for non-drivers */}
                        {!user.roles?.includes('driver') && (
                          <Link
                            href="/dashboard?tab=track"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>Track Order</span>
                            </div>
                          </Link>
                        )}

                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link href="/auth/signin">
                  <Button size="sm" className="text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white sm:px-6">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white sm:px-6">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
