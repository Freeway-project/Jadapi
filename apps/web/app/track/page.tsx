'use client';

import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import TrackOrderWidget from '../../components/tracking/TrackOrderWidget';

export default function TrackPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600">
            Enter your order ID to see real-time delivery updates
          </p>
        </div>

        {/* Track Widget */}
        <TrackOrderWidget 
          onTrack={(orderId: string) => {
            console.log('Tracking order:', orderId);
          }}
        />

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Track Your Order</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Find Your Order ID</h3>
                <p className="text-sm text-gray-600">
                  Check your email or SMS for your order confirmation. Your Order ID looks like: <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">ORD-2025-001</code>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Enter Order ID</h3>
                <p className="text-sm text-gray-600">
                  Type or paste your Order ID in the input field above. The format is automatically validated.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">View Live Tracking</h3>
                <p className="text-sm text-gray-600">
                  See your driver's real-time location on the map, delivery status updates, and estimated arrival time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Common Questions</h2>
          
          <div className="space-y-4">
            <details className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between py-2">
                <span>I can't find my Order ID</span>
                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 pl-4">
                Your Order ID was sent to your email and phone number immediately after placing the order. 
                Check your spam folder or SMS messages. If you still can't find it, contact our support team.
              </p>
            </details>

            <details className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between py-2 border-t border-gray-200 pt-4">
                <span>The tracker says "No driver assigned"</span>
                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 pl-4">
                This means your order is confirmed but waiting for the next pickup batch (10:00 AM or 12:00 PM). 
                A driver will be assigned shortly before the scheduled pickup time.
              </p>
            </details>

            <details className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between py-2 border-t border-gray-200 pt-4">
                <span>Can I share the tracking link?</span>
                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 pl-4">
                Yes! Once you're on the tracking page, you can share the URL with anyone. 
                They'll be able to see the delivery status without logging in.
              </p>
            </details>

            <details className="group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between py-2 border-t border-gray-200 pt-4">
                <span>How often does the location update?</span>
                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 pl-4">
                When your order is active (picked up or in transit), the driver's location updates every 5 seconds. 
                You'll see the marker move in real-time on the map.
              </p>
            </details>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help? <a href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
