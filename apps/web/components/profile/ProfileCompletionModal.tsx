'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { X, User, Building2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Please enter a valid address'),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: 'individual' | 'business';
  userId: string;
  onSuccess: (profileData: any) => void;
}

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  accountType,
  userId,
  onSuccess,
}: ProfileCompletionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const addressValue = watch('address');

  // Handle address autocomplete
  useEffect(() => {
    if (addressValue && addressValue.length > 2) {
      // Debounce address search
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(
            `/api/places/autocomplete?input=${encodeURIComponent(addressValue)}`
          );
          const data = await response.json();
          if (data.predictions) {
            setAddressSuggestions(data.predictions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Failed to fetch address suggestions:', error);
          // Silently fail - user can still type address manually
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  }, [addressValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006/api'}/users/${userId}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();

      toast.success('Profile completed successfully!');
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isIndividual = accountType === 'individual';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {isIndividual ? (
                  <User className="w-6 h-6" />
                ) : (
                  <Building2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Complete Your Profile</h2>
                <p className="text-blue-100 text-sm">Just a few more details to get started</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
              {isIndividual ? 'Your Name' : 'Business Name'} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder={isIndividual ? 'Enter your full name' : 'Enter business name'}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <span className="inline-block w-4 h-4 rounded-full bg-red-100 text-center leading-4 text-xs">!</span>
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Address Field */}
          <div className="space-y-2 relative">
            <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Address <span className="text-red-500">*</span></span>
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="Start typing your address..."
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
              {...register('address')}
              autoComplete="off"
            />

            {/* Address Suggestions Dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {addressSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      setValue('address', suggestion.description);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {suggestion.structured_formatting?.main_text}
                        </p>
                        <p className="text-xs text-gray-500">
                          {suggestion.structured_formatting?.secondary_text}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.address && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <span className="inline-block w-4 h-4 rounded-full bg-red-100 text-center leading-4 text-xs">!</span>
                <span>{errors.address.message}</span>
              </p>
            )}
            {!errors.address && addressValue && (
              <p className="text-xs text-gray-500">
                💡 Select from suggestions or type your full address
              </p>
            )}
          </div>

          {/* Business Fields */}
          {!isIndividual && (
            <>
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-semibold text-gray-700">
                  Legal Business Name <span className="text-gray-400 text-xs">(Optional)</span>
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Enter legal business name"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                  {...register('businessName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber" className="text-sm font-semibold text-gray-700">
                  GST Number <span className="text-gray-400 text-xs">(Optional)</span>
                </Label>
                <Input
                  id="gstNumber"
                  type="text"
                  placeholder="Enter GST number"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
                  {...register('gstNumber')}
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can update these details later in your profile settings
          </p>
        </form>
      </div>
    </div>
  );
}
