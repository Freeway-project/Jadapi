'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Package } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { FareEstimateResponse } from '@/lib/api/delivery';
import { useAuthStore } from '@/lib/stores/authStore';
import { geocodeAddress } from '@/lib/utils/geocoding';
import ProgressSteps, { BookingStep } from './components/ProgressSteps';
import FareEstimate from './components/FareEstimate';
import UserInfoForm, { UserDetails } from './components/UserInfoForm';
import ReviewOrder from './components/ReviewOrder';
import PaymentSection from './components/PaymentSection';
import MapView from '@/components/map/MapView';

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
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<BookingStep>('sender');

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
    newTotal: number;
  } | null>(null);

  // Create estimate object from initial data
  const estimate: FareEstimateResponse = {
    success: true,
    data: {
      fare: {
        baseFare: 0,
        distanceFare: 0,
        timeFare: 0,
        bandMultiplier: 1,
        bandLabel: '',
        sizeMultiplier: 1,
        edgeSurcharge: 0,
        subtotal: initialFareEstimate.total,
        tax: 0,
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
    // Create unpaid order
    console.log('Creating unpaid order:', {
      recipient,
      sender,
      estimate,
      coupon: appliedCoupon ? {
        couponId: appliedCoupon.couponId,
        code: appliedCoupon.code,
        discount: appliedCoupon.discount,
      } : undefined,
    });
    // TODO: Call deliveryAPI.createOrder with paymentStatus: 'unpaid' and coupon info
  };

  const handleCouponApplied = (couponData: { couponId: string; code: string; discount: number; newTotal: number } | null) => {
    setAppliedCoupon(couponData);
  };

  const handlePaymentComplete = async () => {
    // After payment is confirmed, mark order as paid
    console.log('Payment completed, confirming order');
    // TODO: Update order status to 'paid'
    onComplete?.();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Progress Steps - Fixed at top */}
      <div className="shrink-0">
        <ProgressSteps steps={steps} currentStep={currentStep} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2 min-h-0">
        {/* Fare Estimate Summary - Hide on review and payment steps */}
        {currentStep !== 'review' && currentStep !== 'payment' && (
          <div className="mb-2">
            <FareEstimate estimate={estimate} />
          </div>
        )}

        {/* Step Content */}
        <div className="pb-20">
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
            <PaymentSection estimate={estimate} />
          )}
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="shrink-0 border-t border-gray-200 bg-white p-3 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex gap-2">
          {currentStep !== 'sender' && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-50 font-medium h-11"
            >
              Back
            </Button>
          )}

          <Button
            onClick={
              currentStep === 'review'
                ? () => {
                    handleCreateOrder();
                    handleNext();
                  }
                : currentStep === 'payment'
                ? handlePaymentComplete
                : handleNext
            }
            disabled={currentStep !== 'review' && currentStep !== 'payment' && !canProceed()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-11 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {currentStep === 'review'
              ? 'Continue to Payment'
              : currentStep === 'payment'
              ? 'Confirm Payment'
              : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
