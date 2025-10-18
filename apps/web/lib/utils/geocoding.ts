interface Location {
  lat: number;
  lng: number;
}

/**
 * Geocode an address using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<Location | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({ address });

    if (result.results && result.results.length > 0) {
      const location = result.results[0]?.geometry?.location;
      if (location) {
        return {
          lat: location.lat(),
          lng: location.lng()
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
