import { Package } from 'lucide-react';
import { FareEstimateResponse } from '@/lib/api/delivery';

interface PaymentSectionProps {
  estimate: FareEstimateResponse;
}

export default function PaymentSection({ estimate }: PaymentSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
      </div>

      {/* Amount */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Amount Due</span>
          <span className="text-3xl font-bold text-blue-600">
            ${(estimate?.data?.fare?.total / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Placeholder */}
      <div className="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <Package className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-sm font-medium text-gray-700">Stripe Payment Integration</p>
        <p className="text-xs text-gray-500 mt-1">Secure payment processing coming soon</p>
      </div>
    </div>
  );
}
