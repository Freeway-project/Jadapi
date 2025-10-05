'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Car,
  Package,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'overview' | 'drivers' | 'orders' | 'users' | 'analytics';
  onTabChange: (tab: 'overview' | 'drivers' | 'orders' | 'users' | 'analytics') => void;
}

export default function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'drivers', name: 'Drivers', icon: Car },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-900">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-6 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">JadAPI</h1>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id as any)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-800">
              <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all">
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </button>
              <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all mt-2">
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
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">JadAPI Admin</h1>
          </div>
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
            <div className="w-64 h-full bg-gray-900" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center h-16 px-6 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">JadAPI</h1>
                    <p className="text-xs text-gray-400">Super Admin</p>
                  </div>
                </div>
              </div>
              <nav className="px-4 py-6 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id as any);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
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
