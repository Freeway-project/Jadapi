'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Package, CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
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

      {/* Amount */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Amount Due</span>
          <span className="text-3xl font-bold text-blue-600">
            ${((estimate?.data?.fare?.total || 0) / 100).toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-2">CAD - Secure payment via Stripe</p>
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
        const orderIdFromIntent = paymentIntent.metadata?.orderId;
        if (orderIdFromIntent) {
          // Redirect to success page with orderId
          window.location.href = `/booking/success?orderId=${orderIdFromIntent}`;
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
      <div className="text-center py-6">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</h4>
        <p className="text-sm text-gray-600">Your order has been confirmed</p>
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
