'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Truck, Clock, Route, Zap } from 'lucide-react';
import { BaseAnimation } from '../animations';

interface DeliveryMapProps {
  fromAddress?: string;
  toAddress?: string;
  estimatedTime?: number; // in minutes
  distance?: number; // in km
  price?: number;
  className?: string;
}

interface DeliveryStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
}

export default function DeliveryMap({
  fromAddress,
  toAddress,
  estimatedTime = 45,
  distance = 12.5,
  price = 18.99,
  className = ''
}: DeliveryMapProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const deliverySteps: DeliveryStep[] = [
    {
      id: 'pickup',
      title: 'Driver en route to pickup',
      description: 'Your driver is on the way to collect your package',
      icon: <Navigation className="w-5 h-5" />,
      status: currentStep >= 0 ? (currentStep > 0 ? 'completed' : 'active') : 'pending'
    },
    {
      id: 'collected',
      title: 'Package collected',
      description: 'Driver has picked up your package and is heading to destination',
      icon: <Truck className="w-5 h-5" />,
      status: currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'active') : 'pending'
    },
    {
      id: 'transit',
      title: 'In transit',
      description: 'Your package is on the way to the delivery address',
      icon: <Route className="w-5 h-5" />,
      status: currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'active') : 'pending'
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Package delivered successfully',
      icon: <Zap className="w-5 h-5" />,
      status: currentStep >= 3 ? 'completed' : 'pending'
    }
  ];

  const simulateDelivery = () => {
    setIsSimulating(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsSimulating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Map Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Delivery Route</h3>
            <p className="text-blue-100">Track your package in real-time</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${price}</div>
            <div className="text-blue-100 text-sm">Estimated cost</div>
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="relative bg-gray-50 h-64 flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#6B7280" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Delivery Animation */}
        <div className="relative z-10 w-full max-w-xs mx-auto">
          <BaseAnimation animationFile="global-delivery.json" className="w-full" />
        </div>

        {/* Route Path */}
        <div className="absolute inset-0 flex items-center justify-between px-12">
          {/* From Point */}
          <div className="relative">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
              Pickup
            </div>
          </div>

          {/* Dashed Line */}
          <div className="flex-1 mx-4">
            <svg className="w-full h-2" viewBox="0 0 200 8">
              <line
                x1="0"
                y1="4"
                x2="200"
                y2="4"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeDasharray="8,4"
                className="animate-pulse"
              />
            </svg>
          </div>

          {/* To Point */}
          <div className="relative">
            <div className="w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
              Delivery
            </div>
          </div>
        </div>
      </div>

      {/* Route Information */}
      <div className="p-6 space-y-4">
        {/* Distance & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-blue-600 mb-1">
              <Route className="w-4 h-4" />
              <span className="text-sm font-medium">Distance</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{distance} km</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-green-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Estimated Time</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{estimatedTime} min</div>
          </div>
        </div>

        {/* Addresses */}
        {(fromAddress || toAddress) && (
          <div className="space-y-3 border-t border-gray-100 pt-4">
            {fromAddress && (
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full mt-1.5"></div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Pickup from</div>
                  <div className="text-gray-900">{fromAddress}</div>
                </div>
              </div>
            )}
            {toAddress && (
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Deliver to</div>
                  <div className="text-gray-900">{toAddress}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delivery Steps */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Delivery Progress</h4>
            <button
              onClick={simulateDelivery}
              disabled={isSimulating}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {isSimulating ? 'Simulating...' : 'Simulate Delivery'}
            </button>
          </div>

          <div className="space-y-3">
            {deliverySteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
                  step.status === 'completed'
                    ? 'bg-green-50 border border-green-200'
                    : step.status === 'active'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    step.status === 'completed'
                      ? 'bg-green-600 text-white'
                      : step.status === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      step.status === 'completed'
                        ? 'text-green-900'
                        : step.status === 'active'
                        ? 'text-blue-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-sm text-gray-600">{step.description}</div>
                </div>
                {step.status === 'active' && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                )}
                {step.status === 'completed' && (
                  <div className="text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}