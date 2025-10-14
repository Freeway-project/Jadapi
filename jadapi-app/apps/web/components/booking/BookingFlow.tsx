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
  estimate: FareEstimateResponse;
  pickupAddress?: string;
  dropoffAddress?: string;
  onBack?: () => void;
  onComplete?: () => void;
}

export default function BookingFlow({
  estimate,
  pickupAddress,
  dropoffAddress,
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

  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [initialPrefillDone, setInitialPrefillDone] = useState(false);

  // Prefill sender info from logged-in user and addresses from search (only once)
  useEffect(() => {
    if (!initialPrefillDone && user) {
      setSender({
        name: user.profile?.name || '',
        phone: user.auth?.phone || user.phone || '',
        address: pickupAddress || '',
        notes: ''
      });

      if (dropoffAddress) {
        setRecipient(prev => ({
          ...prev,
          address: dropoffAddress
        }));
      }

      setInitialPrefillDone(true);
    }
  }, [user, pickupAddress, dropoffAddress, initialPrefillDone]);

  // Geocode pickup address when it changes
  useEffect(() => {
    const geocodePickup = async () => {
      if (sender.address) {
        const coords = await geocodeAddress(sender.address);
        setPickupCoords(coords || undefined);
      }
    };
    geocodePickup();
  }, [sender.address]);

  // Geocode dropoff address when it changes
  useEffect(() => {
    const geocodeDropoff = async () => {
      if (recipient.address) {
        const coords = await geocodeAddress(recipient.address);
        setDropoffCoords(coords || undefined);
      }
    };
    geocodeDropoff();
  }, [recipient.address]);

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
    console.log('Creating unpaid order:', { recipient, sender, estimate });
    // TODO: Call deliveryAPI.createOrder with paymentStatus: 'unpaid'
  };

  const handlePaymentComplete = async () => {
    // After payment is confirmed, mark order as paid
    console.log('Payment completed, confirming order');
    // TODO: Update order status to 'paid'
    onComplete?.();
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Progress Steps */}
      <ProgressSteps steps={steps} currentStep={currentStep} />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Fare Estimate Summary */}
        <FareEstimate estimate={estimate} />

        {/* Map View - Show when dropoff address is entered */}
        {dropoffCoords && (
          <div className="rounded-lg overflow-hidden">
            <MapView
              pickupLocation={pickupCoords}
              dropoffLocation={dropoffCoords}
              className="h-48 sm:h-64 w-full"
            />
          </div>
        )}

        {/* Step Content */}
        <div className="space-y-4">
          {currentStep === 'sender' && (
            <UserInfoForm
              type="sender"
              icon={MapPin}
              title="Sender Information"
              userDetails={sender}
              onUpdate={setSender}
            />
          )}

          {currentStep === 'recipient' && (
            <UserInfoForm
              type="recipient"
              icon={User}
              title="Recipient Details"
              userDetails={recipient}
              onUpdate={setRecipient}
            />
          )}

          {currentStep === 'review' && (
            <ReviewOrder
              sender={sender}
              recipient={recipient}
              estimate={estimate}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentSection estimate={estimate} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {currentStep !== 'sender' && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1 border-gray-200 text-gray-900 hover:bg-gray-50 font-medium"
            >
              Back
            </Button>
          )}

          {currentStep === 'review' ? (
            <Button
              onClick={() => {
                handleCreateOrder();
                handleNext();
              }}
              className="flex-1 bg-black hover:bg-gray-800 text-white font-medium"
            >
              Continue to Payment
            </Button>
          ) : currentStep === 'payment' ? (
            <Button
              onClick={handlePaymentComplete}
              className="flex-1 bg-black hover:bg-gray-800 text-white font-medium"
            >
              Confirm Payment
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-black hover:bg-gray-800 text-white font-medium disabled:bg-gray-200 disabled:text-gray-400"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
