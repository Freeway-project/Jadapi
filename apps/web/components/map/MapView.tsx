'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

interface Location {
  lat: number;
  lng: number;
}

interface MapViewProps {
  pickupLocation?: Location;
  dropoffLocation?: Location;
  className?: string;
}

const defaultCenter: Location = {
  lat: 49.2827,
  lng: -123.1207 // Vancouver
};

const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

export default function MapView({ pickupLocation, dropoffLocation, className = '' }: MapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkLoaded = () => {
      if (typeof window !== 'undefined' && window.google?.maps) {
        setIsLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(checkLoaded, 100);
      }
    };
    checkLoaded();
  }, []);

  // Fetch directions when both locations are available
  useEffect(() => {
    if (!pickupLocation || !dropoffLocation || !isLoaded) {
      setDirectionsResponse(null);
      return;
    }

    // Check if google maps API is available
    if (typeof google === 'undefined' || !google.maps || !google.maps.DirectionsService) {
      console.error('Google Maps API not loaded');
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: pickupLocation,
        destination: dropoffLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);
        } else {
          console.error('Directions request failed:', status);
          setDirectionsResponse(null);
        }
      }
    );
  }, [pickupLocation, dropoffLocation, isLoaded]);

  // Update map bounds when locations change
  useEffect(() => {
    if (map && (pickupLocation || dropoffLocation) && isLoaded && typeof google !== 'undefined') {
      // If we have directions, let DirectionsRenderer handle the bounds
      if (directionsResponse) {
        return;
      }

      const bounds = new google.maps.LatLngBounds();

      if (pickupLocation) {
        bounds.extend(pickupLocation);
      }
      if (dropoffLocation) {
        bounds.extend(dropoffLocation);
      }

      // If both locations exist, fit to bounds
      if (pickupLocation && dropoffLocation) {
        map.fitBounds(bounds, {
          top: 60,
          bottom: 60,
          left: 40,
          right: 40
        });

        // Prevent zoom from being too far out
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const currentZoom = map.getZoom();
          if (currentZoom && currentZoom < 12) {
            map.setZoom(10);
          }
        });
      } else {
        // If only one location, center on it with closer zoom
        const location = pickupLocation || dropoffLocation;
        if (location) {
          map.setCenter(location);
          map.setZoom(15);
        }
      }
    }
  }, [map, pickupLocation, dropoffLocation, directionsResponse, isLoaded]);

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      mapContainerClassName={className}
      center={defaultCenter}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* Directions Route */}
      {directionsResponse && (
        <DirectionsRenderer
          directions={directionsResponse}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#3811d5ff',
              strokeOpacity: 0.8,
              strokeWeight: 5,
            },
          }}
        />
      )}

      {/* Pickup Marker (Green) */}
      {pickupLocation && isLoaded && typeof google !== 'undefined' && (
        <Marker
          position={pickupLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#06f22dff',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#FFFFFF'
          }}
        />
      )}

      {/* Dropoff Marker (Red) */}
      {dropoffLocation && isLoaded && typeof google !== 'undefined' && (
        <Marker
          position={dropoffLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#f31515ff',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#FFFFFF'
          }}
        />
      )}
    </GoogleMap>
  );
}
