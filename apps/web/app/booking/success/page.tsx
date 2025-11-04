'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Download, Home, Package, MapPin, User, CreditCard, FileText, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ordersAPI, Invoice, Order } from '../../../lib/api/orders';
import toast from 'react-hot-toast';

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setIsLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch order details
        const orderResponse = await ordersAPI.getOrder(orderId);
        setOrder(orderResponse.data.order);

        // Try to fetch invoice if payment is complete
        try {
          const invoiceResponse = await ordersAPI.getOrderInvoice(orderId);
          setInvoice(invoiceResponse.data.invoice);
        } catch (invoiceError) {
          // Invoice might not be available yet if payment is still processing
          console.log('Invoice not available yet:', invoiceError);
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err?.response?.data?.message || 'Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();

    // Poll for updates if payment is still processing
    const pollInterval = setInterval(async () => {
      try {
        const orderResponse = await ordersAPI.getOrder(orderId);
        const updatedOrder = orderResponse.data.order;
        setOrder(updatedOrder);

        // If payment is now complete, try to fetch invoice
        if (updatedOrder.paymentStatus === 'paid' && !invoice) {
          try {
            const invoiceResponse = await ordersAPI.getOrderInvoice(orderId);
            setInvoice(invoiceResponse.data.invoice);
          } catch (invoiceError) {
            console.log('Invoice not available yet:', invoiceError);
          }
        }

        // Stop polling if payment is complete
        if (updatedOrder.paymentStatus === 'paid') {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [orderId, invoice]);

  const formatCurrency = (amount: number, currency: string = 'CAD') => {
    return `${currency} $${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order details'}</p>
          <Button
            onClick={() => router.push('/search')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-4">Your delivery is on its way</p>
          <div className="inline-block bg-gray-100 rounded-full px-6 py-2">
            <p className="text-sm font-medium text-gray-700">
              Order ID: <span className="font-bold text-gray-900">{order.orderId}</span>
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Order Details
          </h2>

          {/* Pickup */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">Pickup</p>
                <p className="text-sm text-gray-700">{order.pickup.address}</p>
                {order.pickup.contactName && (
                  <p className="text-xs text-gray-600 mt-1">
                    {order.pickup.contactName} • {order.pickup.contactPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dropoff */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">Delivery</p>
                <p className="text-sm text-gray-700">{order.dropoff.address}</p>
                {order.dropoff.contactName && (
                  <p className="text-xs text-gray-600 mt-1">
                    {order.dropoff.contactName} • {order.dropoff.contactPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Package & Distance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Package Size</p>
              <p className="text-sm font-semibold text-gray-900">{order.package.size}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Distance</p>
              <p className="text-sm font-semibold text-gray-900">{order.distance.km.toFixed(1)} km</p>
            </div>
          </div>
        </div>

        {/* Invoice/Receipt */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Receipt
          </h2>

          {order.paymentStatus === 'paid' ? (
            <>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(invoice?.pricing?.baseFare || order.pricing.baseFare, invoice?.pricing?.currency || order.pricing.currency)}
                  </span>
                </div>

                {(invoice?.pricing?.distanceSurcharge || order.pricing.distanceSurcharge) > 0 && (
                  <div className="flex justify-between text-sm text-xs">
                    <span className="text-gray-600">Distance Surcharge</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(invoice?.pricing?.distanceSurcharge || order.pricing.distanceSurcharge, invoice?.pricing?.currency || order.pricing.currency)}
                    </span>
                  </div>
                )}

                {(invoice?.pricing?.fees || order.pricing.fees) && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">BC Courier Fee (2%)</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(invoice?.pricing?.fees?.bcCourierFee || order.pricing.fees?.bcCourierFee || 0, invoice?.pricing?.currency || order.pricing.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">BC Carbon Green Fee (0.9%)</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(invoice?.pricing?.fees?.bcCarbonFee || order.pricing.fees?.bcCarbonFee || 0, invoice?.pricing?.currency || order.pricing.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Service Fee (1%)</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(invoice?.pricing?.fees?.serviceFee || order.pricing.fees?.serviceFee || 0, invoice?.pricing?.currency || order.pricing.currency)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(invoice?.pricing?.subtotal || order.pricing.subtotal, invoice?.pricing?.currency || order.pricing.currency)}
                  </span>
                </div>

                {(invoice?.pricing?.couponDiscount || order.pricing.couponDiscount) && (invoice?.pricing?.couponDiscount || order.pricing.couponDiscount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({invoice?.pricing?.couponCode || order.coupon?.code})</span>
                    <span className="font-medium">
                      -{formatCurrency(invoice?.pricing?.couponDiscount || order.pricing.couponDiscount || 0, invoice?.pricing?.currency || order.pricing.currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(invoice?.pricing?.tax || order.pricing.tax, invoice?.pricing?.currency || order.pricing.currency)}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(invoice?.pricing?.total || order.pricing.total, invoice?.pricing?.currency || order.pricing.currency)}
                  </span>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-semibold text-gray-900">Payment Complete</p>
                </div>
                {invoice && (
                  <>
                    <p className="text-xs text-gray-600">
                      Invoice: {invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-gray-600">
                      Paid on: {formatDate(invoice.payment.paidAt)}
                    </p>
                  </>
                )}
                <p className="text-xs text-gray-600">
                  Status: <span className="font-medium text-green-600">PAID</span>
                </p>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 rounded-xl p-6 text-center">
              <Loader2 className="w-8 h-8 text-yellow-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-900 mb-1">Processing Payment</p>
              <p className="text-xs text-gray-600">
                Your payment is being processed. This page will update automatically once complete.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(order.pricing.total, order.pricing.currency)}</span>
                </div>
                <p className="text-xs text-gray-500">Order ID: {order.orderId}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Track Order - Primary CTA */}
          <Button
            onClick={() => router.push(`/track/${order.orderId}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Track Your Delivery
          </Button>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="flex-1 h-12 rounded-full font-semibold border-gray-300"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button
              onClick={() => router.push('/search')}
              variant="outline"
              className="flex-1 h-12 rounded-full font-semibold border-gray-300"
            >
              <Package className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading your order...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
