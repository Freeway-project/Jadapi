'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { MapPin, Loader2 } from 'lucide-react';
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/utils/googleMaps';

interface AddressSuggestion {
  description: string;
  place_id: string;
  main_text: string;
  secondary_text: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}


// Simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Enter your Canadian address",
  label = "",
  error,
  disabled = false,
  className = "",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const debouncedValue = useDebounce(value, 300);

  // Load Google Maps API on component mount
  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setApiError(null);
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API:', error);
        setApiError('Address autocomplete is not available. Please type your address manually.');
      });
  }, []);

  // Google Places API call - restricted to Canada (using new AutocompleteSuggestion API)
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Check if Google Maps API is available
      if (isGoogleMapsLoaded()) {
        const { AutocompleteSuggestion } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;

        const request: google.maps.places.AutocompleteRequest = {
          input: input,
          includedRegionCodes: ['ca'], // Canada only
        };

        const { suggestions: predictions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        if (predictions && predictions.length > 0) {
          const canadianSuggestions = predictions
            .map(prediction => {
              const placePrediction = prediction.placePrediction;
              if (!placePrediction) return null;

              return {
                description: placePrediction.text?.text || '',
                place_id: placePrediction.placeId || '',
                main_text: placePrediction.mainText?.text || '',
                secondary_text: placePrediction.secondaryText?.text || ''
              };
            })
            .filter((s): s is AddressSuggestion => s !== null && s.description !== '');

          setSuggestions(canadianSuggestions);
        } else {
          setSuggestions([]);
        }
        setIsLoading(false);
      } else {
        // Show error message if Google Maps API is not available
        console.error('Google Maps API is not loaded. Please check your API key.');
        setApiError('Address autocomplete is not available. Please type your address manually.');
        setSuggestions([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedValue.trim() && showSuggestions) {
      fetchSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [debouncedValue, showSuggestions, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    if (inputValue.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(false);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsLoading(false);
    }, 200);
  };

  const handleInputFocus = () => {
    if (value.trim().length >= 3 && suggestions.length === 0) {
      fetchSuggestions(value);
    }
    if (value.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor="address" className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 block">{label}</Label>
      )}


      <div className="relative">
        <Input
          id="address"
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-600 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-500 transition-all ${className}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {isLoading && (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-gray-400" />
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm sm:text-base text-red-600 mt-1.5 sm:mt-2">{error}</p>
      )}

      {apiError && !error && (
        <p className="text-sm sm:text-base text-amber-600 mt-1.5 sm:mt-2">{apiError}</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.place_id}
              variant="ghost"
              className="w-full justify-start h-auto px-4 py-3 sm:py-4 text-left rounded-none hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start space-x-3 w-full">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm sm:text-base text-gray-900">
                    {suggestion.main_text}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                    {suggestion.secondary_text}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}