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
  addressEditable?: boolean;
}

export default function UserInfoForm({
  type,
  icon: Icon,
  title,
  userDetails,
  onUpdate,
  addressEditable = true
}: UserInfoFormProps) {
  const [uuid, setUuid] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<UserData | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

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
    <div className="space-y-2">
      <div className="flex items-center space-x-2 pb-1">
        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-2">
        {/* UUID Quick Fill */}
        <div className="relative">
          <Label className="text-xs font-medium text-gray-700 mb-0.5">Quick Fill (Optional)</Label>
          <Input
            type="text"
            placeholder={`Enter ${type} ID (e.g., JAD12345)`}
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            onFocus={() => suggestion && setShowSuggestion(true)}
            onBlur={() => setTimeout(() => setShowSuggestion(false), 200)}
            className="h-9 text-sm border-gray-200 focus:border-blue-600 focus:ring-0"
          />
          {isSearching && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 absolute right-3 top-7" />
          )}

          {/* Suggestion */}
          {showSuggestion && suggestion && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full p-2 text-left hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="font-medium text-sm text-gray-900">{suggestion.profile?.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{suggestion.auth?.phone || suggestion.phone}</div>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {/* Name */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-0.5">Full Name *</Label>
            <Input
              type="text"
              placeholder={`Enter ${type}'s full name`}
              value={userDetails.name}
              onChange={(e) => onUpdate({ ...userDetails, name: e.target.value })}
              className="h-9 text-sm border-gray-200 focus:border-blue-600 focus:ring-0"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-0.5">Phone Number *</Label>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="\d*"
                maxLength={15}
                placeholder="e.g. 15551234567"
                value={userDetails.phone}
                onChange={(e) => {
                  // allow only digits (strip all non-digit characters)
                  const digits = e.target.value.replace(/\D/g, '');
                  // optional: limit to 15 digits (E.164 max length)
                  const limited = digits.slice(0, 15);
                  onUpdate({ ...userDetails, phone: limited });
                  // clear error while typing
                  if (phoneError) setPhoneError(null);
                }}
                onBlur={() => {
                  // basic validation: require at least 7 digits (adjustable)
                  const len = (userDetails.phone || '').replace(/\D/g, '').length;
                  if (len > 0 && len < 7) {
                    setPhoneError('Please enter a valid phone number (at least 7 digits)');
                  } else {
                    setPhoneError(null);
                  }
                }}
                className="h-9 text-sm border-gray-200 focus:border-blue-600 focus:ring-0"
                required
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
          </div>

          {/* Address */}
          <div>
            {addressEditable ? (
              <AddressAutocomplete
                label={`${type === 'sender' ? 'Pickup Address' : 'Delivery Address'} *`}
                placeholder={type === 'sender' ? 'Enter pickup address' : 'Enter delivery address'}
                value={userDetails.address}
                onChange={(value) => onUpdate({ ...userDetails, address: value })}
                className="h-9 text-sm border-gray-200 focus:border-blue-600 focus:ring-0"
              />
            ) : (
              <>
                <Label className="text-xs font-medium text-gray-700 mb-0.5">
                  {type === 'sender' ? 'Pickup Address' : 'Delivery Address'} *
                </Label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 break-words">
                  {userDetails.address}
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-0.5">
              {type === 'sender' ? 'Pickup Instructions' : 'Delivery Instructions'} (Optional)
            </Label>
            <Input
              type="text"
              placeholder={
                type === 'sender'
                  ? 'e.g., Ring doorbell, Gate code: 1234'
                  : 'e.g., Leave at front desk, Apt 201'
              }
              value={userDetails.notes}
              onChange={(e) => onUpdate({ ...userDetails, notes: e.target.value })}
              className="h-9 text-sm border-gray-200 focus:border-blue-600 focus:ring-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
