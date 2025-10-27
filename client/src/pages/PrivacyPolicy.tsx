import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChefHat, Shield, Eye, Database, Lock, Users, Globe, Mail } from 'lucide-react'

export default function PrivacyPolicy() {
  const lastUpdated = "January 1, 2025"

  return (
    <>
      <Helmet>
        <title>Privacy Policy - PantryPal</title>
        <meta name="description" content="Privacy Policy for PantryPal - How we protect and use your data" />
      </Helmet>

      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-neutral-900">PantryPal</span>
                </Link>
              </div>
              <Link
                to="/"
                className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-12 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Privacy Policy</h1>
                  <p className="text-green-100 mt-1">Last updated: {lastUpdated}</p>
                </div>
              </div>
              <p className="text-green-100 text-lg max-w-2xl">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
            </div>

            {/* Privacy Content */}
            <div className="px-8 py-12">
              <div className="prose prose-lg max-w-none">
                
                {/* Introduction */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                    <Shield className="h-6 w-6 text-green-600 mr-3" />
                    1. Introduction
                  </h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>
                      PantryPal ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                      explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 
                      food management platform.
                    </p>
                    <p>
                      We comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) 
                      and the California Consumer Privacy Act (CCPA).
                    </p>
                  </div>
                </section>

                {/* Information We Collect */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                    <Database className="h-6 w-6 text-green-600 mr-3" />
                    2. Information We Collect
                  </h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-4">2.1 Personal Information</h3>
                      <div className="space-y-4 text-neutral-700 leading-relaxed">
                        <p>We collect information you provide directly to us, including:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                          <li><strong>Profile Information:</strong> Dietary preferences, allergies, cooking skill level</li>
                          <li><strong>Food Data:</strong> Pantry inventory, shopping lists, meal preferences</li>
                          <li><strong>Usage Data:</strong> Recipes viewed, features used, search queries</li>
                          <li><strong>Communication:</strong> Support requests, feedback, survey responses</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-4">2.2 Automatically Collected Information</h3>
                      <div className="space-y-4 text-neutral-700 leading-relaxed">
                        <p>We automatically collect certain information when you use our Service:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li><strong>Device Information:</strong> Device type, operating system, browser type</li>
                          <li><strong>Usage Analytics:</strong> Pages visited, time spent, features used</li>
                          <li><strong>Location Data:</strong> Approximate location for store recommendations (with consent)</li>
                          <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* How We Use Information */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                    <Eye className="h-6 w-6 text-green-600 mr-3" />
                    3. How We Use Your Information
                  </h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>We use your information for the following purposes:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Service Delivery:</strong> Provide AI recommendations, manage your pantry, generate shopping lists</li>
                      <li><strong>Personalization:</strong> Customize recipes and suggestions based on your preferences</li>
                      <li><strong>Communication:</strong> Send service updates, notifications, and support responses</li>
                      <li><strong>Improvement:</strong> Analyze usage patterns to enhance our AI models and features</li>
                      <li><strong>Security:</strong> Protect against fraud, abuse, and unauthorized access</li>
                      <li><strong>Legal Compliance:</strong> Meet regulatory requirements and respond to legal requests</li>
                    </ul>
                  </div>
                </section>

                {/* Legal Basis for Processing */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">4. Legal Basis for Processing (GDPR)</h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>Under GDPR, we process your personal data based on:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Consent:</strong> When you opt-in to marketing communications or location tracking</li>
                      <li><strong>Contract Performance:</strong> To provide the services you've requested</li>
                      <li><strong>Legitimate Interest:</strong> To improve our services and prevent fraud</li>
                      <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                    </ul>
                  </div>
                </section>

                {/* Information Sharing */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">5. Information Sharing and Disclosure</h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Service Providers:</strong> Trusted third parties who assist in service delivery (hosting, analytics, payment processing)</li>
                      <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                      <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                      <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
                      <li><strong>Aggregated Data:</strong> Anonymized, aggregated data that cannot identify you</li>
                    </ul>
                  </div>
                </section>

                {/* Data Security */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                    <Lock className="h-6 w-6 text-green-600 mr-3" />
                    6. Data Security
                  </h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>We implement appropriate technical and organizational measures to protect your information:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Encryption:</strong> Data encrypted in transit and at rest using industry-standard protocols</li>
                      <li><strong>Access Controls:</strong> Strict access controls and authentication requirements</li>
                      <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                      <li><strong>Staff Training:</strong> Privacy and security training for all employees</li>
                      <li><strong>Incident Response:</strong> Procedures for handling security incidents</li>
                    </ul>
                    <p className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet 
                      or electronic storage is 100% secure. We cannot guarantee absolute security.
                    </p>
                  </div>
                </section>

                {/* Data Retention */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">7. Data Retention</h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>We retain your information for as long as necessary to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide our services and maintain your account</li>
                      <li>Comply with legal obligations</li>
                      <li>Resolve disputes and enforce agreements</li>
                      <li>Improve our AI models (anonymized data)</li>
                    </ul>
                    <p>
                      When you delete your account, we will delete your personal information within 30 days, 
                      except where retention is required by law.
                    </p>
                  </div>
                </section>

                {/* Your Rights */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                    <Users className="h-6 w-6 text-green-600 mr-3" />
                    8. Your Privacy Rights
                  </h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>Depending on your location, you may have the following rights:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Access:</strong> Request copies of your personal information</li>
                      <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                      <li><strong>Erasure:</strong> Request deletion of your personal information</li>
                      <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                      <li><strong>Restriction:</strong> Limit how we process your information</li>
                      <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                      <li><strong>Withdraw Consent:</strong> Withdraw consent for consent-based processing</li>
                    </ul>
                    <p>
                      To exercise these rights, please contact us at <strong>privacy@pantrypal.com</strong>. 
                      We will respond within 30 days.
                    </p>
                  </div>
                </section>

                {/* International Transfers */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                    <Globe className="h-6 w-6 text-green-600 mr-3" />
                    9. International Data Transfers
                  </h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>
                      Your information may be transferred to and processed in countries other than your country of residence. 
                      We ensure appropriate safeguards are in place, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Standard Contractual Clauses approved by the European Commission</li>
                      <li>Adequacy decisions by relevant data protection authorities</li>
                      <li>Certification schemes and codes of conduct</li>
                      <li>Binding corporate rules for intra-group transfers</li>
                    </ul>
                  </div>
                </section>

                {/* Cookies and Tracking */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">10. Cookies and Tracking Technologies</h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>We use cookies and similar technologies to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Remember your preferences and settings</li>
                      <li>Analyze usage patterns and improve our service</li>
                      <li>Provide personalized content and recommendations</li>
                      <li>Ensure security and prevent fraud</li>
                    </ul>
                    <p>
                      You can control cookies through your browser settings. However, disabling cookies may affect 
                      the functionality of our Service.
                    </p>
                  </div>
                </section>

                {/* Children's Privacy */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">11. Children's Privacy</h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>
                      PantryPal is not intended for children under 13 years of age. We do not knowingly collect 
                      personal information from children under 13. If we become aware that we have collected 
                      personal information from a child under 13, we will take steps to delete such information.
                    </p>
                  </div>
                </section>

                {/* Third-Party Services */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">12. Third-Party Services</h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>
                      Our Service may contain links to third-party websites or integrate with third-party services. 
                      This Privacy Policy does not apply to those third parties. We encourage you to review their 
                      privacy policies.
                    </p>
                    <p>We may integrate with:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Payment processors (Stripe, PayPal)</li>
                      <li>Analytics services (Google Analytics)</li>
                      <li>Email services (SendGrid, Mailchimp)</li>
                      <li>Cloud storage providers (AWS, Google Cloud)</li>
                    </ul>
                  </div>
                </section>

                {/* Changes to Privacy Policy */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">13. Changes to This Privacy Policy</h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>
                      We may update this Privacy Policy from time to time. We will notify you of any material changes 
                      by posting the new Privacy Policy on this page and updating the "Last updated" date.
                    </p>
                    <p>
                      We will also notify you via email or through the Service if the changes are significant. 
                      Your continued use of the Service after such changes constitutes acceptance of the updated policy.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                    <Mail className="h-6 w-6 text-green-600 mr-3" />
                    14. Contact Us
                  </h2>
                  <div className="space-y-4 text-neutral-700 leading-relaxed">
                    <p>
                      If you have any questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="bg-green-50 rounded-lg p-6">
                      <p><strong>Data Protection Officer:</strong> privacy@pantrypal.com</p>
                      <p><strong>General Inquiries:</strong> support@pantrypal.com</p>
                      <p><strong>Address:</strong> PantryPal Privacy Team, 123 Innovation Street, Tech City, TC 12345</p>
                      <p><strong>Phone:</strong> +1 (555) 123-PALM</p>
                    </div>
                    <p>
                      You also have the right to lodge a complaint with your local data protection authority 
                      if you believe we have not handled your personal information in accordance with applicable law.
                    </p>
                  </div>
                </section>

              </div>
            </div>

            {/* Footer */}
            <div className="bg-neutral-50 px-8 py-6 border-t border-neutral-200">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-neutral-600 text-sm">
                  © 2025 PantryPal. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <Link to="/terms" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                    Terms of Service
                  </Link>
                  <Link to="/" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                    Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
