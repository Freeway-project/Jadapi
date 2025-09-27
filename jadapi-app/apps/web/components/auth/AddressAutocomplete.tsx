'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { MapPin, Loader2 } from 'lucide-react';

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
  placeholder = "Enter your address",
  label = "Address",
  error,
  disabled = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedValue = useDebounce(value, 300);

  // Mock Google Places API call - replace with actual API
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - replace with actual Google Places API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Mock suggestions
      const mockSuggestions: AddressSuggestion[] = [
        {
          description: `${input} Street, New York, NY, USA`,
          place_id: `place_${Math.random()}`,
          main_text: `${input} Street`,
          secondary_text: 'New York, NY, USA'
        },
        {
          description: `${input} Avenue, Los Angeles, CA, USA`,
          place_id: `place_${Math.random()}`,
          main_text: `${input} Avenue`,
          secondary_text: 'Los Angeles, CA, USA'
        },
        {
          description: `${input} Road, Chicago, IL, USA`,
          place_id: `place_${Math.random()}`,
          main_text: `${input} Road`,
          secondary_text: 'Chicago, IL, USA'
        }
      ];

      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
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
    <div className="space-y-2 relative">
      <Label htmlFor="address">{label}</Label>
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
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.place_id}
              variant="ghost"
              className="w-full justify-start h-auto p-3 text-left rounded-none first:rounded-t-md last:rounded-b-md hover:bg-muted"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start space-x-2 w-full">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-foreground">
                    {suggestion.main_text}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
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