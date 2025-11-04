'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FromToSearch from '../../components/search/FromToSearch';
import Header from '../../components/layout/Header';
import MapView from '../../components/map/MapView';
import { FareEstimateResponse } from '../../lib/api/delivery';
import { BaseAnimation } from '../../components/animations';

interface Location {
  lat: number;
  lng: number;
}

export default function SearchPage() {
  const router = useRouter();
  const [pickupLocation, setPickupLocation] = useState<Location | undefined>();
  const [dropoffLocation, setDropoffLocation] = useState<Location | undefined>();

  const handleEstimate = (estimateData: FareEstimateResponse, additionalData?: {
    pickupAddress: string;
    dropoffAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    packageSize: string;
  }) => {
    if (!additionalData) return;

    // This callback is only triggered from the FareEstimateModal's "Proceed to Booking" button
    // which already handles authentication check, so we can proceed directly
    navigateToBooking(estimateData, additionalData);
  };

  const navigateToBooking = (estimateData: FareEstimateResponse, additionalData: any) => {
    // Navigate to booking page with required data
    const fare = estimateData.data.fare;
    const params = new URLSearchParams({
      pickupAddress: additionalData.pickupAddress,
      dropoffAddress: additionalData.dropoffAddress,
      pickupLat: additionalData.pickupLat.toString(),
      pickupLng: additionalData.pickupLng.toString(),
      dropoffLat: additionalData.dropoffLat.toString(),
      dropoffLng: additionalData.dropoffLng.toString(),
      packageSize: additionalData.packageSize,
      distance: estimateData.data.distance?.distanceKm?.toString() || '0',
      duration: estimateData.data.distance?.durationMinutes?.toString() || '0',
      // Simplified fare breakdown
      baseFare: fare?.baseFare?.toString() || '0',
      tax: fare?.tax?.toString() || '0',
      total: fare?.total?.toString() || '0',
      currency: fare?.currency || 'CAD',
    });

    router.push(`/booking?${params.toString()}`);
  };

  const handleAddressChange = (
    pickup: string,
    dropoff: string,
    pickupCoords?: Location,
    dropoffCoords?: Location
  ) => {
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
        <div className="flex-1 flex flex-col lg:hidden overflow-y-auto">
          {/* Animation & Text - Top Section */}
          <div className="min-h-[45vh] relative bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center px-4 py-6">
            <div className="w-full max-w-sm">
              <div className="text-center">
                <BaseAnimation
                  animationFile="global-delivery.json"
                  width={280}
                  height={280}
                  className="mx-auto mb-4"
                />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Fast & Reliable Delivery</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Get instant price estimates and book your delivery in minutes
                </p>
              </div>
            </div>
          </div>

          {/* Search Form - Bottom Section */}
          <div className="flex-1 bg-gray-50 px-4 py-6">
            <FromToSearch
              onEstimate={handleEstimate}
              showPackageDetails={true}
              prefillFromLastSearch={true}
              className="w-full max-w-md mx-auto"
              onAddressChange={handleAddressChange}
            />
          </div>
        </div>

        {/* ========== DESKTOP LAYOUT ========== */}
        <div className="hidden lg:flex flex-1">
          {/* Search Sidebar */}
          <div className="w-[480px] bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Book a Delivery</h1>
                <p className="text-gray-600">Enter your pickup and delivery locations</p>
              </div>
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
        </div>
      </main>
    </div>
  );
}
