'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Package, CreditCard, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { FareEstimateResponse } from '../../../lib/api/delivery';
import { paymentAPI } from '../../../lib/api/payment';
import { tokenManager } from '../../../lib/api/client';
import { Button } from '@workspace/ui/components/button';
import toast from 'react-hot-toast';

interface PaymentSectionProps {
  estimate: FareEstimateResponse;
  orderId?: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    const config = await paymentAPI.getConfig();
    stripePromise = loadStripe(config.publishableKey);
  }
  return stripePromise;
};

export default function PaymentSection({
  estimate,
  orderId,
  onPaymentSuccess,
  onPaymentError,
}: PaymentSectionProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create PaymentIntent when component mounts
  useEffect(() => {
    // Check authentication before attempting to create payment intent
    const token = tokenManager.getToken();
    if (!token) {
      console.error('[Payment] No authentication token found');
      toast.error('Please sign in to continue with payment');
      router.push('/auth/signup');
      return;
    }

    if (!orderId) {
      setError('Order ID is required to process payment');
      return;
    }

    const createPaymentIntent = async () => {
      setIsLoading(true);
      try {
        const amount = estimate?.data?.fare?.total || 0;
        console.log('[Payment] Creating payment intent:', { orderId, amount });

        const response = await paymentAPI.createPaymentIntent({
          orderId: orderId!,
          amount,
          currency: 'cad',
          metadata: {
            orderId: orderId!,
            amount,
          },
        });

        console.log('[Payment] Payment intent created successfully');
        setClientSecret(response.data.clientSecret);
      } catch (err: any) {
        console.error('[Payment] Failed to create payment intent:', err);
        const errorMsg = err?.response?.data?.message || err?.message || 'Failed to initialize payment';
        setError(errorMsg);
        onPaymentError?.(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [orderId, estimate, router]);

  const options = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 space-y-3">
          {/* Subtotal (before tax) */}
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-700">Subtotal</span>
            <span className="text-lg font-semibold text-gray-900">
              ${(((estimate?.data?.fare?.total || 0) - (estimate?.data?.fare?.tax || 0)) / 100).toFixed(2)}
            </span>
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 group relative">
              <span className="text-gray-600">Taxes</span>
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              {/* Tooltip */}
              <div className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                <div className="space-y-1.5">
                  <div className="font-semibold mb-2 border-b border-gray-700 pb-1">Tax & Fee Breakdown</div>
                  <div className="flex justify-between">
                    <span>BC Courier Fee (2%)</span>
                    <span>${((estimate?.data?.fare?.fees?.bcCourierFee || 0) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BC Carbon Green Fee (0.9%)</span>
                    <span>${((estimate?.data?.fare?.fees?.bcCarbonFee || 0) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (1%)</span>
                    <span>${((estimate?.data?.fare?.fees?.serviceFee || 0) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-1.5 mt-1.5 font-medium">
                    <span>GST (5%)</span>
                    <span>${((estimate?.data?.fare?.fees?.gst || estimate?.data?.fare?.tax || 0) / 100).toFixed(2)}</span>
                  </div>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <span className="font-medium text-gray-900">
              ${((estimate?.data?.fare?.tax || 0) / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-5 py-4 border-t-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-gray-700 block">Total Amount</span>
              <span className="text-xs text-gray-600">{estimate?.data?.fare?.currency || 'CAD'} - Secure payment via Stripe</span>
            </div>
            <span className="text-3xl font-bold text-blue-600">
              ${((estimate?.data?.fare?.total || 0) / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Payment Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-700">Initializing secure payment...</p>
        </div>
      )}

      {clientSecret && !error && !isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <Elements stripe={getStripe()} options={options}>
            <CheckoutForm
              clientSecret={clientSecret}
              onSuccess={onPaymentSuccess}
              onError={onPaymentError}
            />
          </Elements>
        </div>
      )}

      {!orderId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <Package className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-yellow-900">Order must be created first</p>
          <p className="text-xs text-yellow-700 mt-1">Complete the previous steps to proceed</p>
        </div>
      )}
    </div>
  );
}

/**
 * Checkout Form Component (inside Stripe Elements Provider)
 */
function CheckoutForm({
  clientSecret,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentStatus('failed');
        const errorMsg = error.message || 'Payment failed';
        setErrorMessage(errorMsg);
        onError?.(errorMsg);
        toast.error(errorMsg);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('succeeded');
        toast.success('Payment successful!');
        onSuccess?.();

        // Get orderId from metadata or parent component
        const metadata = (paymentIntent as any).metadata as Record<string, string> | undefined;
        const orderIdFromIntent = metadata?.orderId;
        if (orderIdFromIntent) {
          // Wait 3 seconds then redirect to booking success page with invoice
          setTimeout(() => {
            window.location.href = `/booking/success?orderId=${orderIdFromIntent}`;
          }, 3000);
        }
      }
    } catch (err: any) {
      setPaymentStatus('failed');
      const errorMsg = err.message || 'Payment processing failed';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="text-center py-8">
        <div className="mb-4 animate-bounce">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h4>
        <p className="text-sm text-gray-600 mb-4">Your order has been confirmed</p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to invoice in 3 seconds...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-900">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 bg-black hover:bg-gray-900 text-white font-bold rounded-full disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          <span>Pay Now</span>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Secured by Stripe • Your payment information is encrypted
      </p>
    </form>
  );
}
