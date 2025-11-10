'use client';

import { ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function PrivacyPage() {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: <span className="font-semibold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Provider Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Service Provider</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Company:</strong> Bluecodes Inc.</p>
            <p><strong>App:</strong> Jaddpi</p>
            <p><strong>Email:</strong> <a href="mailto:jaddpi1@gmail.com" className="text-blue-600 hover:underline">jaddpi1@gmail.com</a></p>
            <p><strong>Location:</strong> British Columbia, Canada</p>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section1')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">1. Information We Collect</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section1'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section1'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p className="font-semibold">We collect the following types of information:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, phone number, account credentials, and profile picture.</li>
                  <li><strong>Payment Information:</strong> Credit card details (processed securely by payment providers), billing address, and transaction history.</li>
                  <li><strong>Location Data:</strong> Precise GPS location (with your permission) to enable delivery tracking and service optimization.</li>
                  <li><strong>Device Information:</strong> Device type, OS version, app version, device ID, and push notification settings.</li>
                  <li><strong>Usage Data:</strong> How you interact with Jaddpi, features used, clicks, search queries, and session duration.</li>
                  <li><strong>Communication Data:</strong> Messages, feedback, support tickets, and customer service interactions.</li>
                  <li><strong>Analytics:</strong> Crash reports, performance metrics, and error logs to improve our service.</li>
                </ul>
              </div>
            )}
          </section>

          {/* Section 2 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section2')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section2'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section2'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Create and manage your account.</li>
                  <li>Process bookings, payments, and deliveries.</li>
                  <li>Provide real-time tracking and delivery updates.</li>
                  <li>Communicate with you about your orders and account.</li>
                  <li>Send marketing messages (with your opt-in consent).</li>
                  <li>Detect and prevent fraud or unauthorized access.</li>
                  <li>Comply with legal obligations and law enforcement requests.</li>
                  <li>Improve our service, fix bugs, and develop new features.</li>
                  <li>Personalize your experience and provide recommendations.</li>
                </ul>
              </div>
            )}
          </section>

          {/* Section 3 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section3')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">3. Data Sharing & Disclosure</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section3'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section3'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Service Providers:</strong> Cloud hosting, payment processors, analytics platforms, and customer support tools that help us operate Jaddpi.</li>
                  <li><strong>Drivers & Delivery Partners:</strong> Necessary information (name, phone, address) to facilitate delivery services.</li>
                  <li><strong>Law Enforcement:</strong> When required by law or in response to valid legal requests.</li>
                  <li><strong>Business Partners:</strong> With your explicit consent for specific purposes (e.g., joint promotions).</li>
                </ul>
                <p className="font-semibold mt-4">We do NOT sell your personal information to third parties.</p>
              </div>
            )}
          </section>

          {/* Section 4 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section4')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">4. Data Storage & Retention</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section4'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section4'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  <strong>Location:</strong> Your data is stored in Canada with trusted servers. Backups may be held in Canada and North America for disaster recovery.
                </p>
                <p>
                  <strong>Retention:</strong> We retain your information only as long as necessary to provide services, comply with legal obligations, or as specified in this policy. You can request deletion at any time.
                </p>
                <p>
                  <strong>Security:</strong> We use encryption, firewalls, secure servers, and access controls to protect your information. However, no system is completely secure.
                </p>
              </div>
            )}
          </section>

          {/* Section 5 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section5')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">5. Your Privacy Rights (PIPA)</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section5'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section5'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>Under British Columbia's Personal Information Protection Act (PIPA), you have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal information we hold.</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information.</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and personal data (subject to legal retention requirements).</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications or data collection (with reasonable notice).</li>
                  <li><strong>Portability:</strong> Request your data in a structured, portable format.</li>
                </ul>
                <p className="mt-4">
                  <strong>To exercise these rights, contact us:</strong> <a href="mailto:jaddpi1@gmail.com" className="text-blue-600 hover:underline">jaddpi1@gmail.com</a>
                </p>
              </div>
            )}
          </section>

          {/* Section 6 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section6')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">6. Location Data & Permissions</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section6'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section6'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Jaddpi may request location permissions to enable real-time tracking and delivery services. You can manage location permissions in your device settings.
                </p>
                <p>
                  <strong>Note:</strong> Disabling location permissions may limit certain features (e.g., tracking, nearby services). Location is only collected when using relevant features.
                </p>
              </div>
            )}
          </section>

          {/* Section 7 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section7')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">7. Cookies & Tracking Technologies</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section7'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section7'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Jaddpi uses cookies, local storage, and analytics tools to:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Keep you logged in.</li>
                  <li>Remember your preferences.</li>
                  <li>Analyze app usage and performance.</li>
                  <li>Prevent fraud and unauthorized access.</li>
                </ul>
                <p className="mt-4">You can control cookie settings in your browser or device settings. Some features may not work properly if you disable cookies.</p>
              </div>
            )}
          </section>

          {/* Section 8 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section8')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">8. Third-Party Services</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section8'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section8'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Jaddpi integrates with third-party services such as:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Payment processors (Stripe, etc.)</li>
                  <li>Mapping services (Google Maps)</li>
                  <li>Analytics platforms</li>
                  <li>Cloud infrastructure providers</li>
                </ul>
                <p className="mt-4">
                  These services have their own privacy policies. We encourage you to review them. We are not responsible for their practices.
                </p>
              </div>
            )}
          </section>

          {/* Section 9 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section9')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">9. Children's Privacy</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section9'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section9'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Jaddpi is not directed to children under 13 years old. We do not knowingly collect information from children under 13.
                </p>
                <p>
                  For users between 13-18, parental permission and supervision are required. If we discover we have collected information from a child under 13 without parental consent, we will delete it immediately.
                </p>
              </div>
            )}
          </section>

          {/* Section 10 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section10')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">10. International Data Transfers</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section10'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section10'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Your data is primarily stored in Canada. However, we may transfer data to trusted service providers in the United States or other countries for processing, backup, or service delivery.
                </p>
                <p>
                  By using Jaddpi, you consent to the transfer and processing of your information in countries outside of BC, including countries that may have different privacy laws.
                </p>
              </div>
            )}
          </section>

          {/* Section 11 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section11')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">11. Data Breach Notification</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section11'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section11'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  If a data breach occurs that affects your personal information, we will notify you without unreasonable delay as required by law. We will provide details about the breach and steps to protect your information.
                </p>
              </div>
            )}
          </section>

          {/* Section 12 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section12')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">12. Changes to This Privacy Policy</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section12'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section12'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will update the "Last Updated" date and notify you of material changes via email or in-App notification.
                </p>
                <p>
                  Your continued use of Jaddpi constitutes acceptance of the updated Privacy Policy.
                </p>
              </div>
            )}
          </section>

          {/* Section 13 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section13')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">13. Contact Us & Privacy Officer</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section13'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section13'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  If you have questions about this Privacy Policy, your data, or to exercise your privacy rights (access, correction, deletion), please contact our Privacy Officer:
                </p>
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:jaddpi1@gmail.com" className="text-blue-600 hover:underline">jaddpi1@gmail.com</a></p>
                  <p><strong>Company:</strong> Bluecodes Inc.</p>
                  <p><strong>Location:</strong> British Columbia, Canada</p>
                </div>
                <p className="mt-4 text-sm">
                  We will respond to privacy requests within 30 days or as required by law.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-gray-100 rounded-lg text-center text-gray-600">
          <p>© {new Date().getFullYear()} Bluecodes Inc. All rights reserved.</p>
          <p className="text-sm mt-2">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
