'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Package } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { FareEstimateResponse } from '@/lib/api/delivery';
import { useAuthStore } from '@/lib/stores/authStore';
import ProgressSteps, { BookingStep } from './components/ProgressSteps';
import FareEstimate from './components/FareEstimate';
import UserInfoForm, { UserDetails } from './components/UserInfoForm';
import ReviewOrder from './components/ReviewOrder';
import PaymentSection from './components/PaymentSection';

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

  // Prefill sender info from logged-in user and addresses from search
  useEffect(() => {
    if (user) {
      setSender({
        name: user.profile?.name || '',
        phone: user.auth?.phone || user.phone || '',
        address: pickupAddress || '',
        notes: ''
      });
    }
  }, [user, pickupAddress]);

  // Prefill recipient address from search
  useEffect(() => {
    if (dropoffAddress) {
      setRecipient(prev => ({
        ...prev,
        address: dropoffAddress
      }));
    }
  }, [dropoffAddress]);

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Progress Steps */}
      <ProgressSteps steps={steps} currentStep={currentStep} />

      <div className="p-6 space-y-6">
        {/* Fare Estimate Summary */}
        <FareEstimate estimate={estimate} />

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
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {currentStep !== 'sender' && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md font-medium"
            >
              Continue to Payment
            </Button>
          ) : currentStep === 'payment' ? (
            <Button
              onClick={handlePaymentComplete}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md font-medium"
            >
              Confirm Payment
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md font-medium disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
