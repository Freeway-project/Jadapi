'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Package, X, Home, Menu } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { FareEstimateResponse, deliveryAPI } from '../../lib/api/delivery';
import { useAuthStore } from '../../lib/stores/authStore';
import { tokenManager } from '../../lib/api/client';
import { geocodeAddress } from '../../lib/utils/geocoding';
import ProgressSteps, { BookingStep } from './components/ProgressSteps';
import FareEstimate from './components/FareEstimate';
import UserInfoForm, { UserDetails } from './components/UserInfoForm';
import ReviewOrder from './components/ReviewOrder';
import PaymentSection from './components/PaymentSection';
import MapView from '../map/MapView';
import toast from 'react-hot-toast';

interface BookingFlowProps {
  initialPickup: {
    address: string;
    lat: number;
    lng: number;
  };
  initialDropoff: {
    address: string;
    lat: number;
    lng: number;
  };
  initialPackageSize: 'XS' | 'S' | 'M' | 'L';
  initialFareEstimate: {
    distance: number;
    duration: number;
    subtotal?: number;
    tax?: number;
    total: number;
  };
  onBack?: () => void;
  onComplete?: () => void;
}

export default function BookingFlow({
  initialPickup,
  initialDropoff,
  initialPackageSize,
  initialFareEstimate,
  onBack,
  onComplete
}: BookingFlowProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<BookingStep>('sender');

  // Check authentication on mount and when navigating to payment step
  useEffect(() => {
    const checkAuth = () => {
      const token = tokenManager.getToken();
      const hasUser = !!user;

      if (!token || !hasUser) {
        console.warn('[BookingFlow] Not authenticated - redirecting to signup');
        toast.error('Please sign in to continue with booking');
        router.push('/auth/signup');
      }
    };

    // Check on mount
    checkAuth();

    // Check again when moving to payment step
    if (currentStep === 'payment') {
      checkAuth();
    }
  }, [currentStep, user, router]);

  const [sender, setSender] = useState<UserDetails>({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [recipient, setRecipient] = useState<UserDetails>({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({
    lat: initialPickup.lat,
    lng: initialPickup.lng
  });
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number }>({
    lat: initialDropoff.lat,
    lng: initialDropoff.lng
  });
  const [initialPrefillDone, setInitialPrefillDone] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponId: string;
    code: string;
    discount: number;
    discountedSubtotal: number;
    gst: number;
    pst: number;
    totalTax: number;
    newTotal: number;
  } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Create estimate object from initial data
  const estimate: FareEstimateResponse = {
    success: true,
    data: {
      fare: {
        baseFare: 0,
        distanceFare: 0,
        bandMultiplier: 1,
        bandLabel: '',
        sizeMultiplier: 1,
        edgeSurcharge: 0,
        subtotal: initialFareEstimate.subtotal || initialFareEstimate.total,
        tax: initialFareEstimate.tax || 0,
        total: initialFareEstimate.total,
        currency: 'CAD',
        distanceKm: initialFareEstimate.distance,
        durationMinutes: initialFareEstimate.duration
      },
      distance: {
        distanceKm: initialFareEstimate.distance,
        durationMinutes: initialFareEstimate.duration,
        method: 'google_maps'
      },
      serviceAreas: {}
    }
  };

  // Prefill sender info from logged-in user and addresses from search (only once)
  useEffect(() => {
    if (!initialPrefillDone) {
      setSender({
        name: user?.profile?.name || '',
        phone: user?.auth?.phone || user?.phone || '',
        address: initialPickup.address,
        notes: ''
      });

      setRecipient(prev => ({
        ...prev,
        address: initialDropoff.address
      }));

      setInitialPrefillDone(true);
    }
  }, [user, initialPickup.address, initialDropoff.address, initialPrefillDone]);

  const steps = [
    { id: 'sender' as BookingStep, label: 'Sender', icon: MapPin },
    { id: 'recipient' as BookingStep, label: 'Recipient', icon: User },
    { id: 'review' as BookingStep, label: 'Review', icon: Package },
    { id: 'payment' as BookingStep, label: 'Payment', icon: Package }
  ];

  const handleNext = () => {
    if (currentStep === 'sender') setCurrentStep('recipient');
    else if (currentStep === 'recipient') setCurrentStep('review');
    else if (currentStep === 'review') setCurrentStep('payment');
  };

  const handlePrevious = () => {
    if (currentStep === 'payment') setCurrentStep('review');
    else if (currentStep === 'review') setCurrentStep('recipient');
    else if (currentStep === 'recipient') setCurrentStep('sender');
    else if (currentStep === 'sender' && onBack) onBack();
  };

  const canProceed = () => {
    if (currentStep === 'sender') {
      return sender.name && sender.phone && sender.address;
    }
    if (currentStep === 'recipient') {
      return recipient.name && recipient.phone && recipient.address;
    }
    return true;
  };

  const handleCreateOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const orderData = {
        pickup: {
          address: sender.address,
          coordinates: pickupCoords,
          contactName: sender.name,
          contactPhone: sender.phone,
        },
        dropoff: {
          address: recipient.address,
          coordinates: dropoffCoords,
          contactName: recipient.name,
          contactPhone: recipient.phone,
        },
        package: {
          size: initialPackageSize,
          description: recipient.notes || sender.notes,
        },
        pricing: estimate.data.fare,
        distance: estimate.data.distance,
        coupon: appliedCoupon ? {
          couponId: appliedCoupon.couponId,
          code: appliedCoupon.code,
          discount: appliedCoupon.discount,
        } : undefined,
      };

      const response = await deliveryAPI.createOrder(orderData);

      if (response.success && response.data.order) {
        setOrderId(response.data.order._id);
        toast.success('Order created successfully');
        handleNext();
      } else {
        toast.error('Failed to create order');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error?.response?.data?.message || 'Failed to create order');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleCouponApplied = (couponData: { couponId: string; code: string; discount: number; discountedSubtotal: number; gst: number; pst: number; totalTax: number; newTotal: number } | null) => {
    setAppliedCoupon(couponData);
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! Your order is confirmed.');
    onComplete?.();
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  // Create a modified estimate with coupon discount applied
  const finalEstimate: FareEstimateResponse = appliedCoupon
    ? {
        ...estimate,
        data: {
          ...estimate.data,
          fare: {
            ...estimate.data.fare,
            total: appliedCoupon.newTotal,
          },
        },
      }
    : estimate;

  return (
    <>
      {/* ========== MOBILE LAYOUT (Uber-like with Map) ========== */}
      <div className="lg:hidden h-full flex flex-col bg-white">
        {/* Map Section - Top 40% */}
        <div className="h-[40vh] relative">
          <MapView
            pickupLocation={pickupCoords}
            dropoffLocation={dropoffCoords}
            className="w-full h-full"
          />

          {/* Floating Progress Bar on Map */}
          <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => {
                  if (currentStep === 'sender') {
                    router.push('/dashboard');
                  } else {
                    handlePrevious();
                  }
                }}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {currentStep === 'sender' ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                )}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/search')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="New Search"
                >
                  <Home className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-900">
                {currentStep === 'sender' ? 'Pickup Details' :
                 currentStep === 'recipient' ? 'Delivery Details' :
                 currentStep === 'review' ? 'Review Order' : 'Payment'}
              </span>
              <span className="text-gray-600">
                {steps.findIndex(s => s.id === currentStep) + 1}/{steps.length}
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-0.5 flex-1 rounded-full transition-all ${
                    steps.findIndex(s => s.id === currentStep) >= index
                      ? 'bg-black'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Floating Fare Card on Map (Uber-style) */}
          {currentStep !== 'review' && currentStep !== 'payment' && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Trip Estimate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${((estimate?.data?.fare?.total || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {estimate?.data?.distance?.distanceKm?.toFixed(1)} km
                  </p>
                  <p className="text-xs text-gray-500">
                    {estimate?.data?.distance?.durationMinutes} min
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Section - Bottom 60% (Uber-style rounded top) */}
        <div className="flex-1 flex flex-col bg-gray-50 rounded-t-3xl -mt-4 relative z-10 shadow-2xl min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-2 min-h-0">
            <div className="pb-4">
              {currentStep === 'sender' && (
                <UserInfoForm
                  type="sender"
                  icon={MapPin}
                  title="Pickup Details"
                  userDetails={sender}
                  onUpdate={setSender}
                  addressEditable={false}
                />
              )}

              {currentStep === 'recipient' && (
                <UserInfoForm
                  type="recipient"
                  icon={User}
                  title="Delivery Details"
                  userDetails={recipient}
                  onUpdate={setRecipient}
                  addressEditable={false}
                />
              )}

              {currentStep === 'review' && (
                <ReviewOrder
                  sender={sender}
                  recipient={recipient}
                  estimate={estimate}
                  appliedCoupon={appliedCoupon}
                  onCouponApplied={handleCouponApplied}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentSection
                  estimate={finalEstimate}
                  orderId={orderId || undefined}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              )}
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom (Uber-style) */}
          <div className="shrink-0 bg-white border-t border-gray-200 p-4 shadow-lg sticky bottom-0">
            <div className="flex gap-3">
              {currentStep !== 'sender' && (
                <button
                  onClick={handlePrevious}
                  className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <Button
                onClick={
                  currentStep === 'review'
                    ? handleCreateOrder
                    : handleNext
                }
                disabled={
                  (currentStep !== 'review' && currentStep !== 'payment' && !canProceed()) ||
                  (currentStep === 'review' && isCreatingOrder) ||
                  currentStep === 'payment'
                }
                className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-full disabled:bg-gray-300 disabled:text-gray-500 shadow-lg transition-all"
              >
                {currentStep === 'review' && isCreatingOrder
                  ? 'Creating Order...'
                  : currentStep === 'review'
                  ? 'Continue to Payment'
                  : currentStep === 'payment'
                  ? 'Processing...'
                  : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== DESKTOP LAYOUT ========== */}
      <div className="hidden lg:flex h-full bg-white">
        {/* Left Side - Form Content (40% width) */}
        <div className="w-[480px] flex flex-col border-r border-gray-200">
          {/* Header with Navigation */}
          <div className="shrink-0 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentStep !== 'sender' && (
                  <button
                    onClick={handlePrevious}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h1 className="text-lg font-bold text-gray-900">New Delivery</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Dashboard"
                >
                  <Home className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => router.push('/search')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Exit"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="shrink-0">
            <ProgressSteps steps={steps} currentStep={currentStep} />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Fare Estimate Summary */}
            {currentStep !== 'review' && currentStep !== 'payment' && (
              <div className="mb-4">
                <FareEstimate estimate={estimate} />
              </div>
            )}

            {/* Step Content */}
            <div className="pb-24">
              {currentStep === 'sender' && (
                <UserInfoForm
                  type="sender"
                  icon={MapPin}
                  title="Sender Information"
                  userDetails={sender}
                  onUpdate={setSender}
                  addressEditable={false}
                />
              )}

              {currentStep === 'recipient' && (
                <UserInfoForm
                  type="recipient"
                  icon={User}
                  title="Recipient Details"
                  userDetails={recipient}
                  onUpdate={setRecipient}
                  addressEditable={false}
                />
              )}

              {currentStep === 'review' && (
                <ReviewOrder
                  sender={sender}
                  recipient={recipient}
                  estimate={estimate}
                  appliedCoupon={appliedCoupon}
                  onCouponApplied={handleCouponApplied}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentSection
                  estimate={finalEstimate}
                  orderId={orderId || undefined}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              )}
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="shrink-0 border-t border-gray-200 bg-white p-4">
            <div className="flex gap-3">
              {currentStep !== 'sender' && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-50 font-medium h-12"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={
                  currentStep === 'review'
                    ? handleCreateOrder
                    : handleNext
                }
                disabled={
                  (currentStep !== 'review' && currentStep !== 'payment' && !canProceed()) ||
                  (currentStep === 'review' && isCreatingOrder) ||
                  currentStep === 'payment'
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {currentStep === 'review' && isCreatingOrder
                  ? 'Creating Order...'
                  : currentStep === 'review'
                  ? 'Continue to Payment'
                  : currentStep === 'payment'
                  ? 'Processing...'
                  : 'Continue'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Map (60% width) */}
        <div className="flex-1 relative bg-gray-100">
          <MapView
            pickupLocation={pickupCoords}
            dropoffLocation={dropoffCoords}
            className="w-full h-full"
          />
        </div>
      </div>
    </>
  );
}
