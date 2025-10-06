'use client';

import { useState, useRef, useEffect } from 'react';
import { Truck, Users, Building2, Star, Shield, Clock } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import FromToSearch from '@/components/search/FromToSearch';
import BookingFlow from '@/components/booking/BookingFlow';
import { useAuthStore } from '@/lib/stores/authStore';
import { FareEstimateResponse } from '@/lib/api/delivery';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuthStore();
  const [estimate, setEstimate] = useState<FareEstimateResponse | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const estimateRef = useRef<HTMLDivElement>(null);

  const handleEstimate = (estimateData: FareEstimateResponse) => {
    setEstimate(estimateData);
    // If user is authenticated, show booking flow automatically
    if (user) {
      setShowBooking(true);
    }
  };

  const handleBackToEstimate = () => {
    setShowBooking(false);
  };

  const handleBookingComplete = () => {
    // TODO: Navigate to order tracking or dashboard
    setEstimate(null);
    setShowBooking(false);
  };

  useEffect(() => {
    if (estimate && estimateRef.current) {
      setTimeout(() => {
        estimateRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [estimate]);

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
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg sm:rounded-xl">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">JadAPI</span>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="hidden sm:flex items-center space-x-2">
                    {user.accountType === 'business' ? (
                      <Building2 className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Users className="w-4 h-4 text-green-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                      {user.profile?.displayName || user.auth?.email}
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
                    <Button size="sm" className="text-xs sm:text-sm">
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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Search */}
          <div className="space-y-4 sm:space-y-6">
            {/* Hero Section */}
            <div className="text-center lg:text-left px-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Fast & Reliable Delivery
                <span className="block text-blue-600">Across Vancouver</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 mb-4 sm:mb-6 lg:mb-8">
                Get instant estimates and book your delivery in minutes.
                Professional drivers, competitive rates, real-time tracking.
              </p>
            </div>

            {/* Search Component */}
            <FromToSearch
              onEstimate={handleEstimate}
              showPackageDetails={true}
              prefillFromLastSearch={true}
              className="w-full"
            />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100">
                  <div className="text-blue-600 mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Map & Results */}
          <div ref={estimateRef} className="space-y-4 sm:space-y-6">
            {estimate && showBooking && user ? (
              // Show booking flow for authenticated users
              <BookingFlow
                estimate={estimate}
                onBack={handleBackToEstimate}
                onComplete={handleBookingComplete}
              />
            ) : estimate ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Estimate Summary Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Delivery Estimate</h3>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                        ${(estimate?.data.fare.total / 100).toFixed(2)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">{estimate?.data.fare.currency}</div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-4">
                    <div className="flex items-center justify-between py-2 sm:py-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <span className="text-sm sm:text-base text-gray-700">Estimated Time</span>
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-gray-900">{estimate?.data.distance.durationMinutes} min</span>
                    </div>

                    <div className="flex items-center justify-between py-2 sm:py-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-base text-gray-700">Distance</span>
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-gray-900">{estimate?.data.distance.distanceKm} km</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user ? (
                    <>
                      <Button
                        onClick={() => setShowBooking(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm sm:text-base"
                      >
                        Book This Delivery
                      </Button>
                      <Button variant="outline" className="w-full py-3 text-sm sm:text-base">
                        Save Estimate
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/signup" className="w-full">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm sm:text-base">
                          Sign Up to Book
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full py-3 text-sm sm:text-base"
                        onClick={() => setEstimate(null)}
                      >
                        New Estimate
                      </Button>
                    </>
                  )}
                </div>

                {/* Estimate Details */}
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Fare Breakdown</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base fare</span>
                      <span className="font-medium">${(estimate?.data.fare.baseFare / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance charge ({estimate?.data.fare.distanceKm} km)</span>
                      <span className="font-medium">${(estimate?.data.fare.distanceFare / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time charge ({estimate?.data.fare.durationMinutes} min)</span>
                      <span className="font-medium">${(estimate?.data.fare.timeFare / 100).toFixed(2)}</span>
                    </div>
                    {estimate?.data.fare.bandLabel && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Distance band: {estimate?.data.fare.bandLabel}</span>
                        <span className="font-medium">{estimate?.data.fare.bandMultiplier}x</span>
                      </div>
                    )}
                    {estimate?.data.fare.sizeMultiplier !== 1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Package size multiplier</span>
                        <span className="font-medium">{estimate?.data.fare.sizeMultiplier}x</span>
                      </div>
                    )}
                    {estimate?.data.fare.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">${(estimate?.data.fare.tax / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>${(estimate?.data.fare.total / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
                <Truck className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Ready to Deliver</h3>
                <p className="text-sm sm:text-base text-gray-600">Enter pickup and delivery addresses to get an instant estimate</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}