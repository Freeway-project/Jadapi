declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

export const loadGoogleMaps = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Create the callback function
    window.initGoogleMaps = () => {
      resolve();
    };

    // Create and append the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps'));

    document.head.appendChild(script);
  });
};

export const isGoogleMapsLoaded = (): boolean => {
  return !!(window.google && window.google.maps && window.google.maps.places);
};