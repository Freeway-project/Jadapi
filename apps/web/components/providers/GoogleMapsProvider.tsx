'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { loadGoogleMaps } from '../../lib/utils/googleMaps';

interface GoogleMapsContextType {
  isLoaded: boolean;
  error: string | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
}

interface GoogleMapsProviderProps {
  children: React.ReactNode;
  apiKey?: string;
}

export function GoogleMapsProvider({ children, apiKey }: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key not provided');
      return;
    }

    loadGoogleMaps(apiKey)
      .then(() => {
        setIsLoaded(true);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load Google Maps');
        setIsLoaded(false);
      });
  }, [apiKey]);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, error }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}