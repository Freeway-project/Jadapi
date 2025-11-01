'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import toast from 'react-hot-toast';

interface TrackOrderWidgetProps {
  className?: string;
  initialOrderId?: string;
  onTrack?: (orderId: string) => void;
}

export default function TrackOrderWidget({ 
  className = '', 
  initialOrderId = '',
  onTrack 
}: TrackOrderWidgetProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState(initialOrderId);
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = async () => {
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    const cleanOrderId = orderId.trim().toUpperCase();

    // Validate order ID format (ORD-YYYY-XXX)
    const orderIdPattern = /^ORD-\d{4}-\d+$/;
    if (!orderIdPattern.test(cleanOrderId)) {
      toast.error('Invalid order ID format. Example: ORD-2025-001');
      return;
    }

    setIsTracking(true);

    // Optional callback
    if (onTrack) {
      onTrack(cleanOrderId);
    }

    // Small delay for better UX
    setTimeout(() => {
      router.push(`/track/${cleanOrderId}`);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrack();
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Track Your Order</h3>
          <p className="text-sm text-gray-500">Enter your order ID to see live tracking</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
            Order ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="orderId"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="ORD-2025-001"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       placeholder-gray-400 text-gray-900 font-mono text-sm
                       transition-colors"
              disabled={isTracking}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Format: ORD-YYYY-XXX (e.g., ORD-2025-001)
          </p>
        </div>

        <Button
          onClick={handleTrack}
          disabled={isTracking || !orderId.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg 
                   font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        >
          {isTracking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Opening Tracker...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Track Order
            </>
          )}
        </Button>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
          </div>
          <div>
            <p className="text-sm text-blue-900 font-medium mb-1">Real-time Tracking Available</p>
            <p className="text-xs text-blue-700">
              See your driver's live location, estimated arrival time, and delivery status updates in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
