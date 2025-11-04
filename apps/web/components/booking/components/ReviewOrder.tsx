'use client';

import { useState } from 'react';
import { Package, Tag, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { FareEstimateResponse } from '../../../lib/api/delivery';
import { UserDetails } from './UserInfoForm';
import { couponAPI } from '../../../lib/api/coupon';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';

interface ReviewOrderProps {
  sender: UserDetails;
  recipient: UserDetails;
  estimate: FareEstimateResponse;
  appliedCoupon?: {
    couponId: string;
    code: string;
    discount: number;
    discountedSubtotal: number;
    gst: number;
    newTotal: number;
  } | null;
  onCouponApplied?: (couponData: {
    couponId: string;
    code: string;
    discount: number;
    discountedSubtotal: number;
    gst: number;
    newTotal: number;
  } | null) => void;
}

export default function ReviewOrder({ sender, recipient, estimate, appliedCoupon, onCouponApplied }: ReviewOrderProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await couponAPI.validateCoupon({
        code: couponCode.trim(),
        subtotal: estimate?.data?.fare?.baseFare || 0, // Using baseFare as subtotal
        baseFare: estimate?.data?.fare?.baseFare || 0,
      });

      if (response.success && response.data) {
        const couponData = {
          couponId: response.data.coupon.code,
          code: response.data.coupon.code,
          discount: response.data.discount,
          discountedSubtotal: response.data.discountedSubtotal,
          gst: response.data.gst,
          newTotal: response.data.newTotal,
        };
        onCouponApplied?.(couponData);
        setError(null);
        toast.success(`Coupon "${couponCode}" applied! You saved $${(response.data.discount / 100).toFixed(2)}`);
      } else {
        const errorMsg = response.message || 'Invalid coupon code';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to validate coupon';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setError(null);
    onCouponApplied?.(null);
    toast('Coupon removed');
  };
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

        {/* Coupon Input */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Have a coupon?</h4>
          {!appliedCoupon ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <Input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="h-9 text-xs pl-8 border-gray-200 focus:border-blue-600 focus:ring-0"
                    disabled={isValidating}
                  />
                </div>
                <Button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isValidating}
                  className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {isValidating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">
                  Coupon "{appliedCoupon.code}" applied
                </span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Price Summary</h4>
          <div className="space-y-3">
            {appliedCoupon && (
              <div className="flex justify-between text-green-600 font-medium text-sm">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-${(appliedCoupon.discount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${appliedCoupon
                    ? (appliedCoupon.newTotal / 100).toFixed(2)
                    : ((estimate?.data?.fare?.total || 0) / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">Includes all taxes and fees</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
