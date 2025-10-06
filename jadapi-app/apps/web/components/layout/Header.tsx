'use client';

import Link from 'next/link';
import { Truck, Users, Building2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useAuthStore } from '@/lib/stores/authStore';

export default function Header() {
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href={user ? "/search" : "/"} className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg sm:rounded-xl">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">JadAPI</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  {user.accountType === 'business' ? (
                    <Building2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Users className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                    {user.profile?.name || user.auth?.email || user.email}
                  </span>
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="text-xm sm:text-sm bg-blue-600 hover:bg-blue-700">
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
