'use client';

import { ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-lg text-gray-600">
            Last updated: <span className="font-semibold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Provider Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">1. Service Provider</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Company Name:</strong> Bluecodes Inc.</p>
            <p><strong>Service Name:</strong> Jaddpi</p>
            <p><strong>Email:</strong> <a href="mailto:jaddpi1@gmail.com" className="text-blue-600 hover:underline">jaddpi1@gmail.com</a></p>
            <p><strong>Location:</strong> British Columbia, Canada</p>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-6">
          {/* Section 2 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section2')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">2. Eligibility & Account Requirements</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section2'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section2'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <ul className="list-disc list-inside space-y-2">
                  <li>You must be at least 19 years old (age of majority in British Columbia) to create and use an account.</li>
                  <li>If you are under 19, you must have a parent or legal guardian's consent and supervision.</li>
                  <li>You must provide accurate, current, and complete information when creating your account.</li>
                  <li>You are responsible for maintaining the confidentiality of your login credentials and are accountable for all activities under your account.</li>
                  <li>You must keep your account information updated at all times.</li>
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
              <h3 className="text-xl font-bold text-gray-900">3. License to Use Jaddpi</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section3'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section3'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Bluecodes Inc. grants you a limited, non-exclusive, revocable, non-transferable license to download, install, and use Jaddpi on devices you own or control, solely for lawful and personal use in accordance with these Terms.
                </p>
                <p>
                  Bluecodes Inc. retains all rights, title, and interest in Jaddpi, including all intellectual property rights. You may not copy, modify, distribute, or create derivative works based on Jaddpi without our express written permission.
                </p>
              </div>
            )}
          </section>

          {/* Section 4 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section4')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">4. Acceptable Use Policy</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section4'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section4'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p className="font-semibold">You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Violate any applicable law or regulation, including BC's Business Practices and Consumer Protection Act, the Criminal Code, CASL anti-spam legislation, and privacy laws.</li>
                  <li>Infringe upon or misappropriate any intellectual property or privacy rights.</li>
                  <li>Upload or distribute malware, engage in data scraping, or circumvent security measures.</li>
                  <li>Use Jaddpi to harass, threaten, defame, or engage in any illegal, harmful, or fraudulent activity.</li>
                  <li>Use Jaddpi while operating a vehicle or machinery where prohibited or unsafe.</li>
                  <li>Attempt to gain unauthorized access to our systems or networks.</li>
                </ul>
              </div>
            )}
          </section>

          {/* Section 5 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section5')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">5. Communications & CASL Compliance</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section5'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section5'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  By creating an account, you consent to receive service messages (e.g., verification codes, order confirmations, delivery updates) and may opt in to receive marketing messages. We comply with Canada's Anti-Spam Legislation (CASL).
                </p>
                <p>
                  You can withdraw marketing consent at any time through in-App settings or via unsubscribe links. We will continue to send essential service messages regardless of your marketing preference.
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
              <h3 className="text-xl font-bold text-gray-900">6. Privacy & Data Protection</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section6'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section6'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  We handle your personal information in accordance with our Privacy Policy and applicable laws, including British Columbia's Personal Information Protection Act (PIPA).
                </p>
                <p>
                  We collect and use personal information (account details, location data, payment information, and usage analytics) to provide and improve Jaddpi, process transactions, and enhance user experience.
                </p>
                <p>
                  Some features may require permissions such as location access. You can manage these permissions in your device settings. Disabling certain permissions may limit functionality.
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
              <h3 className="text-xl font-bold text-gray-900">7. Third-Party Services</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section7'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section7'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Jaddpi may integrate with or link to third-party services, including payment processors, mapping services, and analytics platforms. We are not responsible for third-party terms, privacy practices, or services.
                </p>
                <p>
                  Your use of third-party services is at your own risk and subject to their respective terms and conditions. We recommend reviewing their privacy policies and terms before use.
                </p>
              </div>
            )}
          </section>

          {/* Section 8 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section8')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">8. Payments & Refunds</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section8'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section8'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Pricing and billing information will be displayed at checkout. Applicable taxes (GST/PST) will be calculated and displayed.
                </p>
                <p>
                  <strong>Cancellations:</strong> You may cancel orders or services through your account settings before service initiation. Cancellation policies specific to each service will be communicated clearly.
                </p>
                <p>
                  <strong>Refunds:</strong> Refund policies will be provided at the time of purchase. Your statutory rights under BC law are not limited by these Terms.
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
              <h3 className="text-xl font-bold text-gray-900">9. Emergency & Safety</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section9'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section9'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p className="font-semibold text-red-600">
                  ⚠️ Jaddpi is NOT an emergency service and must NOT be used to request emergency assistance.
                </p>
                <p>
                  In case of emergency, immediately call 911 or your local emergency number. Do not rely on Jaddpi for emergency services.
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
              <h3 className="text-xl font-bold text-gray-900">10. Changes to the App</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section10'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section10'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Bluecodes Inc. may update, modify, suspend, or discontinue any features or aspects of Jaddpi at any time. We will provide reasonable notice of material changes.
                </p>
                <p>
                  Beta or experimental features may be incomplete and are subject to change without notice.
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
              <h3 className="text-xl font-bold text-gray-900">11. Intellectual Property</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section11'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section11'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  All trademarks, logos, content, and materials in Jaddpi are the property of Bluecodes Inc. or their respective owners. You may not use them without express written permission.
                </p>
                <p>
                  If you provide feedback or suggestions about Jaddpi, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use such feedback.
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
              <h3 className="text-xl font-bold text-gray-900">12. Termination & Account Suspension</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section12'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section12'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  You may stop using Jaddpi and request account deletion at any time by contacting us at <a href="mailto:jaddpi1@gmail.com" className="text-blue-600 hover:underline">jaddpi1@gmail.com</a>.
                </p>
                <p>
                  Bluecodes Inc. may suspend or terminate your account if you breach these Terms, create legal risk, or violate applicable laws. We will provide notice where reasonably possible.
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
              <h3 className="text-xl font-bold text-gray-900">13. Disclaimers</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section13'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section13'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  <strong>To the maximum extent permitted by law, Jaddpi is provided "as is" and "as available"</strong> without warranties of any kind, express or implied.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>We do not warrant that Jaddpi will be uninterrupted, secure, or error-free.</li>
                  <li>We do not warrant against data loss or unauthorized access.</li>
                  <li>Reasonable downtime for maintenance and updates may occur.</li>
                </ul>
              </div>
            )}
          </section>

          {/* Section 14 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section14')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">14. Limitation of Liability</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section14'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section14'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  <strong>To the maximum extent permitted by law and subject to your non-waivable consumer rights under BC law:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Bluecodes Inc. will not be liable for indirect, incidental, special, consequential, or punitive damages.</li>
                  <li>Our total liability for any claim will not exceed CAD $100 or the amount you paid for Jaddpi in the past 12 months, whichever is greater.</li>
                  <li>These limitations do not apply to death, personal injury, or fraud.</li>
                </ul>
              </div>
            )}
          </section>

          {/* Section 15 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section15')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">15. Indemnity</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section15'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section15'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  You agree to indemnify and hold harmless Bluecodes Inc. and its affiliates from any claims, losses, liabilities, damages, costs, and reasonable legal fees arising from:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Your breach of these Terms.</li>
                  <li>Your misuse of Jaddpi.</li>
                  <li>Your violation of any law or third-party rights.</li>
                </ul>
              </div>
            )}
          </section>

          {/* Section 16 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section16')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">16. Governing Law</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section16'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section16'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  These Terms are governed by the laws of the Province of British Columbia and the laws of Canada applicable therein, without regard to conflict-of-laws principles.
                </p>
                <p>
                  Any legal dispute arising from these Terms will be subject to the exclusive jurisdiction and venue of the courts located in Vancouver, British Columbia.
                </p>
              </div>
            )}
          </section>

          {/* Section 17 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section17')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">17. Changes to Terms</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section17'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section17'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  Bluecodes Inc. may update these Terms from time to time. We will post updated Terms in Jaddpi and update the "Effective Date" at the top of this page.
                </p>
                <p>
                  Continued use of Jaddpi after changes become effective constitutes your acceptance of the updated Terms. We recommend reviewing this page regularly.
                </p>
              </div>
            )}
          </section>

          {/* Section 18 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section18')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">18. Miscellaneous</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section18'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section18'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>
                  <strong>Entire Agreement:</strong> These Terms and any policies referenced constitute the entire agreement between you and Bluecodes Inc.
                </p>
                <p>
                  <strong>Severability:</strong> If any provision of these Terms is invalid or unenforceable, the remaining provisions remain in full effect.
                </p>
                <p>
                  <strong>No Waiver:</strong> Failure to enforce any provision does not constitute a waiver of that provision.
                </p>
                <p>
                  <strong>Assignment:</strong> You may not assign these Terms without our written consent. Bluecodes Inc. may assign these Terms in connection with a merger, acquisition, or sale of assets.
                </p>
              </div>
            )}
          </section>

          {/* Section 19 */}
          <section className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('section19')}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">19. Contact Us</h3>
              <ChevronUp className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections['section19'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections['section19'] && (
              <div className="px-6 py-4 border-t border-gray-200 space-y-4 text-gray-700">
                <p>If you have questions about these Terms or our practices, please contact us:</p>
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:jaddpi1@gmail.com" className="text-blue-600 hover:underline">jaddpi1@gmail.com</a></p>
                  <p><strong>Company:</strong> Bluecodes Inc.</p>
                  <p><strong>Service:</strong> Jaddpi</p>
                  <p><strong>Location:</strong> British Columbia, Canada</p>
                </div>
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
