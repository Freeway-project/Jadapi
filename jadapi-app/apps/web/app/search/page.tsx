'use client';

import { useState } from 'react';
import { Truck, Users, Building2, Star, Shield, Clock } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import FromToSearch from '@/components/search/FromToSearch';
import DeliveryMap from '@/components/search/DeliveryMap';
import { useAuthStore } from '@/lib/stores/authStore';
import Link from 'next/link';

interface DeliveryEstimate {
  fromAddress: string;
  toAddress: string;
  distance: number;
  estimatedTime: number;
  price: number;
  packageDetails?: any;
}

export default function SearchPage() {
  const { user } = useAuthStore();
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (fromAddress: string, toAddress: string, packageDetails?: any) => {
    setIsLoading(true);

    // Simulate API call for estimate calculation
    setTimeout(() => {
      const mockEstimate: DeliveryEstimate = {
        fromAddress,
        toAddress,
        distance: Math.round((Math.random() * 20 + 5) * 10) / 10, // 5-25 km
        estimatedTime: Math.round(Math.random() * 40 + 20), // 20-60 minutes
        price: Math.round((Math.random() * 30 + 15) * 100) / 100, // $15-45
        packageDetails
      };
      setEstimate(mockEstimate);
      setIsLoading(false);
    }, 1500);
  };

  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Fast Delivery',
      description: 'Same-day delivery within Vancouver'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Insured',
      description: 'Your packages are protected'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Rated Drivers',
      description: '5-star rated professional drivers'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JadAPI Delivery</span>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {user.accountType === 'business' ? (
                      <Building2 className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Users className="w-4 h-4 text-green-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.profile?.displayName || user.auth?.email}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Search */}
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Fast & Reliable Delivery
                <span className="block text-blue-600">Across Vancouver</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Get instant estimates and book your delivery in minutes.
                Professional drivers, competitive rates, real-time tracking.
              </p>
            </div>

            {/* Search Component */}
            <FromToSearch
              onSearch={handleSearch}
              showPackageDetails={!user || user.accountType === 'individual'}
              className="w-full"
            />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-blue-600 mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Business CTA */}
            {(!user || user.accountType === 'individual') && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <Building2 className="w-8 h-8" />
                  <div>
                    <h3 className="text-xl font-bold">Business Account</h3>
                    <p className="text-blue-100">Multiple deliveries, bulk pricing, priority support</p>
                  </div>
                </div>
                <Link href="/auth">
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                    Upgrade to Business
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Map & Results */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculating Route</h3>
                <p className="text-gray-600">Finding the best delivery option for you...</p>
              </div>
            ) : estimate ? (
              <div className="space-y-6">
                {/* Delivery Map */}
                <DeliveryMap
                  fromAddress={estimate.fromAddress}
                  toAddress={estimate.toAddress}
                  estimatedTime={estimate.estimatedTime}
                  distance={estimate.distance}
                  price={estimate.price}
                />

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user ? (
                    <>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                        Book This Delivery
                      </Button>
                      <Button variant="outline" className="w-full py-3">
                        Save Estimate
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth" className="w-full">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                          Sign Up to Book
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full py-3">
                        Get More Estimates
                      </Button>
                    </>
                  )}
                </div>

                {/* Estimate Details */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Estimate Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base delivery fee</span>
                      <span className="font-medium">${(estimate.price * 0.7).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance charge ({estimate.distance} km)</span>
                      <span className="font-medium">${(estimate.price * 0.2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">${(estimate.price * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>${estimate.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <Truck className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Deliver</h3>
                <p className="text-gray-600">Enter pickup and delivery addresses to get an instant estimate</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}