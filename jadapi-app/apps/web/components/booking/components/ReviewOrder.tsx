import { Package } from 'lucide-react';
import { FareEstimateResponse } from '@/lib/api/delivery';
import { UserDetails } from './UserInfoForm';

interface ReviewOrderProps {
  sender: UserDetails;
  recipient: UserDetails;
  estimate: FareEstimateResponse;
}

export default function ReviewOrder({ sender, recipient, estimate }: ReviewOrderProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Package className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Review Your Order</h3>
      </div>

      <div className="space-y-4">
        {/* Route */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-5 border border-gray-200">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 ring-4 ring-blue-100"></div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{sender.address}</div>
                <div className="text-gray-600 mt-0.5">{sender.name} • {sender.phone}</div>
                {sender.notes && (
                  <div className="text-xs text-gray-500 mt-1 italic">"{sender.notes}"</div>
                )}
              </div>
            </div>
            <div className="ml-1.5 border-l-2 border-dashed border-blue-300 h-6"></div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1 ring-4 ring-green-100"></div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{recipient.address}</div>
                <div className="text-gray-600 mt-0.5">{recipient.name} • {recipient.phone}</div>
                {recipient.notes && (
                  <div className="text-xs text-gray-500 mt-1 italic">"{recipient.notes}"</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${((estimate?.data?.fare?.subtotal || 0) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${((estimate?.data?.fare?.tax || 0) / 100).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${(estimate?.data?.fare?.total / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
