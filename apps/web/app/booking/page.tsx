'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookingFlow from '../../components/booking/BookingFlow';
import EarlyAccessForm from '../../components/booking/EarlyAccessForm';
import { appConfigAPI } from '../../lib/api/appConfig';
import { tokenManager } from '../../lib/api/client';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isAppActive, setIsAppActive] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = tokenManager.getToken();
    if (!token) {
      toast.error('Please sign in to continue');
      router.push('/search');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Get search params
  const pickupAddress = searchParams.get('pickupAddress') || '';
  const dropoffAddress = searchParams.get('dropoffAddress') || '';
  const pickupLat = searchParams.get('pickupLat');
  const pickupLng = searchParams.get('pickupLng');
  const dropoffLat = searchParams.get('dropoffLat');
  const dropoffLng = searchParams.get('dropoffLng');
  const packageSize = searchParams.get('packageSize') || 'M';
  const distance = searchParams.get('distance');
  const duration = searchParams.get('duration');
  // Fare params - only subtotal, tax, and total
  const subtotal = searchParams.get('subtotal');
  const tax = searchParams.get('tax');
  const total = searchParams.get('total');

  // Check app status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await appConfigAPI.checkAppStatus();
        if(response === null || response.data === undefined) {
          toast.error('Failed to retrieve app status. Please try again later.');
          setIsAppActive(false);
        }
        setIsAppActive(response?.data?.appActive ?? true);
      } catch (error) {
        console.error('Failed to check app status:', error);
        // Default to active if check fails
        setIsAppActive(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  // Validate required params
  useEffect(() => {
    if (!isLoading && (!pickupAddress || !dropoffAddress || !pickupLat || !pickupLng || !dropoffLat || !dropoffLng)) {
      router.push('/search');
    }
  }, [isLoading, pickupAddress, dropoffAddress, pickupLat, pickupLng, dropoffLat, dropoffLng, router]);

  // Loading or auth check
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 font-medium">
            {!isAuthenticated ? 'Verifying authentication...' : 'Checking service availability...'}
          </p>
        </div>
      </div>
    );
  }

  // Show early access form if app is inactive
  if (isAppActive === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8 px-4">
        <EarlyAccessForm
          pickupAddress={pickupAddress}
          dropoffAddress={dropoffAddress}
          estimatedFare={{
            distance: distance ? parseFloat(distance) : undefined,
            total: total ? parseFloat(total) / 100 : undefined,
          }}
        />
      </div>
    );
  }

  // Show booking flow if app is active
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <BookingFlow
        initialPickup={{
          address: pickupAddress,
          lat: parseFloat(pickupLat!),
          lng: parseFloat(pickupLng!),
        }}
        initialDropoff={{
          address: dropoffAddress,
          lat: parseFloat(dropoffLat!),
          lng: parseFloat(dropoffLng!),
        }}
        initialPackageSize={packageSize as 'XS' | 'S' | 'M' | 'L'}
        initialFareEstimate={{
          distance: distance ? parseFloat(distance) : 0,
          duration: duration ? parseFloat(duration) : 0,
          subtotal: subtotal ? parseFloat(subtotal) : undefined,
          tax: tax ? parseFloat(tax) : undefined,
          total: total ? parseFloat(total) : 0,
        }}
      />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
