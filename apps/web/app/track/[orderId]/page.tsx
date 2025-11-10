'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GoogleMap, Marker, Polyline, DirectionsRenderer, Circle } from '@react-google-maps/api';
import { 
  Package, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle2, 
  Truck,
  Navigation,
  Loader2,
  AlertCircle,
  Home
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { trackingAPI, TrackingInfo } from '../../../lib/api/tracking';
import toast from 'react-hot-toast';

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
  fullscreenControl: true,
};

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [driverToDropoffDirections, setDriverToDropoffDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkLoaded = () => {
      if (typeof window !== 'undefined' && window.google?.maps) {
        setIsLoaded(true);
      } else {
        setTimeout(checkLoaded, 100);
      }
    };
    checkLoaded();
  }, []);

  // Fetch tracking info
  const fetchTrackingInfo = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);
      
      const response = await trackingAPI.trackOrder(orderId);
      setTrackingInfo(response.data);
      setLastUpdated(new Date());

      // If driver is assigned and order is active, get driver location
      if (
        response.data.driver && 
        ['assigned', 'picked_up', 'in_transit'].includes(response.data.order.status)
      ) {
        const locationResponse = await trackingAPI.getDriverLocation(orderId);
        if (locationResponse.data) {
          setDriverLocation({
            lat: locationResponse.data.lat,
            lng: locationResponse.data.lng
          });
        }
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching tracking info:', err);
      setError(err?.response?.data?.message || 'Failed to load tracking information');
      if (showLoader) {
        toast.error('Failed to load tracking information');
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Initial load
  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setIsLoading(false);
      return;
    }

    fetchTrackingInfo(true);
  }, [orderId, fetchTrackingInfo]);

  // Auto-refresh every 5 seconds for active orders
  useEffect(() => {
    if (!trackingInfo) return;

    const isActive = ['assigned', 'picked_up', 'in_transit'].includes(trackingInfo.order.status);
    
    if (isActive) {
      const interval = setInterval(() => {
        fetchTrackingInfo(false); // Silent refresh
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [trackingInfo, fetchTrackingInfo]);

  // Fit map bounds when locations change
  useEffect(() => {
    if (!map || !trackingInfo) return;

    const bounds = new google.maps.LatLngBounds();
    
    // Add pickup location
    bounds.extend(trackingInfo.order.pickup.coordinates);
    
    // Add dropoff location
    bounds.extend(trackingInfo.order.dropoff.coordinates);
    
    // Add driver location if available
    if (driverLocation) {
      bounds.extend(driverLocation);
    }

    map.fitBounds(bounds, {
      top: 80,
      bottom: 80,
      left: 60,
      right: 60
    });
  }, [map, trackingInfo, driverLocation]);

  // Calculate driving route from pickup to dropoff
  useEffect(() => {
    if (!isLoaded || !trackingInfo) return;

    const directionsService = new google.maps.DirectionsService();

    // Get route from pickup to dropoff
    directionsService.route(
      {
        origin: trackingInfo.order.pickup.coordinates,
        destination: trackingInfo.order.dropoff.coordinates,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);
        } else {
          console.error('Error fetching directions:', status);
        }
      }
    );
  }, [isLoaded, trackingInfo]);

  // Calculate route from driver to dropoff when driver location is available
  useEffect(() => {
    if (!isLoaded || !driverLocation || !trackingInfo) return;

    const isActive = ['picked_up', 'in_transit'].includes(trackingInfo.order.status);
    if (!isActive) return;

    const directionsService = new google.maps.DirectionsService();

    // Get route from current driver location to dropoff
    directionsService.route(
      {
        origin: driverLocation,
        destination: trackingInfo.order.dropoff.coordinates,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDriverToDropoffDirections(result);
        } else {
          console.error('Error fetching driver directions:', status);
        }
      }
    );
  }, [isLoaded, driverLocation, trackingInfo]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Order Placed', 
          color: 'bg-blue-100 text-blue-700',
          icon: <Clock className="w-5 h-5" />
        };
      case 'assigned':
        return { 
          label: 'Driver Assigned', 
          color: 'bg-purple-100 text-purple-700',
          icon: <User className="w-5 h-5" />
        };
      case 'picked_up':
        return { 
          label: 'Package Picked Up', 
          color: 'bg-orange-100 text-orange-700',
          icon: <Package className="w-5 h-5" />
        };
      case 'in_transit':
        return { 
          label: 'On the Way', 
          color: 'bg-amber-100 text-amber-700',
          icon: <Truck className="w-5 h-5" />
        };
      case 'delivered':
        return { 
          label: 'Delivered', 
          color: 'bg-green-100 text-green-700',
          icon: <CheckCircle2 className="w-5 h-5" />
        };
      case 'cancelled':
        return { 
          label: 'Cancelled', 
          color: 'bg-red-100 text-red-700',
          icon: <AlertCircle className="w-5 h-5" />
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-700',
          icon: <Clock className="w-5 h-5" />
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !trackingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Track Order</h1>
          <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
          <Button onClick={() => router.push('/')} variant="default">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(trackingInfo.order.status);
  const isActive = ['assigned', 'picked_up', 'in_transit'].includes(trackingInfo.order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Track Your Delivery</h1>
              <p className="text-sm text-gray-500 mt-1">Order #{trackingInfo.order.orderId}</p>
            </div>
            <Button onClick={() => router.push('/')} variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.color} font-semibold`}>
                {statusInfo.icon}
                {statusInfo.label}
              </div>

              {/* ETA if driver is en route */}
              {driverToDropoffDirections && isActive && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Estimated Arrival</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {driverToDropoffDirections.routes[0]?.legs[0]?.duration?.text || 'Calculating...'}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Distance: {driverToDropoffDirections.routes[0]?.legs[0]?.distance?.text || 'N/A'}
                  </p>
                </div>
              )}

              {lastUpdated && isActive && (
                <p className="text-xs text-gray-500 mt-3">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Driver Info */}
            {trackingInfo.driver && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Your Driver
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{trackingInfo.driver.name}</p>
                  </div>
                  {trackingInfo.driver.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <a 
                        href={`tel:${trackingInfo.driver.phone}`}
                        className="font-medium text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {trackingInfo.driver.phone}
                      </a>
                    </div>
                  )}
                  {trackingInfo.driver.vehicle && (
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-medium text-gray-900">
                        {trackingInfo.driver.vehicle.type} - {trackingInfo.driver.vehicle.plateNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Delivery Details
              </h3>
              
              <div className="space-y-4">
                {/* Pickup */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Pickup</p>
                    <p className="text-sm text-gray-900 mt-1">{trackingInfo.order.pickup.address}</p>
                    {trackingInfo.order.pickup.contactName && (
                      <p className="text-xs text-gray-500 mt-1">{trackingInfo.order.pickup.contactName}</p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="pl-4 border-l-2 border-dashed border-gray-300 h-6"></div>

                {/* Dropoff */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Dropoff</p>
                    <p className="text-sm text-gray-900 mt-1">{trackingInfo.order.dropoff.address}</p>
                    {trackingInfo.order.dropoff.contactName && (
                      <p className="text-xs text-gray-500 mt-1">{trackingInfo.order.dropoff.contactName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Package Info */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Package Size</span>
                  <span className="font-medium text-gray-900">{trackingInfo.order.package.size}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium text-gray-900">{trackingInfo.order.distance.km} km</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Timeline
              </h3>
              
              <div className="space-y-3">
                {trackingInfo.order.timeline.createdAt && (
                  <TimelineItem 
                    label="Order Placed"
                    time={trackingInfo.order.timeline.createdAt}
                    completed
                  />
                )}
                {trackingInfo.order.timeline.assignedAt && (
                  <TimelineItem 
                    label="Driver Assigned"
                    time={trackingInfo.order.timeline.assignedAt}
                    completed
                  />
                )}
                {trackingInfo.order.timeline.pickedUpAt && (
                  <TimelineItem 
                    label="Package Picked Up"
                    time={trackingInfo.order.timeline.pickedUpAt}
                    completed
                  />
                )}
                {trackingInfo.order.timeline.deliveredAt && (
                  <TimelineItem 
                    label="Delivered"
                    time={trackingInfo.order.timeline.deliveredAt}
                    completed
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '800px' }}>
              {isLoaded ? (
                <>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={trackingInfo.order.pickup.coordinates}
                    zoom={13}
                    onLoad={onLoad}
                    options={mapOptions}
                  >
                  {/* Pickup Marker */}
                  <Marker
                    position={trackingInfo.order.pickup.coordinates}
                    title="Pickup Location"
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: '#3B82F6',
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    }}
                    label={{
                      text: 'P',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  />

                  {/* Dropoff Marker */}
                  <Marker
                    position={trackingInfo.order.dropoff.coordinates}
                    title="Dropoff Location"
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: '#EF4444',
                      fillOpacity: 1,
                      strokeColor: '#FFFFFF',
                      strokeWeight: 2,
                    }}
                    label={{
                      text: 'D',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  />

                  {/* Driver Location */}
                  {driverLocation && isActive && (
                    <>
                      {/* Pulsing circle around driver */}
                      <Circle
                        center={driverLocation}
                        radius={50} // 50 meters
                        options={{
                          fillColor: '#10B981',
                          fillOpacity: 0.15,
                          strokeColor: '#10B981',
                          strokeOpacity: 0.4,
                          strokeWeight: 2,
                        }}
                      />
                      
                      {/* Driver marker */}
                      <Marker
                        position={driverLocation}
                        title="Driver Location (Live)"
                        icon={{
                          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                          scale: 6,
                          fillColor: '#07ec9fff',
                          fillOpacity: 1,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 2,
                          rotation: 0,
                        }}
                        label={{
                          text: '🚚',
                          fontSize: '20px',
                        }}
                        animation={google.maps.Animation.DROP}
                      />
                    </>
                  )}

                  {/* Driving Route */}
                  {driverToDropoffDirections && isActive ? (
                    // Show route from driver to dropoff (active delivery)
                    <DirectionsRenderer
                      directions={driverToDropoffDirections}
                      options={{
                        suppressMarkers: true, // We're using custom markers
                        polylineOptions: {
                          strokeColor: '#10B981',
                          strokeOpacity: 0.8,
                          strokeWeight: 5,
                        },
                      }}
                    />
                  ) : directionsResponse ? (
                    // Show full route from pickup to dropoff (not started or completed)
                    <DirectionsRenderer
                      directions={directionsResponse}
                      options={{
                        suppressMarkers: true, // We're using custom markers
                        polylineOptions: {
                          strokeColor: '#e10ff5ff',
                          strokeOpacity: 0.6,
                          strokeWeight: 4,
                        },
                      }}
                    />
                  ) : null}
                  </GoogleMap>

                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Map Legend</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                        <span className="text-xs text-gray-700">Pickup Location</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-600"></div>
                        <span className="text-xs text-gray-700">Dropoff Location</span>
                      </div>
                      {driverLocation && isActive && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-green-600"></div>
                          <span className="text-xs text-gray-700">Driver (Live)</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-blue-600"></div>
                        <span className="text-xs text-gray-700">Driving Route</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ label, time, completed }: { label: string; time: string; completed: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">
          {new Date(time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}
