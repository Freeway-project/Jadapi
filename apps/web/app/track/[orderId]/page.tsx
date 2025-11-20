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
  Home,
  Image as ImageIcon,
  X
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
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

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
      {/* Compact Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Track Delivery</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">#{trackingInfo.order.orderId}</p>
            </div>
            <Button onClick={() => router.push('/')} variant="outline" size="sm" className="ml-2">
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        {/* Mobile-First: Map First, Then Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Map - Shows First on Mobile */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Status Banner - Compact for Mobile */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full ${statusInfo.color} font-semibold text-sm sm:text-base`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>
                {lastUpdated && isActive && (
                  <p className="text-xs text-gray-500">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* ETA Banner - Prominent for Mobile */}
              {driverToDropoffDirections && isActive && (
                <div className="mt-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900 text-sm sm:text-base">ETA</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-green-700">
                        {driverToDropoffDirections.routes[0]?.legs[0]?.duration?.text || 'Calculating...'}
                      </p>
                      <p className="text-xs sm:text-sm text-green-600">
                        {driverToDropoffDirections.routes[0]?.legs[0]?.distance?.text || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Driver Quick Contact - Prominent on Mobile */}
            {trackingInfo.driver && (
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">Your Driver</p>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{trackingInfo.driver.name}</p>
                      {trackingInfo.driver.vehicle && (
                        <p className="text-xs text-gray-500 truncate">
                          {trackingInfo.driver.vehicle.type} - {trackingInfo.driver.vehicle.plateNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  {trackingInfo.driver.phone && (
                    <a
                      href={`tel:${trackingInfo.driver.phone}`}
                      className="flex-shrink-0"
                    >
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white h-10 sm:h-12 px-4 sm:px-6"
                      >
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="font-semibold">Call</span>
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Map Container - Mobile Optimized */}
            <div
              className="relative bg-white rounded-lg shadow-md overflow-hidden h-[45vh] min-h-[350px] lg:h-[calc(100vh-180px)]"
            >
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

                  {/* Compact Map Legend */}
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 border border-gray-200">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span className="text-xs text-gray-700">Pickup</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span className="text-xs text-gray-700">Dropoff</span>
                      </div>
                      {driverLocation && isActive && (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                          <span className="text-xs text-gray-700">Driver</span>
                        </div>
                      )}
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

          {/* Details Column - Shows Second on Mobile */}
          <div className="lg:col-span-1 order-2 lg:order-1 space-y-3 sm:space-y-4">
            {/* Pickup & Dropoff Photos */}
            {(trackingInfo.order.pickup.photoUrl || trackingInfo.order.dropoff.photoUrl) && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex gap-2 p-2 sm:p-3">
                  {trackingInfo.order.pickup.photoUrl && (
                    <button
                      onClick={() => setSelectedImage({
                        url: trackingInfo.order.pickup.photoUrl!,
                        title: 'Pickup Location'
                      })}
                      className="flex-1 relative group overflow-hidden rounded-lg"
                    >
                      <img
                        src={trackingInfo.order.pickup.photoUrl}
                        alt="Pickup"
                        className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-xs font-semibold">Pickup</p>
                      </div>
                    </button>
                  )}
                  {trackingInfo.order.dropoff.photoUrl && (
                    <button
                      onClick={() => setSelectedImage({
                        url: trackingInfo.order.dropoff.photoUrl!,
                        title: 'Dropoff Location'
                      })}
                      className="flex-1 relative group overflow-hidden rounded-lg"
                    >
                      <img
                        src={trackingInfo.order.dropoff.photoUrl}
                        alt="Dropoff"
                        className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-xs font-semibold">Dropoff</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Details - Compact */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Locations
              </h3>

              <div className="space-y-3">
                {/* Pickup */}
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Pickup</p>
                    <p className="text-xs sm:text-sm text-gray-900 mt-0.5">{trackingInfo.order.pickup.address}</p>
                    {trackingInfo.order.pickup.contactName && (
                      <p className="text-xs text-gray-500 mt-0.5">{trackingInfo.order.pickup.contactName}</p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="pl-3 border-l-2 border-dashed border-gray-300 h-4"></div>

                {/* Dropoff */}
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-100 flex items-center justify-center">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Dropoff</p>
                    <p className="text-xs sm:text-sm text-gray-900 mt-0.5">{trackingInfo.order.dropoff.address}</p>
                    {trackingInfo.order.dropoff.contactName && (
                      <p className="text-xs text-gray-500 mt-0.5">{trackingInfo.order.dropoff.contactName}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Package Info - Compact */}
              <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-gray-600">Package</span>
                  <p className="font-medium text-gray-900 text-sm">{trackingInfo.order.package.size}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-600">Distance</span>
                  <p className="font-medium text-gray-900 text-sm">{trackingInfo.order.distance.km} km</p>
                </div>
              </div>
            </div>

            {/* Timeline - Compact */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Timeline
              </h3>

              <div className="space-y-2.5">
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
                    label="Picked Up"
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
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full rounded-lg"
            />
            <p className="text-white text-center mt-4 text-sm font-medium">{selectedImage.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ label, time, completed }: { label: string; time: string; completed: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 mt-0.5">
        {completed ? (
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
        ) : (
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-900">{label}</p>
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
