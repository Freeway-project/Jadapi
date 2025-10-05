import { Shield } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Super Admin</h1>
                <p className="text-xs text-gray-400">Jadapi Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/admin/dashboard" className="hover:text-gray-300 transition">
                Dashboard
              </a>
              <a href="/admin/users" className="hover:text-gray-300 transition">
                Users
              </a>
              <a href="/admin/orders" className="hover:text-gray-300 transition">
                Orders
              </a>
              <a href="/admin/activity" className="hover:text-gray-300 transition">
                Activity
              </a>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
