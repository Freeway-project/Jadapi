'use client';

import { useState } from 'react';
import { MapPin, Navigation, Clock, Package } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import AddressAutocomplete from '../auth/AddressAutocomplete';
import { deliveryAPI, FareEstimateResponse } from '@/lib/api/delivery';

interface FromToSearchProps {
  onEstimate?: (estimate: FareEstimateResponse) => void;
  showPackageDetails?: boolean;
  className?: string;
}

interface PackageDetails {
  type: 'envelope' | 'small' | 'medium' | 'large';
  weight?: string;
  description?: string;
}

const packageSizeMap = {
  'envelope': 'XS',
  'small': 'S',
  'medium': 'M',
  'large': 'L'
} as const;

export default function FromToSearch({
  onEstimate,
  showPackageDetails = false,
  className = ''
}: FromToSearchProps) {
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    type: 'small'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    if (!window.google?.maps) {
      throw new Error('Google Maps not loaded');
    }

    const geocoder = new window.google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  };

  const handleSearch = async () => {
    if (!fromAddress || !toAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const pickupCoords = await geocodeAddress(fromAddress);
      const dropoffCoords = await geocodeAddress(toAddress);

      const packageSize = packageSizeMap[packageDetails.type];

      const estimate = await deliveryAPI.getFareEstimate({
        pickup: pickupCoords,
        dropoff: dropoffCoords,
        packageSize,
      });

      onEstimate?.(estimate);
    } catch (err: any) {
      console.error('Fare estimate error:', err);
      setError(err.message || 'Failed to get estimate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const packageTypes = [
    { id: 'envelope', label: 'Envelope', icon: '📄' },
    { id: 'small', label: 'Small', icon: '📦' },
    { id: 'medium', label: 'Medium', icon: '📦' },
    { id: 'large', label: 'Large', icon: '📦' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 sm:p-4 space-y-2 max-w-2xl mx-auto ${className}`}>
      {/* Address Selection */}
      <div className="space-y-2">
        {/* From Address */}
        <AddressAutocomplete
          value={fromAddress}
          onChange={setFromAddress}
          label='From'
          placeholder="Pickup location"
          className="h-11 sm:h-12 text-base rounded-lg"
        />

        {/* To Address */}
        <AddressAutocomplete
          value={toAddress}
          label='To'
          onChange={setToAddress}
          placeholder="Drop-off location"
          className="h-11 sm:h-12 text-base rounded-lg"
        />
      </div>

      {/* Package Details */}
      {showPackageDetails && (
        <div className="space-y-2 pt-1">
          {/* Package Type Selection */}
          <div className="grid grid-cols-4 gap-2">
            {packageTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setPackageDetails({ ...packageDetails, type: type.id as PackageDetails['type'] })}
                className={`p-2 sm:p-3 rounded-lg transition-all ${
                  packageDetails.type === type.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-0.5">
                  <span className="text-lg sm:text-xl">{type.icon}</span>
                  <div className="font-medium text-[10px] sm:text-xs">{type.label}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Description */}
          <Input
            id="description"
            type="text"
            placeholder="What are you sending?"
            value={packageDetails.description || ''}
            onChange={(e) => setPackageDetails({ ...packageDetails, description: e.target.value })}
            className="h-11 sm:h-12 text-base rounded-lg bg-gray-50 border-0"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={!fromAddress || !toAddress || isLoading}
        className="w-full bg-black hover:bg-gray-800 text-white font-semibold h-11 sm:h-12 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Finding routes...</span>
          </div>
        ) : (
          <span>See prices</span>
        )}
      </Button>
    </div>
  );
}