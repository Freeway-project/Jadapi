'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Jaddpi</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fast, reliable delivery service in British Columbia.
            </p>
            <p className="text-gray-500 text-xs">© 2025 Bluecodes Inc. All rights reserved.</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Book a Delivery
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:jaddpi1@gmail.com"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                <a href="mailto:jaddpi1@gmail.com" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">
                  jaddpi1@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                <p className="text-gray-400 text-sm">
                  British Columbia, Canada
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 py-8">
          {/* Bottom Links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              Built with ❤️ by Bluecodes Inc.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                Terms
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Privacy
              </Link>
              <span className="text-gray-700">•</span>
              <a href="mailto:jaddpi1@gmail.com" className="text-gray-400 hover:text-blue-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
