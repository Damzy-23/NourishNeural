import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChefHat, FileText, Shield, Users, Clock } from 'lucide-react'

export default function TermsOfService() {
  const lastUpdated = "January 1, 2025"

  return (
    <>
      <Helmet>
        <title>Terms of Service - Nourish Neural</title>
        <meta name="description" content="Terms of Service for Nourish Neural - Your AI-powered culinary intelligence platform" />
      </Helmet>

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Header */}
        <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/favicon.svg" alt="Nourish Neural" className="h-8 w-8" />
                  </div>
                  <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Nourish Neural</span>
                </Link>
              </div>
              <Link
                to="/"
                className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Terms of Service</h1>
                  <p className="text-primary-100 mt-1">Last updated: {lastUpdated}</p>
                </div>
              </div>
              <p className="text-primary-100 text-lg max-w-2xl">
                Please read these terms carefully before using Nourish Neural. By using our service, you agree to be bound by these terms.
              </p>
            </div>

            {/* Terms Content */}
            <div className="px-8 py-12">
              <div className="prose prose-lg max-w-none">
                
                {/* Introduction */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    1. Introduction
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Welcome to Nourish Neural ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our 
                      AI-powered culinary intelligence platform, including our website, mobile applications, and related services 
                      (collectively, the "Service").
                    </p>
                    <p>
                      By accessing or using Nourish Neural, you agree to be bound by these Terms. If you disagree with any part 
                      of these terms, then you may not access the Service.
                    </p>
                  </div>
                </section>

                {/* Acceptance of Terms */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Users className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    2. Acceptance of Terms
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      By creating an account, accessing, or using Nourish Neural, you confirm that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>You are at least 18 years old or have parental consent</li>
                      <li>You have the legal capacity to enter into these Terms</li>
                      <li>You will provide accurate and complete information</li>
                      <li>You will maintain the security of your account credentials</li>
                      <li>You understand and agree to these Terms</li>
                    </ul>
                  </div>
                </section>

                {/* Service Description */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <ChefHat className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    3. Service Description
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Nourish Neural provides AI-powered tools to help you manage your food inventory, reduce waste, 
                      and make smarter grocery decisions. Our services include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Smart pantry management and expiry tracking</li>
                      <li>AI-powered recipe recommendations</li>
                      <li>Intelligent shopping list generation</li>
                      <li>Food waste prediction and prevention</li>
                      <li>Store finder and price comparison tools</li>
                      <li>Nutritional analysis and dietary guidance</li>
                    </ul>
                  </div>
                </section>

                {/* User Accounts */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">4. User Accounts</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      To access certain features of Nourish Neural, you must create an account. You are responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Maintaining the confidentiality of your account credentials</li>
                      <li>All activities that occur under your account</li>
                      <li>Providing accurate and up-to-date information</li>
                      <li>Promptly notifying us of any unauthorized use</li>
                    </ul>
                    <p>
                      We reserve the right to suspend or terminate accounts that violate these Terms or engage in 
                      fraudulent or harmful activities.
                    </p>
                  </div>
                </section>

                {/* Privacy and Data */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">5. Privacy and Data Protection</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Your privacy is important to us. Our collection and use of personal information is governed by 
                      our Privacy Policy, which is incorporated into these Terms by reference.
                    </p>
                    <p>
                      By using Nourish Neural, you consent to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Collection of your food preferences and shopping habits</li>
                      <li>Analysis of your data to improve our AI recommendations</li>
                      <li>Aggregated, anonymized data usage for service improvement</li>
                      <li>Secure storage and processing of your information</li>
                    </ul>
                  </div>
                </section>

                {/* Acceptable Use */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">6. Acceptable Use Policy</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>You agree not to use Nourish Neural to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Violate any laws or regulations</li>
                      <li>Infringe on intellectual property rights</li>
                      <li>Transmit harmful or malicious content</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Interfere with the proper functioning of the Service</li>
                      <li>Create multiple accounts to circumvent restrictions</li>
                      <li>Use automated tools to access the Service without permission</li>
                    </ul>
                  </div>
                </section>

                {/* AI and Machine Learning */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">7. AI and Machine Learning</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Nourish Neural uses artificial intelligence and machine learning to provide personalized recommendations. 
                      Please note:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>AI recommendations are suggestions, not medical or nutritional advice</li>
                      <li>You should always verify food safety and expiry information</li>
                      <li>Our AI models are continuously improving and may not be perfect</li>
                      <li>We are not responsible for decisions made based solely on AI recommendations</li>
                      <li>You should consult healthcare professionals for dietary concerns</li>
                    </ul>
                  </div>
                </section>

                {/* Intellectual Property */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">8. Intellectual Property</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Nourish Neural and its original content, features, and functionality are owned by us and are protected 
                      by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                    </p>
                    <p>
                      You may not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Copy, modify, or distribute our software</li>
                      <li>Reverse engineer or attempt to extract source code</li>
                      <li>Use our trademarks without written permission</li>
                      <li>Remove or alter any proprietary notices</li>
                    </ul>
                  </div>
                </section>

                {/* Disclaimers */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">9. Disclaimers</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Nourish Neural is provided "as is" without warranties of any kind. We disclaim all warranties, 
                      express or implied, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Warranties of merchantability and fitness for a particular purpose</li>
                      <li>Accuracy, reliability, or completeness of information</li>
                      <li>Uninterrupted or error-free operation</li>
                      <li>Security of data transmission or storage</li>
                    </ul>
                  </div>
                </section>

                {/* Limitation of Liability */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">10. Limitation of Liability</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      To the maximum extent permitted by law, Nourish Neural shall not be liable for any indirect, incidental, 
                      special, consequential, or punitive damages, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Loss of profits, data, or business opportunities</li>
                      <li>Food waste or spoilage</li>
                      <li>Incorrect nutritional or safety information</li>
                      <li>Third-party actions or content</li>
                    </ul>
                  </div>
                </section>

                {/* Termination */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">11. Termination</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      We may terminate or suspend your account immediately, without prior notice, for conduct that we 
                      believe violates these Terms or is harmful to other users, us, or third parties.
                    </p>
                    <p>
                      You may terminate your account at any time by contacting us or using the account deletion feature 
                      in your profile settings.
                    </p>
                  </div>
                </section>

                {/* Changes to Terms */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    12. Changes to Terms
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      We reserve the right to modify these Terms at any time. We will notify users of material changes 
                      via email or through the Service. Your continued use after such modifications constitutes acceptance 
                      of the updated Terms.
                    </p>
                    <p>
                      If you do not agree to the modified Terms, you should discontinue use of the Service.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">13. Contact Information</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      If you have any questions about these Terms, please contact us at:
                    </p>
                    <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
                      <p><strong>Email:</strong> legal@pantrypal.com</p>
                      <p><strong>Address:</strong> Nourish Neural Legal Team, 123 Innovation Street, Tech City, TC 12345</p>
                      <p><strong>Phone:</strong> +1 (555) 123-PALM</p>
                    </div>
                  </div>
                </section>

                {/* Governing Law */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">14. Governing Law</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, 
                      without regard to its conflict of law provisions. Any disputes arising from these Terms shall be 
                      subject to the exclusive jurisdiction of the courts of England and Wales.
                    </p>
                  </div>
                </section>

              </div>
            </div>

            {/* Footer */}
            <div className="bg-neutral-50 dark:bg-neutral-900 px-8 py-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  © 2025 Nourish Neural. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <Link to="/privacy" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to="/" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
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
