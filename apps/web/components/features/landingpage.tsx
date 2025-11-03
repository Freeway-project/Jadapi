'use client';

import { MapPin, Package, Shield, Clock, BarChart3, FileText, Camera, CheckCircle, Search, Loader2 } from 'lucide-react';
import { BaseAnimation } from '../animations';
import Header from '../layout/Header';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function JaddpiLanding() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = () => {
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 md:pb-24">
        <div className="text-center max-w-3xl mx-auto">

          <BaseAnimation animationFile="global-delivery.json" width={150} height={150} className="mx-auto mb-4 sm:w-[200px] sm:h-[200px] md:w-[250px] md:h-[250px]" />

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Scheduled parcel delivery in Surrey and Langley.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Create an order in minutes.  Live tracking with photo proof.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <a href="/search" className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 text-sm sm:text-base">
              Create an order
            </a>
            <button
              onClick={() => {
                const trackSection = document.getElementById('track-order');
                trackSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-blue-300 hover:text-blue-600 transition text-sm sm:text-base"
            >
              Track a parcel
            </button>
          </div>
        </div>
      </section>

      {/* Track Order Section */}
      <section id="track-order" className="bg-gradient-to-br from-blue-50 to-white py-8 sm:py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 md:p-12">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl flex-shrink-0">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Track Your Delivery</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Enter your order ID to see real-time tracking</p>
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label htmlFor="track-orderId" className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="track-orderId"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    placeholder="ORD-2025-001"
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             placeholder-gray-400 text-gray-900 font-mono text-lg
                             transition-all hover:border-gray-400"
                    disabled={isTracking}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Format: ORD-YYYY-XXX (e.g., ORD-2025-001)
                </p>
              </div>

              <button
                onClick={handleTrack}
                disabled={isTracking || !orderId.trim()}
                className="w-full py-3 sm:py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl
                         font-semibold text-base sm:text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-blue-600/30
                         hover:shadow-xl hover:shadow-blue-600/40"
              >
                {isTracking ? (
                  <>
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    <span>Opening Tracker...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Track My Order</span>
                  </>
                )}
              </button>
            </div>

            {/* Info Cards */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-900 font-semibold mb-1">Real-time Updates</p>
                    <p className="text-[11px] sm:text-xs text-blue-700">
                      See your driver's live location and estimated arrival time
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-green-900 font-semibold mb-1">Photo Proof</p>
                    <p className="text-[11px] sm:text-xs text-green-700">
                      Get instant delivery confirmation with photos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                <strong className="text-gray-900">Need help?</strong> Your order ID was sent via email and SMS after booking.
                Can't find it? <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact support</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Notice */}
      <section className="bg-blue-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm sm:text-base text-gray-700 mb-4">
            Currently available <strong className="text-blue-700">only in Surrey and Langley, BC</strong>. Join the waitlist for nearby cities.
          </p>
          {/* <a href="/waitlist" className="inline-block px-6 py-2 border-2 border-blue-300 text-blue-700 rounded-lg font-medium hover:bg-white transition">
            Notify me when you expand
          </a> */}
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 px-2">Surrey & Langley-focused reliability</h3>
            <p className="text-gray-600 text-xs sm:text-sm px-2">Local expertise for faster, more reliable delivery across the city</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 px-2">Google-verified addresses</h3>
            <p className="text-gray-600 text-xs sm:text-sm px-2">Accurate drop-offs with validated address verification</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 px-2">Barcode-secure handling</h3>
            <p className="text-gray-600 text-xs sm:text-sm px-2">Every scan tracked and verified throughout delivery</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 px-2">Live tracking + photo proof</h3>
            <p className="text-gray-600 text-xs sm:text-sm px-2">Real-time updates with delivery confirmation photos</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-blue-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">How it works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">1</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Create order</h3>
              <p className="text-sm sm:text-base text-gray-600">Enter sender and receiver details, item description, and any special declarations</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">2</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Get scheduled</h3>
              <p className="text-sm sm:text-base text-gray-600">We batch pickups at <strong>10:00</strong> and <strong>12:00</strong> for efficient routing</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">3</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Delivered</h3>
              <p className="text-sm sm:text-base text-gray-600">Driver scans barcode at delivery; you get photo-backed confirmation instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section id="business" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 md:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Built for business</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-2xl mx-auto px-2">
            GST/invoicing-ready transactions, multi-address book management, and CSV export for seamless accounting
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium">Invoice support</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium">CSV exports</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium">Bulk ordering</span>
            </div>
          </div>
          <a href="/contact" className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 text-sm sm:text-base">
            Talk to dispatch
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 sm:mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Transparent base fare plus per-kilometer rate within Surrey and Langley. Optional insurance add-on for extra peace of mind.
          </p>

          <div className="max-w-md mx-auto bg-white rounded-xl p-6 sm:p-8 border-2 border-blue-600 shadow-xl">
            <div className="text-center mb-6">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Base + Distance</div>
              <p className="text-sm sm:text-base text-gray-600">Pay only for what you need</p>
            </div>
            <ul className="space-y-3 mb-6 sm:mb-8">
              <li className="flex items-center gap-3 text-sm sm:text-base text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Transparent base fare</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Per-km rate within Surrey & Langley</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Optional insurance add-on</span>
              </li>
              <li className="flex items-center gap-3 text-sm sm:text-base text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Photo proof of delivery</span>
              </li>
            </ul>
            <a href="/search" className="block w-full text-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 text-sm sm:text-base">
              Get started
            </a>
          </div>

          <div className="mt-8 flex justify-center">
            <BaseAnimation animationFile="truck-delivery-service.json" width={200} height={120} className="sm:w-[300px] sm:h-[180px] md:w-[450px] md:h-[250px]" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">Frequently asked questions</h2>

        <div className="space-y-3 sm:space-y-4">
          <details className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 group">
            <summary className="font-semibold text-sm sm:text-base text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>What area do you serve?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform text-sm">▼</span>
            </summary>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">Currently, jaddpi operates exclusively within Surrey and Langley, BC. We do not ship hazardous items or materials. Join our waitlist to be notified when we expand to nearby cities.</p>
          </details>

          <details className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 group">
            <summary className="font-semibold text-sm sm:text-base text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>What are the delivery windows?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform text-sm">▼</span>
            </summary>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">We batch pickups at 10:00 AM and 12:00 PM daily. Typical delivery ETAs are 2-4 hours from pickup, depending on route optimization and traffic conditions within Surrey and Langley.</p>
          </details>

          <details className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 group">
            <summary className="font-semibold text-sm sm:text-base text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>Do you offer insurance?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform text-sm">▼</span>
            </summary>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">Yes, we offer optional insurance as an add-on during order creation. This provides additional coverage for valuable items beyond our standard handling guarantees.</p>
          </details>

          <details className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 group">
            <summary className="font-semibold text-sm sm:text-base text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>Can I share tracking links?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform text-sm">▼</span>
            </summary>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">Absolutely. Every order receives a unique tracking link that can be shared with anyone. Recipients can view real-time status updates without creating an account.</p>
          </details>

          <details className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 group">
            <summary className="font-semibold text-sm sm:text-base text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>What if the recipient isn't home?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform text-sm">▼</span>
            </summary>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed">Our driver will attempt contact via the provided phone number. If unsuccessful, we can leave the parcel in a safe location (with photo proof) if authorized, or arrange a redelivery at no extra charge.</p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl font-bold text-white">jaddpi</div>
              <span className="px-2 sm:px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-[10px] sm:text-xs font-medium">Local to Surrey & Langley, BC</span>
            </div>

            <nav className="flex gap-6 sm:gap-8 text-xs sm:text-sm">
              <a href="/terms" className="hover:text-white transition">Terms</a>
              <a href="/privacy" className="hover:text-white transition">Privacy</a>
              <a href="/contact" className="hover:text-white transition">Contact</a>
            </nav>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800 text-center text-xs sm:text-sm">
            © 2025 jaddpi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}