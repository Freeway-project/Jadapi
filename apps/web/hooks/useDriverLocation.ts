'use client';

import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../lib/api/client';
import toast from 'react-hot-toast';

interface LocationUpdateOptions {
  enabled?: boolean;
  driverId?: string;
  orderId?: string;
  updateInterval?: number; // milliseconds
}

export function useDriverLocation(options: LocationUpdateOptions = {}) {
  const {
    enabled = false,
    driverId,
    orderId,
    updateInterval = 5000, // Default: update every 5 seconds
  } = options;

  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const updateDriverLocation = async (lat: number, lng: number, heading?: number, speed?: number) => {
    if (!driverId) {
      console.warn('No driverId provided for location update');
      return;
    }

    try {
      await apiClient.post('/driver/location', {
        driverId,
        lat,
        lng,
        heading: heading || undefined,
        speed: speed || undefined,
        orderId: orderId || undefined,
      });

      setLastUpdate(new Date());
      setError(null);
      lastLocationRef.current = { lat, lng };
    } catch (err: any) {
      console.error('Failed to update driver location:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to update location';
      setError(errorMessage);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!driverId) {
      const msg = 'Driver ID is required for location tracking';
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsTracking(true);
    toast.success('Location tracking started');

    // Watch position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading, speed } = position.coords;
        
        // Update immediately when position changes
        updateDriverLocation(
          latitude,
          longitude,
          heading !== null ? heading : undefined,
          speed !== null ? speed : undefined
        );
      },
      (err) => {
        console.error('Geolocation error:', err);
        let errorMessage = 'Failed to get location';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Also set up periodic updates as a fallback
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, heading, speed } = position.coords;
          updateDriverLocation(
            latitude,
            longitude,
            heading !== null ? heading : undefined,
            speed !== null ? speed : undefined
          );
        },
        (err) => {
          console.error('Periodic location update failed:', err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }, updateInterval);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
    console.log('Location tracking stopped');
  };

  // Auto-start/stop tracking based on enabled flag
  useEffect(() => {
    if (enabled && driverId) {
      startTracking();
    } else {
      stopTracking();
    }

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, driverId, orderId]);

  return {
    isTracking,
    lastUpdate,
    error,
    lastLocation: lastLocationRef.current,
    startTracking,
    stopTracking,
  };
}
