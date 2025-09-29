declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (apiKey?: string): Promise<void> => {
  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Use environment variable if no key provided
  const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!key) {
    console.warn('Google Maps API key not found. Address autocomplete will use mock data.');
    return Promise.resolve();
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if running on server
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve();
      return;
    }

    // Check if script is already in document
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for existing script to load
      const checkLoaded = setInterval(() => {
        if (isGoogleMapsLoaded()) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      return;
    }

    // Create the callback function
    window.initGoogleMaps = () => {
      delete window.initGoogleMaps;
      resolve();
    };

    // Create and append the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' &&
         !!(window.google && window.google.maps && window.google.maps.places);
};