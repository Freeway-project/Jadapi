'use client';

import { useState, useRef, useEffect } from 'react';
import { Truck, Star, Shield, Clock } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import FromToSearch from '@/components/search/FromToSearch';
import BookingFlow from '@/components/booking/BookingFlow';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/lib/stores/authStore';
import { FareEstimateResponse } from '@/lib/api/delivery';
import Link from 'next/link';
import { BaseAnimation } from '@/components/animations';

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
      <Header />

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
                  <BaseAnimation animationFile="truck-delivery-service.json" width={250} height={250} className="mx-auto mb-6" />

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