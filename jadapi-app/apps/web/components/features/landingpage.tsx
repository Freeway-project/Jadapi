import { MapPin, Package, Shield, Clock, BarChart3, FileText, Camera, CheckCircle } from 'lucide-react';
import { BaseAnimation } from '../animations';

export default function JadapiLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">jadapi</div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-gray-900 transition">How it works</a>
            <a href="#pricing" className="hover:text-gray-900 transition">Pricing</a>
            <a href="#business" className="hover:text-gray-900 transition">For Business</a>
          </nav>
          <a
            href="/auth/signup"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow"
          >
            Sign up
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto">
      
          <BaseAnimation animationFile="global-delivery.json" width={250} height={250} className="mx-auto mb-6" />
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Scheduled parcel delivery in Vancouver.
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Create an order in minutes. Batch pickups at 10:00 & 12:00. Live tracking with photo proof.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/app/sign-up" className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
              Create an order
            </a>
            <a href="/t/track" className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-blue-300 hover:text-blue-600 transition">
              Track a parcel
            </a>
          </div>
        </div>
      </section>

      {/* Coverage Notice */}
      <section className="bg-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-700 mb-4">
            Currently available <strong className="text-blue-700">only in Vancouver, BC</strong>. Join the waitlist for nearby cities.
          </p>
          {/* <a href="/waitlist" className="inline-block px-6 py-2 border-2 border-blue-300 text-blue-700 rounded-lg font-medium hover:bg-white transition">
            Notify me when you expand
          </a> */}
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Vancouver-focused reliability</h3>
            <p className="text-gray-600 text-sm">Local expertise for faster, more reliable delivery across the city</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Google-verified addresses</h3>
            <p className="text-gray-600 text-sm">Accurate drop-offs with validated address verification</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Barcode-secure handling</h3>
            <p className="text-gray-600 text-sm">Every scan tracked and verified throughout delivery</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live tracking + photo proof</h3>
            <p className="text-gray-600 text-sm">Real-time updates with delivery confirmation photos</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create order</h3>
              <p className="text-gray-600">Enter sender and receiver details, item description, and any special declarations</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get scheduled</h3>
              <p className="text-gray-600">We batch pickups at <strong>10:00</strong> and <strong>12:00</strong> for efficient routing</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Delivered</h3>
              <p className="text-gray-600">Driver scans barcode at delivery; you get photo-backed confirmation instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section id="business" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for business</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            GST/invoicing-ready transactions, multi-address book management, and CSV export for seamless accounting
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Invoice support</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-medium">CSV exports</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Bulk ordering</span>
            </div>
          </div>
          <a href="/contact" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
            Talk to dispatch
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Transparent base fare plus per-kilometer rate within Vancouver. Optional insurance add-on for extra peace of mind.
          </p>
          
          <div className="max-w-md mx-auto bg-white rounded-xl p-8 border-2 border-blue-600 shadow-xl">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">Base + Distance</div>
              <p className="text-gray-600">Pay only for what you need</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Transparent base fare</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Per-km rate within Vancouver</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Optional insurance add-on</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Photo proof of delivery</span>
              </li>
            </ul>
            <a href="/app/sign-up" className="block w-full text-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
              Get started
            </a>
          </div>

          <BaseAnimation animationFile="truck-delivery-service.json" width={450} height={250} />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently asked questions</h2>
        
        <div className="space-y-4">
          <details className="bg-white rounded-lg border border-gray-200 p-6 group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>What area do you serve?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-4 text-gray-600 leading-relaxed">Currently, jadapi operates exclusively within Vancouver, BC. We do not ship hazardous items or materials. Join our waitlist to be notified when we expand to nearby cities.</p>
          </details>
          
          <details className="bg-white rounded-lg border border-gray-200 p-6 group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>What are the delivery windows?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-4 text-gray-600 leading-relaxed">We batch pickups at 10:00 AM and 12:00 PM daily. Typical delivery ETAs are 2-4 hours from pickup, depending on route optimization and traffic conditions within Vancouver.</p>
          </details>
          
          <details className="bg-white rounded-lg border border-gray-200 p-6 group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>Do you offer insurance?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-4 text-gray-600 leading-relaxed">Yes, we offer optional insurance as an add-on during order creation. This provides additional coverage for valuable items beyond our standard handling guarantees.</p>
          </details>
          
          <details className="bg-white rounded-lg border border-gray-200 p-6 group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>Can I share tracking links?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-4 text-gray-600 leading-relaxed">Absolutely. Every order receives a unique tracking link that can be shared with anyone. Recipients can view real-time status updates without creating an account.</p>
          </details>
          
          <details className="bg-white rounded-lg border border-gray-200 p-6 group">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span>What if the recipient isn't home?</span>
              <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-4 text-gray-600 leading-relaxed">Our driver will attempt contact via the provided phone number. If unsuccessful, we can leave the parcel in a safe location (with photo proof) if authorized, or arrange a redelivery at no extra charge.</p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-white">jadapi</div>
              <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-xs font-medium">Local to Vancouver, BC</span>
            </div>
            
            <nav className="flex gap-8 text-sm">
              <a href="/terms" className="hover:text-white transition">Terms</a>
              <a href="/privacy" className="hover:text-white transition">Privacy</a>
              <a href="/contact" className="hover:text-white transition">Contact</a>
            </nav>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © 2025 jadapi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}