'use client';

import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Package, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { FareEstimateResponse } from '@/lib/api/delivery';
import { useAuthStore } from '@/lib/stores/authStore';

interface BookingFlowProps {
  estimate: FareEstimateResponse;
  pickupAddress?: string;
  dropoffAddress?: string;
  onBack?: () => void;
  onComplete?: () => void;
}

type BookingStep = 'sender' | 'recipient' | 'payment' | 'review';

interface RecipientDetails {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

interface SenderDetails {
  name: string;
  phone: string;
  address: string;
}

export default function BookingFlow({ estimate, pickupAddress, dropoffAddress, onBack, onComplete }: BookingFlowProps) {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<BookingStep>('sender');
  const [recipient, setRecipient] = useState<RecipientDetails>({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [sender, setSender] = useState<SenderDetails>({
    name: '',
    phone: '',
    address: ''
  });

  // Prefill sender info from logged-in user and addresses from search
  useEffect(() => {
    if (user) {
      setSender({
        name: user.profile?.name || '',
        phone: user.auth?.phone || user.phone || '',
        address: pickupAddress || ''
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
    { id: 'sender', label: 'Sender', icon: MapPin },
    { id: 'recipient', label: 'Recipient', icon: User },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Package }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === 'sender') setCurrentStep('recipient');
    else if (currentStep === 'recipient') setCurrentStep('payment');
    else if (currentStep === 'payment') setCurrentStep('review');
  };

  const handlePrevious = () => {
    if (currentStep === 'review') setCurrentStep('payment');
    else if (currentStep === 'payment') setCurrentStep('recipient');
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

  const handleBooking = async () => {
    // TODO: Implement actual booking API call
    console.log('Booking:', { recipient, sender, estimate });
    onComplete?.();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-green-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  <StepIcon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isActive ? 'text-blue-600' :
                  isCompleted ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 transition-all ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Fare Estimate Summary */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Estimated Fare</p>
            <p className="text-2xl font-bold text-blue-600">
              ${((estimate?.data?.fare?.total || 0) / 100).toFixed(2)}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-gray-500">Distance: {estimate?.data?.distance?.distanceKm?.toFixed(1)} km</p>
            <p className="text-xs text-gray-500">Duration: ~{estimate?.data?.distance?.durationMinutes} min</p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {currentStep === 'sender' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sender Information</h3>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="sender-name" className="text-sm font-medium text-gray-700">Your Name *</Label>
                <Input
                  id="sender-name"
                  type="text"
                  placeholder="Enter your name"
                  value={sender.name}
                  onChange={(e) => setSender({ ...sender, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sender-phone" className="text-sm font-medium text-gray-700">Your Phone Number *</Label>
                <Input
                  id="sender-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={sender.phone}
                  onChange={(e) => setSender({ ...sender, phone: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sender-address" className="text-sm font-medium text-gray-700">Pickup Address *</Label>
                <Input
                  id="sender-address"
                  type="text"
                  placeholder="Full address"
                  value={sender.address}
                  onChange={(e) => setSender({ ...sender, address: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'recipient' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Who will receive this delivery?</h3>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="recipient-name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input
                  id="recipient-name"
                  type="text"
                  placeholder="Enter recipient's name"
                  value={recipient.name}
                  onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="recipient-phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                <Input
                  id="recipient-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={recipient.phone}
                  onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="recipient-address" className="text-sm font-medium text-gray-700">Delivery Address *</Label>
                <Input
                  id="recipient-address"
                  type="text"
                  placeholder="Full address"
                  value={recipient.address}
                  onChange={(e) => setRecipient({ ...recipient, address: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="recipient-notes" className="text-sm font-medium text-gray-700">Delivery Instructions (Optional)</Label>
                <textarea
                  id="recipient-notes"
                  placeholder="E.g., Leave at door, Ring doorbell twice"
                  value={recipient.notes}
                  onChange={(e) => setRecipient({ ...recipient, notes: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}


        {currentStep === 'payment' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">Choose your payment method</p>

              <div className="space-y-2">
                <button className="w-full p-4 border-2 border-blue-600 bg-blue-50 rounded-lg text-left transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Credit/Debit Card</span>
                    </div>
                    <span className="text-blue-600">•</span>
                  </div>
                </button>

                <button className="w-full p-4 border border-gray-300 rounded-lg text-left hover:border-gray-400 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gray-400 rounded" />
                    <span className="font-medium text-gray-600">Cash on Delivery</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Review & Confirm</h3>
            </div>

            <div className="space-y-3">
              {/* Delivery Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Delivery Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium text-right">{sender.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium text-right">{recipient.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient:</span>
                    <span className="font-medium">{recipient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{estimate?.data?.distance?.distanceKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Time:</span>
                    <span className="font-medium">{estimate?.data?.distance?.durationMinutes} min</span>
                  </div>
                </div>
              </div>

              {/* Fare Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${(estimate?.data?.fare?.total / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        {currentStep === 'review' ? (
          <Button
            onClick={handleBooking}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Confirm Booking
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
