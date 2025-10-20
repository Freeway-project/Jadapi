'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Package, ArrowRight, Locate, MapPinned } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import AddressAutocomplete from '../auth/AddressAutocomplete';
import { deliveryAPI, FareEstimateResponse } from '@/lib/api/delivery';
import { useSearchStore } from '@/lib/stores/searchStore';
import { FareEstimateModal } from '../booking/FareEstimateModal';
import toast from 'react-hot-toast';

interface Location {
  lat: number;
  lng: number;
}

interface FromToSearchProps {
  onEstimate?: (estimate: FareEstimateResponse, additionalData?: {
    pickupAddress: string;
    dropoffAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    packageSize: string;
  }) => void;
  showPackageDetails?: boolean;
  className?: string;
  prefillFromLastSearch?: boolean;
  onAddressChange?: (pickup: string, dropoff: string, pickupCoords?: Location, dropoffCoords?: Location) => void;
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
  className = '',
  prefillFromLastSearch = false,
  onAddressChange
}: FromToSearchProps) {
  const { addSearch, getLastSearch } = useSearchStore();
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    type: 'small'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<{
    estimate: FareEstimateResponse,
    details: {
      pickupAddress: string;
      dropoffAddress: string;
      pickupLat: number;
      pickupLng: number;
      dropoffLat: number;
      dropoffLng: number;
      packageSize: string;
    }
  } | null>(null);

  // Prefill from last search if enabled
  useEffect(() => {
    if (prefillFromLastSearch) {
      const lastSearch = getLastSearch();
      if (lastSearch) {
        setFromAddress(lastSearch.fromAddress);
        setToAddress(lastSearch.toAddress);
        setPackageDetails({
          type: lastSearch.packageType,
          description: lastSearch.packageDescription
        });
      }
    }
  }, [prefillFromLastSearch, getLastSearch]);

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
    if (!fromAddress || !toAddress) {
      toast.error('Please enter both pickup and dropoff addresses');
      return;
    }

    setIsLoading(true);

    try {
      const pickupCoords = await geocodeAddress(fromAddress);
      const dropoffCoords = await geocodeAddress(toAddress);

      const packageSize = packageSizeMap[packageDetails.type];

      const estimate = await deliveryAPI.getFareEstimate({
        pickup: pickupCoords,
        dropoff: dropoffCoords,
        packageSize,
      });

      if (!estimate?.data?.fare) {
        throw new Error('Invalid response from server');
      }

      // Save search to local storage
      addSearch({
        fromAddress,
        toAddress,
        fromCoords: pickupCoords,
        toCoords: dropoffCoords,
        packageType: packageDetails.type,
        packageDescription: packageDetails.description,
        estimatedFare: estimate?.data?.fare?.total
      });

      // Store the current estimate and show modal
      const estimateDetails = {
        pickupAddress: fromAddress,
        dropoffAddress: toAddress,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        dropoffLat: dropoffCoords.lat,
        dropoffLng: dropoffCoords.lng,
        packageSize: packageSize,
      };

      setCurrentEstimate({
        estimate,
        details: estimateDetails
      });

      // Pass addresses and coordinates to parent component
      onAddressChange?.(fromAddress, toAddress, pickupCoords, dropoffCoords);

      // Show modal first (user sees fare estimate)
      setShowEstimateModal(true);
    } catch (err: any) {
      console.error('Fare estimate error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to get estimate. Please try again.';
      toast.error(errorMessage);
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
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-500 p-3 sm:p-6 space-y-3 
    sm:space-y-2 max-w-2xl mx-auto ${className}`}>
      {/* Address Selection */}
      <div className="space-y-3 sm:space-y-5">
        {/* Pickup Address */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100">
              <Locate className="w-3.5 h-3.5 text-green-600" />
            </div>
            <Label className="text-xs sm:text-base font-semibold text-gray-900">Pickup Location</Label>
          </div>
          <AddressAutocomplete
            value={fromAddress}
            onChange={setFromAddress}
            label=''
            placeholder="Enter pickup address"
            className="h-11 sm:h-14 text-sm sm:text-lg rounded-xl"

          />
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center -my-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
            <ArrowRight className="w-4 h-4 text-gray-600 rotate-90" />
          </div>
        </div>

        {/* Dropoff Address */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
              <MapPinned className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <Label className="text-xs sm:text-base font-semibold text-gray-900">Dropoff Location</Label>
          </div>
          <AddressAutocomplete
            value={toAddress}
            label=''
            onChange={setToAddress}
            placeholder="Enter dropoff address"
            className="h-11 sm:h-14 text-sm sm:text-lg rounded-xl"

          />
        </div>
      </div>

      {/* Package Details */}
      {showPackageDetails && (
        <div className="space-y-2 sm:space-y-4 pt-1">
          {/* Package Type Selection */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100">
                <Package className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <Label className="text-xs sm:text-base font-semibold text-gray-900">Package Size</Label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {packageTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setPackageDetails({ ...packageDetails, type: type.id as PackageDetails['type'] })}
                  className={`p-2 sm:p-4 rounded-xl transition-all border-2 ${
                    packageDetails.type === type.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-0.5">
                    <span className="text-lg sm:text-2xl">{type.icon}</span>
                    <div className="font-semibold text-[10px] sm:text-sm">{type.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          {/* <div>
            <Label htmlFor="description" className="text-sm sm:text-base font-semibold text-gray-900 mb-3 block">
              Package Description <span className="text-gray-400 font-normal text-sm">(Optional)</span>
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="What are you sending?"
              value={packageDetails.description || ''}
              onChange={(e) => setPackageDetails({ ...packageDetails, description: e.target.value })}
              className="h-12 sm:h-14 text-base sm:text-lg rounded-xl border-2 border-gray-200 focus:border-blue-600"
            />
          </div> */}
        </div>
      )}

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={!fromAddress || !toAddress || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold h-11 sm:h-14 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-lg shadow-lg"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Getting estimate...</span>
          </div>
        ) : (
          <span>Get Price Estimate</span>
        )}
      </Button>

      {/* Fare Estimate Modal */}
      {currentEstimate && (
        <FareEstimateModal
          isOpen={showEstimateModal}
          onClose={() => setShowEstimateModal(false)}
          pickup={currentEstimate.details.pickupAddress}
          dropoff={currentEstimate.details.dropoffAddress}
          estimatedFare={{
            total: currentEstimate.estimate.data.fare.total,
            distance: currentEstimate.estimate.data.fare.distanceKm,
            duration: currentEstimate.estimate.data.fare.durationMinutes,
            currency: 'CAD'
          }}
          onProceedToBooking={() => {
            // User is logged in and wants to proceed - now trigger parent callback
            onEstimate?.(currentEstimate.estimate, currentEstimate.details);
          }}
        />
      )}
    </div>
  );
}