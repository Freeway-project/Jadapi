'use client';

import { useState } from 'react';
import { MapPin, Navigation, ArrowUpDown, Clock, Package } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import AddressAutocomplete from '../auth/AddressAutocomplete';

interface FromToSearchProps {
  onSearch?: (fromAddress: string, toAddress: string, packageDetails?: PackageDetails) => void;
  showPackageDetails?: boolean;
  className?: string;
}

interface PackageDetails {
  type: 'envelope' | 'small' | 'medium' | 'large';
  weight?: string;
  description?: string;
}

export default function FromToSearch({
  onSearch,
  showPackageDetails = false,
  className = ''
}: FromToSearchProps) {
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    type: 'small'
  });
  const [isSwapped, setIsSwapped] = useState(false);

  const handleSwapAddresses = () => {
    const temp = fromAddress;
    setFromAddress(toAddress);
    setToAddress(temp);
    setIsSwapped(!isSwapped);
  };

  const handleSearch = () => {
    if (fromAddress && toAddress) {
      onSearch?.(fromAddress, toAddress, showPackageDetails ? packageDetails : undefined);
    }
  };

  const packageTypes = [
    { id: 'envelope', label: 'Envelope', icon: '📄', description: 'Documents, letters' },
    { id: 'small', label: 'Small', icon: '📦', description: 'Up to 5kg' },
    { id: 'medium', label: 'Medium', icon: '📦', description: 'Up to 15kg' },
    { id: 'large', label: 'Large', icon: '📦', description: 'Up to 30kg' },
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-600 rounded-xl">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quick Delivery</h2>
          <p className="text-gray-600">Get an instant estimate</p>
        </div>
      </div>

      {/* Address Selection */}
      <div className="space-y-4">
        {/* From Address */}
        <div className="relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <Label className="text-sm font-medium text-gray-700">Pickup Location</Label>
          </div>
          <AddressAutocomplete
            value={fromAddress}
            onChange={setFromAddress}
            placeholder="Enter pickup address"
            className="pl-12"
          />
          <Navigation className="absolute left-4 top-12 w-4 h-4 text-blue-600" />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSwapAddresses}
            className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* To Address */}
        <div className="relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <Label className="text-sm font-medium text-gray-700">Delivery Location</Label>
          </div>
          <AddressAutocomplete
            value={toAddress}
            onChange={setToAddress}
            placeholder="Enter delivery address"
            className="pl-12"
          />
          <MapPin className="absolute left-4 top-12 w-4 h-4 text-red-500" />
        </div>
      </div>

      {/* Package Details */}
      {showPackageDetails && (
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">Package Details</h3>

          {/* Package Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            {packageTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setPackageDetails({ ...packageDetails, type: type.id as PackageDetails['type'] })}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  packageDetails.type === type.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Additional Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                Weight (optional)
              </Label>
              <Input
                id="weight"
                type="text"
                placeholder="e.g., 2.5kg"
                value={packageDetails.weight || ''}
                onChange={(e) => setPackageDetails({ ...packageDetails, weight: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description (optional)
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="Brief description of items"
                value={packageDetails.description || ''}
                onChange={(e) => setPackageDetails({ ...packageDetails, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={!fromAddress || !toAddress}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        size="lg"
      >
        <div className="flex items-center justify-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Get Estimate</span>
        </div>
      </Button>

      {/* Quick Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Typical delivery: 30-60 minutes within Vancouver</span>
        </div>
      </div>
    </div>
  );
}