'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

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
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Update map bounds when locations change
  useEffect(() => {
    if (map && (pickupLocation || dropoffLocation)) {
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
          top: 80,
          bottom: 80,
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
  }, [map, pickupLocation, dropoffLocation]);

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
      {/* Pickup Marker (Blue) */}
      {pickupLocation && (
        <Marker
          position={pickupLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#2563EB',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#FFFFFF'
          }}
        />
      )}

      {/* Dropoff Marker (Green) */}
      {dropoffLocation && (
        <Marker
          position={dropoffLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#FFFFFF'
          }}
        />
      )}

      {/* Route Line */}
      {pickupLocation && dropoffLocation && (
        <Polyline
          path={[pickupLocation, dropoffLocation]}
          options={{
            strokeColor: '#3B82F6',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            geodesic: true
          }}
        />
      )}
    </GoogleMap>
  );
}
