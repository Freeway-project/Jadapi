'use client';

import { useState } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import FromToSearch from '@/components/search/FromToSearch';
import BookingFlow from '@/components/booking/BookingFlow';
import Header from '@/components/layout/Header';
import MapView from '@/components/map/MapView';
import { useAuthStore } from '@/lib/stores/authStore';
import { FareEstimateResponse } from '@/lib/api/delivery';
import Link from 'next/link';
import { BaseAnimation } from '@/components/animations';


interface Location {
  lat: number;
  lng: number;
}

export default function HomePage() {
  const { user } = useAuthStore();
  const [estimate, setEstimate] = useState<FareEstimateResponse | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | undefined>();
  const [dropoffLocation, setDropoffLocation] = useState<Location | undefined>();

  const handleEstimate = (estimateData: FareEstimateResponse) => {
    setEstimate(estimateData);
    if (user) {
      setShowBooking(true);
    }
  };

  const handleBackToEstimate = () => {
    setShowBooking(false);
  };

  const handleBackToSearch = () => {
    setEstimate(null);
    setShowBooking(false);
  };

  const handleBookingComplete = () => {
    setEstimate(null);
    setShowBooking(false);
  };

  const handleAddressChange = (pickup: string, dropoff: string, pickupCoords?: Location, dropoffCoords?: Location) => {
    setPickupAddress(pickup);
    setDropoffAddress(dropoff);
    setPickupLocation(pickupCoords);
    setDropoffLocation(dropoffCoords);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ========== MOBILE LAYOUT ========== */}
        <div className="flex-1 flex flex-col lg:hidden">

          {/* SCREEN 1: Search Screen (No Estimate) */}
          {!estimate && (
            <>
              {/* Animation & Text - Top 40% */}
              <div className="h-[50vh] relative bg-gradient-to-b from-blue-200 to-white flex flex-col items-center justify-center p-2">
                <div className="w-full max-w-md">
                  <div className="text-center -mt-24">
                 <BaseAnimation animationFile="global-delivery.json" width={250} height={250} className="mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-900">Fast & Reliable Delivery</h2>
                    <p className="text-gray-600">Get instant price estimates and book your delivery in minutes</p>
                  </div>
                </div>
              </div>

              {/* Search Form - Bottom 60% (No Scroll) */}
              <div className="flex-1 bg-gray-50 flex items-center h-[60vh] p-1 overflow-hidden relative bottom-20 left-0 right-0 z-10">
                <FromToSearch
                  onEstimate={handleEstimate}
                  showPackageDetails={true}
                  prefillFromLastSearch={true}
                  className="w-full"
                  onAddressChange={handleAddressChange}
                />
              </div>
            </>
          )}

          {/* SCREEN 2: Estimate/Booking Screen */}
          {estimate && (
            <>
              {/* Map - Top 20vh */}
              <div className="h-[20vh] relative">
                <MapView
                  pickupLocation={pickupLocation}
                  dropoffLocation={dropoffLocation}
                  className="w-full h-full"
                />

                {/* Back Button Overlay */}
                <button
                  onClick={handleBackToSearch}
                  className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg z-10"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Content - Bottom 80vh */}
              <div className="h-[80vh] bg-white overflow-y-auto">
                <div className="h-full flex flex-col p-4">
                  {showBooking && user ? (
                    <div className="flex-1 overflow-y-auto">
                      <BookingFlow
                        estimate={estimate}
                        pickupAddress={pickupAddress}
                        dropoffAddress={dropoffAddress}
                        onBack={handleBackToEstimate}
                        onComplete={handleBookingComplete}
                      />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col space-y-3">
                      {/* Estimate Summary - Compact */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 shrink-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Delivery Estimate</h3>
                            <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{estimate?.data.distance.durationMinutes} min</span>
                              </span>
                              <span>•</span>
                              <span>{estimate?.data.distance.distanceKm} km</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              ${(estimate?.data.fare.total / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-600">{estimate?.data.fare.currency}</div>
                          </div>
                        </div>
                      </div>

                      {/* Fare Breakdown - Scrollable */}
                      <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200 overflow-y-auto min-h-0">
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Fare Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Base fare</span>
                            <span className="font-medium text-gray-900">${(estimate?.data.fare.baseFare / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Distance ({estimate?.data.fare.distanceKm} km)</span>
                            <span className="font-medium text-gray-900">${(estimate?.data.fare.distanceFare / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Time ({estimate?.data.fare.durationMinutes} min)</span>
                            <span className="font-medium text-gray-900">${(estimate?.data.fare.timeFare / 100).toFixed(2)}</span>
                          </div>
                          {estimate?.data.fare.tax > 0 && (
                            <div className="flex justify-between text-gray-600">
                              <span>Tax</span>
                              <span className="font-medium text-gray-900">${(estimate?.data.fare.tax / 100).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold text-gray-900">
                            <span>Total</span>
                            <span className="text-blue-600">${(estimate?.data.fare.total / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Fixed at Bottom */}
                      <div className="space-y-3 pt-2 shrink-0">
                        {user ? (
                          <Button
                            onClick={() => setShowBooking(true)}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-base font-medium shadow-lg"
                          >
                            Book This Delivery
                          </Button>
                        ) : (
                          <Link href="/auth/signup" className="block w-full">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-base font-medium shadow-lg">
                              Sign Up to Book
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ========== DESKTOP LAYOUT ========== */}
        <div className="hidden lg:flex flex-1">
          {/* Search Sidebar */}
          <div className="w-[480px] bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              <FromToSearch
                onEstimate={handleEstimate}
                showPackageDetails={true}
                prefillFromLastSearch={true}
                className="w-full"
                onAddressChange={handleAddressChange}
              />
            </div>
          </div>

          {/* Map Center */}
          <div className="flex-1 relative">
            <MapView
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              className="w-full h-full"
            />
          </div>

          {/* Results/Booking Sidebar */}
          {estimate && (
            <div className="w-[480px] bg-white border-l border-gray-200 overflow-y-auto">
              {showBooking && user ? (
                <div className="p-6">
                  <BookingFlow
                    estimate={estimate}
                    pickupAddress={pickupAddress}
                    dropoffAddress={dropoffAddress}
                    onBack={handleBackToEstimate}
                    onComplete={handleBookingComplete}
                  />
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Estimate Summary Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Delivery Estimate</h3>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          ${(estimate?.data.fare.total / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">{estimate?.data.fare.currency}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-700">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{estimate?.data.distance.durationMinutes} min</span>
                      </span>
                      <span>•</span>
                      <span>{estimate?.data.distance.distanceKm} km</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {user ? (
                      <>
                        <Button
                          onClick={() => setShowBooking(true)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-base font-medium"
                        >
                          Book This Delivery
                        </Button>
                        <Button variant="outline" className="w-full py-3">
                          Save Estimate
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/signup" className="block w-full">
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-base font-medium">
                            Sign Up to Book
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full py-3"
                          onClick={() => setEstimate(null)}
                        >
                          New Estimate
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Estimate Details */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Fare Breakdown</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Base fare</span>
                        <span className="font-medium text-gray-900">${(estimate?.data.fare.baseFare / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Distance ({estimate?.data.fare.distanceKm} km)</span>
                        <span className="font-medium text-gray-900">${(estimate?.data.fare.distanceFare / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Time ({estimate?.data.fare.durationMinutes} min)</span>
                        <span className="font-medium text-gray-900">${(estimate?.data.fare.timeFare / 100).toFixed(2)}</span>
                      </div>
                      {estimate?.data.fare.bandLabel && (
                        <div className="flex justify-between text-gray-600">
                          <span>Distance band: {estimate?.data.fare.bandLabel}</span>
                          <span className="font-medium text-gray-900">{estimate?.data.fare.bandMultiplier}x</span>
                        </div>
                      )}
                      {estimate?.data.fare.sizeMultiplier !== 1 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Package size multiplier</span>
                          <span className="font-medium text-gray-900">{estimate?.data.fare.sizeMultiplier}x</span>
                        </div>
                      )}
                      {estimate?.data.fare.tax > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Tax</span>
                          <span className="font-medium text-gray-900">${(estimate?.data.fare.tax / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
                        <span>Total</span>
                        <span className="text-blue-600">${(estimate?.data.fare.total / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
