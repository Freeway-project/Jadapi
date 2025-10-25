'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Car,
  Package,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  Truck,
  Tag,
  Power,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { adminAPI } from '../../lib/api/admin';
import toast from 'react-hot-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAppActive, setIsAppActive] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { href: '/admin/dashboard', name: 'Overview', icon: LayoutDashboard },
    { href: '/admin/drivers', name: 'Drivers', icon: Car },
    { href: '/admin/orders', name: 'Orders', icon: Package },
    { href: '/admin/users', name: 'Users', icon: Users },
    { href: '/admin/coupons', name: 'Coupons', icon: Tag },
    { href: '/admin/early-access', name: 'Early Access', icon: Users },
    { href: '/admin/sms-usage', name: 'SMS Usage', icon: MessageSquare },
    { href: '/admin/analytics', name: 'Analytics', icon: BarChart3 },
  ];

  // Fetch app config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await adminAPI.getAppConfig();
        setIsAppActive(config?.appActive ?? false);
      } catch (error) {
        console.error('Failed to fetch app config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleToggleAppActive = async () => {
    const newStatus = !isAppActive;
    setIsToggling(true);

    try {
      await adminAPI.updateAppActiveStatus(newStatus);
      setIsAppActive(newStatus);
      toast.success(`App is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update app status');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-900">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center h-16 flex-shrink-0 px-6 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">JadDPI</h1>
                <p className="text-xs text-gray-400">{user?.displayName || 'Admin'}</p>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-800 space-y-3">
              {/* App Active Toggle - Only show when user is logged in */}
              {user && (
                <div className="px-4 py-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">App Status</span>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : (
                      <span className={`text-xs font-bold ${isAppActive ? 'text-green-400' : 'text-red-400'}`}>
                        {isAppActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleToggleAppActive}
                    disabled={isToggling || isLoading}
                    className={`w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      isAppActive
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        {isAppActive ? 'Deactivate App' : 'Activate App'}
                      </>
                    )}
                  </button>
                </div>
              )}

              <Link href="/admin/settings" className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all">
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar for mobile */}
        <div className="lg:hidden flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4">
          <Link href="/admin/dashboard" className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">JadDPI Admin</h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="w-64 h-full bg-gray-900 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <Link href="/admin/dashboard" className="flex items-center h-16 px-6 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">JadDPI</h1>
                    <p className="text-xs text-gray-400">{user?.displayName || 'Admin'}</p>
                  </div>
                </div>
              </Link>
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Bottom section */}
              <div className="flex-shrink-0 px-4 py-4 border-t border-gray-800 space-y-3">
                {/* App Active Toggle - Only show when user is logged in */}
                {user && (
                  <div className="px-4 py-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-400">App Status</span>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <span className={`text-xs font-bold ${isAppActive ? 'text-green-400' : 'text-red-400'}`}>
                          {isAppActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleToggleAppActive}
                      disabled={isToggling || isLoading}
                      className={`w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isAppActive
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Power className="mr-2 h-4 w-4" />
                          {isAppActive ? 'Deactivate' : 'Activate'}
                        </>
                      )}
                    </button>
                  </div>
                )}

                <Link href="/admin/settings" onClick={() => setSidebarOpen(false)} className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all">
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
