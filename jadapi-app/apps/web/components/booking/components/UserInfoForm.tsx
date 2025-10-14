import { useState, useEffect } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { userAPI, UserData } from '@/lib/api/user';
import { useDebounce } from '@/hooks/useDebounce';
import AddressAutocomplete from '@/components/auth/AddressAutocomplete';

export interface UserDetails {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

interface UserInfoFormProps {
  type: 'sender' | 'recipient';
  icon: LucideIcon;
  title: string;
  userDetails: UserDetails;
  onUpdate: (details: UserDetails) => void;
}

export default function UserInfoForm({
  type,
  icon: Icon,
  title,
  userDetails,
  onUpdate
}: UserInfoFormProps) {
  const [uuid, setUuid] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<UserData | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const debouncedUuid = useDebounce(uuid, 500);

  // Fetch user suggestion when UUID is entered (debounced)
  useEffect(() => {
    const fetchUserSuggestion = async () => {
      if (debouncedUuid.trim().length < 3) {
        setSuggestion(null);
        setShowSuggestion(false);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const userData = await userAPI.getUserByUuid(debouncedUuid);
        setSuggestion(userData);
        setShowSuggestion(true);
      } catch (error: any) {
        setSuggestion(null);
        setShowSuggestion(false);
        setSearchError('User not found with this ID');
      } finally {
        setIsSearching(false);
      }
    };

    fetchUserSuggestion();
  }, [debouncedUuid]);

  const handleSelectSuggestion = (userData: UserData) => {
    onUpdate({
      name: userData.profile?.name || '',
      phone: userData.auth?.phone || userData.phone || '',
      address: userData.profile?.address || userDetails.address || '',
      notes: userDetails.notes
    });
    setShowSuggestion(false);
    setSearchError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 pb-3">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-gray-700" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-4">
        {/* UUID Quick Fill */}
        <div className="relative">
          <Label className="text-sm font-medium text-gray-700 mb-1.5">Quick Fill (Optional)</Label>
          <Input
            type="text"
            placeholder={`Enter ${type} ID (e.g., JAD12345)`}
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            onFocus={() => suggestion && setShowSuggestion(true)}
            onBlur={() => setTimeout(() => setShowSuggestion(false), 200)}
            className="border-gray-200 focus:border-gray-900 focus:ring-0"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400 absolute right-3 top-9" />
          )}

          {/* Suggestion */}
          {showSuggestion && suggestion && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full p-3 text-left hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="font-medium text-sm text-gray-900">{suggestion.profile?.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{suggestion.auth?.phone || suggestion.phone}</div>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5">Full Name *</Label>
            <Input
              type="text"
              placeholder={`Enter ${type}'s full name`}
              value={userDetails.name}
              onChange={(e) => onUpdate({ ...userDetails, name: e.target.value })}
              className="border-gray-200 focus:border-gray-900 focus:ring-0"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5">Phone Number *</Label>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={userDetails.phone}
              onChange={(e) => onUpdate({ ...userDetails, phone: e.target.value })}
              className="border-gray-200 focus:border-gray-900 focus:ring-0"
              required
            />
          </div>

          {/* Address */}
          <div>
            <AddressAutocomplete
              label={`${type === 'sender' ? 'Pickup Address' : 'Delivery Address'} *`}
              placeholder={type === 'sender' ? 'Enter pickup address' : 'Enter delivery address'}
              value={userDetails.address}
              onChange={(value) => onUpdate({ ...userDetails, address: value })}
              className="border-gray-200 focus:border-gray-900 focus:ring-0"
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5">
              {type === 'sender' ? 'Pickup Instructions' : 'Delivery Instructions'} (Optional)
            </Label>
            <Input
              type="text"
              placeholder={
                type === 'sender'
                  ? 'e.g., Ring doorbell, Gate code: 1234'
                  : 'e.g., Leave at front desk, Apartment 201'
              }
              value={userDetails.notes}
              onChange={(e) => onUpdate({ ...userDetails, notes: e.target.value })}
              className="border-gray-200 focus:border-gray-900 focus:ring-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
