'use client';

import { useEffect, useState } from 'react';
import { Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactSubmission {
  id: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if token is in localStorage
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAdminToken(token);
      setIsAuthenticated(true);
      fetchContacts(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;
    
    localStorage.setItem('admin_token', token);
    setAdminToken(token);
    setIsAuthenticated(true);
    fetchContacts(token);
  };

  const fetchContacts = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contact/admin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          setIsAuthenticated(false);
          toast.error('Invalid token');
          return;
        }
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setContacts(data.contacts);
    } catch (error) {
      toast.error('Failed to fetch contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/contact/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setContacts(contacts.map(c => c.id === id ? { ...c, read: true } : c));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await fetch('/api/contact/admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      setContacts(contacts.filter(c => c.id !== id));
      toast.success('Deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setAdminToken('');
    setContacts([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Token
              </label>
              <input
                type="password"
                id="token"
                name="token"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter admin token"
              />
              <p className="text-xs text-gray-500 mt-2">
                Token: Check ADMIN_TOKEN environment variable
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Submissions</h1>
            <p className="text-gray-600 mt-1">{contacts.length} total messages</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  contact.read ? 'opacity-75' : 'border-l-4 border-blue-600'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {contact.read ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-blue-600" />
                      )}
                      <p className="font-semibold text-gray-900">{contact.email}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(contact.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!contact.read && (
                      <button
                        onClick={() => handleMarkAsRead(contact.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
