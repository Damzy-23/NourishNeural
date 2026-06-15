import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChefHat, FileText, Shield, Users, Clock, AlertTriangle, Scale, Brain } from 'lucide-react'

export default function TermsOfService() {
  const lastUpdated = "June 15, 2026"

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
                    <img src="/logo.png" alt="Nourish Neural" className="h-8 w-8" />
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

                {/* Important Notice */}
                <section className="mb-12">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-neutral-700 dark:text-neutral-300">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Important Notice</p>
                        <p>
                          Nothing in these Terms affects your statutory rights as a consumer under the Consumer Rights Act 2015
                          or any other applicable UK consumer protection legislation. Where these Terms conflict with your
                          statutory rights, your statutory rights shall prevail.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Introduction */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    1. About Us and These Terms
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Welcome to Nourish Neural ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our
                      AI-powered household food management platform, including our website, mobile applications, and related services
                      (collectively, the "Service").
                    </p>
                    <p>
                      Nourish Neural is operated from the United Kingdom. These Terms are governed by the laws of England and Wales.
                    </p>
                    <p>
                      These Terms comply with the following UK legislation:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Consumer Rights Act 2015</li>
                      <li>Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013</li>
                      <li>Electronic Commerce (EC Directive) Regulations 2002</li>
                      <li>UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018</li>
                      <li>Computer Misuse Act 1990</li>
                    </ul>
                    <p>
                      By accessing or using Nourish Neural, you agree to be bound by these Terms. If you disagree with any part
                      of these Terms, you must not use the Service.
                    </p>
                  </div>
                </section>

                {/* Acceptance of Terms */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Users className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    2. Eligibility and Account Registration
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      By creating an account, you confirm that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>You are at least 16 years of age (in accordance with the UK GDPR age of consent for data processing). Users under 16 require verifiable parental or guardian consent.</li>
                      <li>You have the legal capacity to enter into a binding agreement under English law</li>
                      <li>You will provide accurate, current, and complete registration information</li>
                      <li>You will maintain and promptly update your account information</li>
                      <li>You will maintain the confidentiality of your login credentials and are responsible for all activities under your account</li>
                      <li>You will notify us immediately at support@nourishneural.co.uk of any unauthorised use of your account</li>
                    </ul>
                    <p>
                      We reserve the right to suspend or terminate accounts that violate these Terms. We will provide
                      reasonable notice before termination unless immediate action is required to prevent harm, fraud, or
                      violation of applicable law.
                    </p>
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
                      Nourish Neural provides AI-powered tools to help you manage your household food inventory, reduce waste,
                      and make informed grocery decisions. The Service is currently provided free of charge. Our services include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Smart pantry management and expiry tracking</li>
                      <li>AI-powered recipe recommendations</li>
                      <li>Intelligent shopping list generation</li>
                      <li>Food waste prediction and prevention using machine learning</li>
                      <li>Store finder and price comparison tools</li>
                      <li>Nutritional analysis and dietary information</li>
                      <li>Conversational AI assistant (Nurexa)</li>
                      <li>Meal planning tools</li>
                    </ul>
                    <p>
                      Under the Consumer Rights Act 2015, digital content must be of satisfactory quality, fit for a
                      particular purpose, and as described. We will use reasonable care and skill in providing the Service.
                    </p>
                  </div>
                </section>

                {/* AI Disclaimer */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    4. AI and Machine Learning Disclaimer
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Nourish Neural uses artificial intelligence and machine learning to provide personalised recommendations.
                      You acknowledge and agree that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Not medical advice:</strong> AI-generated recommendations are for general informational purposes only and do not constitute medical, nutritional, or dietary advice. You should always consult a qualified healthcare professional, registered dietitian, or your GP before making dietary changes, particularly if you have allergies, intolerances, medical conditions, or are pregnant or breastfeeding.</li>
                      <li><strong>Not a substitute for food safety checks:</strong> Always verify food safety, expiry dates, and storage conditions yourself. Do not rely solely on our AI predictions to determine whether food is safe to consume. When in doubt, discard the item.</li>
                      <li><strong>Allergen warning:</strong> While we endeavour to flag allergens, our system cannot guarantee identification of all allergens in all circumstances. If you have a food allergy, always check product packaging and ingredient lists yourself.</li>
                      <li><strong>AI limitations:</strong> Our AI models are continuously improving but are not infallible. Predictions and recommendations are probabilistic estimates, not certainties. Confidence scores are provided where available.</li>
                      <li><strong>Automated decision-making:</strong> In accordance with UK GDPR Article 22, you have the right not to be subject to decisions based solely on automated processing that significantly affect you. You may request human review of any AI-generated recommendation by contacting us.</li>
                    </ul>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                      <p className="font-semibold text-red-800 dark:text-red-200">
                        If you experience any adverse reaction to food, seek medical attention immediately by calling 999 or
                        contacting NHS 111. Do not rely on this application for emergency food safety decisions.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Consumer Rights */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Scale className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    5. Your Consumer Rights
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Under the Consumer Rights Act 2015, you have the following statutory rights regarding digital content:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Satisfactory quality:</strong> The Service should be free from defects, safe, and durable</li>
                      <li><strong>Fit for purpose:</strong> The Service should be fit for any particular purpose we have told you about or that is obvious from the nature of the Service</li>
                      <li><strong>As described:</strong> The Service should match any description we have provided to you</li>
                      <li><strong>Right to repair or replacement:</strong> If the Service is faulty, you have the right to a repair or replacement at no cost</li>
                      <li><strong>Right to a price reduction:</strong> If repair or replacement is not possible or not carried out within a reasonable time, you may be entitled to a reduction in price</li>
                    </ul>
                    <p>
                      These rights apply for up to six years from the date the digital content was supplied (five years in Scotland).
                    </p>
                    <p>
                      For further information about your consumer rights, you may contact Citizens Advice (citizensadvice.org.uk)
                      or the Competition and Markets Authority (gov.uk/cma).
                    </p>
                  </div>
                </section>

                {/* Right to Cancel */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">6. Right to Cancel</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013,
                      if you registered for the Service online, you have the right to cancel your account within 14 days
                      of registration without giving any reason (the "Cooling-Off Period").
                    </p>
                    <p>
                      To exercise your right to cancel, you must inform us of your decision by a clear statement
                      (e.g., by email to support@nourishneural.co.uk or by using the account deletion feature in your
                      Profile settings).
                    </p>
                    <p>
                      You may also cancel your account at any time after the Cooling-Off Period by using the account
                      deletion feature or contacting us. Upon cancellation, we will delete your personal data in
                      accordance with our Privacy Policy and UK GDPR requirements.
                    </p>
                  </div>
                </section>

                {/* Privacy and Data */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">7. Privacy and Data Protection</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Your privacy is important to us. Our collection and use of personal data is governed by our{' '}
                      <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>,
                      which forms part of these Terms and complies with the UK GDPR and the Data Protection Act 2018.
                    </p>
                    <p>
                      Key points:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>We process your data on lawful bases as defined in UK GDPR Article 6</li>
                      <li>You have the right to access, rectify, erase, restrict, port, and object to processing of your personal data</li>
                      <li>You may export all your data at any time via the My Data tab in your Profile</li>
                      <li>AI model training uses only anonymised, aggregated data</li>
                      <li>Your data is processed primarily within the UK and EEA. Where transfers occur outside the UK, we rely on safeguards approved by the Information Commissioner's Office (ICO)</li>
                      <li>You may lodge a complaint with the ICO at ico.org.uk</li>
                    </ul>
                  </div>
                </section>

                {/* Acceptable Use */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">8. Acceptable Use Policy</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>You agree not to use Nourish Neural to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Violate any applicable UK or international laws or regulations</li>
                      <li>Infringe on intellectual property rights of any third party</li>
                      <li>Transmit harmful, offensive, or unlawful content</li>
                      <li>Attempt to gain unauthorised access to our systems, networks, or other users' accounts, which may constitute an offence under the Computer Misuse Act 1990</li>
                      <li>Interfere with or disrupt the proper functioning of the Service</li>
                      <li>Create multiple accounts to circumvent restrictions or abuse the Service</li>
                      <li>Use automated tools, bots, scrapers, or similar technology to access the Service without our written permission</li>
                      <li>Attempt to extract, reverse engineer, or decompile our AI models or algorithms</li>
                      <li>Use the Service to deliberately generate misleading food safety information</li>
                      <li>Attempt to manipulate, inject prompts into, or exploit the AI assistant for purposes other than legitimate food management</li>
                    </ul>
                    <p>
                      Violation of this policy may result in immediate suspension or termination of your account, and
                      we may report suspected criminal activity to the relevant authorities.
                    </p>
                  </div>
                </section>

                {/* Intellectual Property */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">9. Intellectual Property</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Nourish Neural and its original content, features, software, AI models, and functionality are owned
                      by us and are protected by UK and international copyright, trademark, and other intellectual property laws
                      (including the Copyright, Designs and Patents Act 1988).
                    </p>
                    <p>You may not:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Copy, modify, distribute, or create derivative works of our software or content</li>
                      <li>Reverse engineer, decompile, or disassemble any part of the Service, except as permitted by law (including the Computer Programs Directive as implemented in UK law)</li>
                      <li>Use our trademarks, logos, or branding without written permission</li>
                      <li>Remove or alter any proprietary notices or attributions</li>
                    </ul>
                    <p>
                      You retain ownership of any personal data, food information, or other content you submit to the Service.
                      By submitting content, you grant us a limited, non-exclusive licence to use that content solely for the
                      purpose of providing and improving the Service.
                    </p>
                  </div>
                </section>

                {/* Disclaimers and Limitation of Liability */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">10. Disclaimers and Limitation of Liability</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      <strong>Nothing in these Terms excludes or limits our liability for:</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Death or personal injury caused by our negligence</li>
                      <li>Fraud or fraudulent misrepresentation</li>
                      <li>Any breach of the terms implied by Sections 9, 10, 11, and 12 of the Consumer Rights Act 2015 (regarding quality, fitness for purpose, description, and right to supply)</li>
                      <li>Any other liability which cannot be excluded or limited by applicable law</li>
                    </ul>
                    <p>
                      <strong>Subject to the above, we shall not be liable for:</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Any indirect, incidental, special, or consequential loss or damage</li>
                      <li>Loss of profits, revenue, data, business, or anticipated savings</li>
                      <li>Food waste, spoilage, or illness resulting from reliance on AI predictions without independent verification</li>
                      <li>Any adverse health outcomes from following AI-generated dietary suggestions without consulting a healthcare professional</li>
                      <li>Inaccuracies in third-party store pricing or product data</li>
                      <li>Service interruptions or data loss caused by circumstances beyond our reasonable control (force majeure)</li>
                    </ul>
                    <p>
                      The Service is provided on an "as is" and "as available" basis. While we endeavour to maintain a reliable
                      and accurate service, we do not warrant that the Service will be uninterrupted, error-free, or completely
                      secure at all times.
                    </p>
                    <p>
                      Our total aggregate liability to you for any claims arising from or related to these Terms or the Service
                      shall not exceed the greater of (a) the amount you have paid us in the 12 months preceding the claim, or
                      (b) fifty pounds sterling (GBP 50.00).
                    </p>
                  </div>
                </section>

                {/* Indemnification */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">11. Indemnification</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses (including
                      reasonable legal fees) arising from:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Your breach of these Terms</li>
                      <li>Your misuse of the Service</li>
                      <li>Your violation of any applicable law or the rights of any third party</li>
                    </ul>
                    <p>
                      This clause does not apply to the extent that any claim arises from our own negligence, wilful default,
                      or breach of these Terms.
                    </p>
                  </div>
                </section>

                {/* Termination */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">12. Termination</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      <strong>Termination by you:</strong> You may terminate your account at any time by using the account
                      deletion feature in your Profile settings or by emailing support@nourishneural.co.uk. Upon
                      termination, your personal data will be deleted within 30 days in accordance with our Privacy Policy,
                      except where retention is required by law.
                    </p>
                    <p>
                      <strong>Termination by us:</strong> We may suspend or terminate your account if:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>You materially breach these Terms and fail to remedy the breach within 14 days of our notice</li>
                      <li>Immediate termination is necessary to prevent harm, fraud, or violation of law</li>
                      <li>We are required to do so by law or regulatory order</li>
                      <li>We discontinue the Service (we will provide at least 30 days' notice and allow you to export your data)</li>
                    </ul>
                    <p>
                      Upon termination for any reason, you will retain the right to export your data as provided under
                      UK GDPR Article 20 (right to data portability).
                    </p>
                  </div>
                </section>

                {/* Changes to Terms */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    13. Changes to These Terms
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      We may update these Terms from time to time to reflect changes in law, regulation, or our practices.
                      We will notify you of material changes at least 30 days in advance by email or through the Service.
                    </p>
                    <p>
                      If you do not agree to the updated Terms, you may terminate your account before the changes take effect.
                      Your continued use of the Service after the effective date constitutes acceptance of the updated Terms.
                    </p>
                    <p>
                      Non-material changes (such as corrections of typographical errors) may be made without prior notice.
                    </p>
                  </div>
                </section>

                {/* Dispute Resolution */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">14. Complaints and Dispute Resolution</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      If you have a complaint about the Service, please contact us first at support@nourishneural.co.uk.
                      We will acknowledge your complaint within 2 working days and aim to resolve it within 14 working days.
                    </p>
                    <p>
                      If we cannot resolve your complaint to your satisfaction, you may:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Contact Citizens Advice for free guidance (citizensadvice.org.uk or 0808 223 1133)</li>
                      <li>Use an alternative dispute resolution (ADR) provider. While we are not obligated to use ADR, we are willing to engage with approved ADR providers on a case-by-case basis.</li>
                      <li>For data protection complaints, contact the Information Commissioner's Office (ICO) at ico.org.uk or 0303 123 1113</li>
                      <li>Bring a claim in the courts of England and Wales (or Scotland or Northern Ireland if you live there)</li>
                    </ul>
                  </div>
                </section>

                {/* Governing Law */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">15. Governing Law and Jurisdiction</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      These Terms are governed by and construed in accordance with the laws of England and Wales.
                    </p>
                    <p>
                      If you are a consumer, you will benefit from any mandatory provisions of the law of the country in
                      which you are resident. Nothing in these Terms affects your rights as a consumer to rely on such
                      mandatory provisions of local law.
                    </p>
                    <p>
                      Any disputes shall be subject to the non-exclusive jurisdiction of the courts of England and Wales.
                      If you live in Scotland, you may bring proceedings in Scottish courts. If you live in Northern Ireland,
                      you may bring proceedings in Northern Irish courts.
                    </p>
                  </div>
                </section>

                {/* Severability */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">16. General Provisions</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable by a court
                      of competent jurisdiction, the remaining provisions shall continue in full force and effect.
                    </p>
                    <p>
                      <strong>Entire agreement:</strong> These Terms, together with our Privacy Policy and any other policies
                      referenced herein, constitute the entire agreement between you and Nourish Neural regarding the Service.
                    </p>
                    <p>
                      <strong>No waiver:</strong> Our failure to enforce any right or provision of these Terms shall not
                      constitute a waiver of that right or provision.
                    </p>
                    <p>
                      <strong>Assignment:</strong> You may not assign or transfer your rights under these Terms without our
                      written consent. We may assign our rights and obligations under these Terms without your consent,
                      provided that your rights are not diminished.
                    </p>
                    <p>
                      <strong>Third-party rights:</strong> These Terms do not confer any rights on any person or party
                      (other than you and us) pursuant to the Contracts (Rights of Third Parties) Act 1999.
                    </p>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">17. Contact Information</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      If you have any questions about these Terms, please contact us:
                    </p>
                    <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
                      <p><strong>Email:</strong> legal@nourishneural.co.uk</p>
                      <p><strong>Support:</strong> support@nourishneural.co.uk</p>
                      <p><strong>Data Protection:</strong> privacy@nourishneural.co.uk</p>
                      <p><strong>Address:</strong> Nourish Neural, London, United Kingdom</p>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                      As required by the Electronic Commerce (EC Directive) Regulations 2002, our contact details are
                      provided above for the resolution of any disputes or complaints.
                    </p>
                  </div>
                </section>

              </div>
            </div>

            {/* Footer */}
            <div className="bg-neutral-50 dark:bg-neutral-900 px-8 py-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  &copy; 2026 Nourish Neural. All rights reserved.
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
