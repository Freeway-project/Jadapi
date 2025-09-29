'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { MapPin, Loader2 } from 'lucide-react';
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/utils/googleMaps';

// Extend Window interface for Google Maps API
declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          AutocompleteService: new() => google.maps.places.AutocompleteService;
          PlacesServiceStatus: typeof google.maps.places.PlacesServiceStatus;
        };
        LatLng: new(lat: number, lng: number) => google.maps.LatLng;
        LatLngBounds: new(sw?: google.maps.LatLng, ne?: google.maps.LatLng) => google.maps.LatLngBounds;
      };
    };
  }
}

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
  placeholder = "Enter your Vancouver address",
  label = "Address (Vancouver only)",
  error,
  disabled = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const debouncedValue = useDebounce(value, 300);

  // Load Google Maps API on component mount
  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setIsAPIReady(true);
      })
      .catch((error) => {
        console.error('Failed to load Google Maps API:', error);
        setIsAPIReady(false);
      });
  }, []);

  // Google Places API call - restricted to Vancouver
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Check if Google Maps API is available
      if (isGoogleMapsLoaded()) {
        const service = new window.google.maps.places.AutocompleteService();

        // Vancouver city bounds for address restriction
        const vancouverBounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(49.1951, -123.2766), // SW corner
          new window.google.maps.LatLng(49.3157, -123.0236)  // NE corner
        );

        const request = {
          input: input,
          bounds: vancouverBounds,
          strictBounds: true, // Restrict results to bounds
          componentRestrictions: { country: 'ca' }, // Canada only
          types: ['address'], // Only addresses, not businesses
          region: 'ca'
        };

        service.getPlacePredictions(request, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const vancouverSuggestions = predictions
              .filter(prediction =>
                prediction.description.toLowerCase().includes('vancouver') ||
                prediction.description.toLowerCase().includes('bc') ||
                prediction.description.toLowerCase().includes('british columbia')
              )
              .map(prediction => ({
                description: prediction.description,
                place_id: prediction.place_id,
                main_text: prediction.structured_formatting.main_text,
                secondary_text: prediction.structured_formatting.secondary_text || ''
              }));

            setSuggestions(vancouverSuggestions);
          } else {
            setSuggestions([]);
          }
          setIsLoading(false);
        });
      } else {
        // Fallback to mock Vancouver addresses if Google Maps API is not loaded
        const mockVancouverSuggestions: AddressSuggestion[] = [
          {
            description: `${input} Street, Vancouver, BC, Canada`,
            place_id: `place_${Math.random()}`,
            main_text: `${input} Street`,
            secondary_text: 'Vancouver, BC, Canada'
          },
          {
            description: `${input} Avenue, Vancouver, BC, Canada`,
            place_id: `place_${Math.random()}`,
            main_text: `${input} Avenue`,
            secondary_text: 'Vancouver, BC, Canada'
          },
          {
            description: `${input} Drive, Vancouver, BC, Canada`,
            place_id: `place_${Math.random()}`,
            main_text: `${input} Drive`,
            secondary_text: 'Vancouver, BC, Canada'
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        setSuggestions(mockVancouverSuggestions);
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
    }
  }, [debouncedValue, showSuggestions, fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputFocus = () => {
    if (value.trim()) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="space-y-3 relative">
      <Label htmlFor="address" className="text-base font-medium text-black">{label}</Label>
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
          className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <MapPin className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-xs font-bold">!</span>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.place_id}
              variant="ghost"
              className="w-full justify-start h-auto p-4 text-left rounded-none first:rounded-t-xl last:rounded-b-xl hover:bg-blue-50 transition-colors duration-200"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-black">
                    {suggestion.main_text}
                  </div>
                  <div className="text-xs text-gray-600 truncate mt-0.5">
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