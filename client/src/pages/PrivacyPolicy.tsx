import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Eye, Database, Lock, Users, Globe, Mail, Cookie, Clock, Brain, Server } from 'lucide-react'

export default function PrivacyPolicy() {
  const lastUpdated = "June 15, 2026"

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Nourish Neural</title>
        <meta name="description" content="Privacy Policy for Nourish Neural - How we protect and use your data under UK GDPR" />
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
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 px-8 py-12 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Privacy Policy</h1>
                  <p className="text-primary-100 mt-1">Last updated: {lastUpdated}</p>
                </div>
              </div>
              <p className="text-primary-100 text-lg max-w-2xl">
                This policy explains how we collect, use, store, and protect your personal data in compliance with
                the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
            </div>

            {/* Privacy Content */}
            <div className="px-8 py-12">
              <div className="prose prose-lg max-w-none">

                {/* Data Controller */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    1. Data Controller
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      For the purposes of the UK GDPR and the Data Protection Act 2018, the data controller is:
                    </p>
                    <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
                      <p><strong>Nourish Neural</strong></p>
                      <p>London, United Kingdom</p>
                      <p>Email: privacy@nourishneural.co.uk</p>
                    </div>
                    <p>
                      We are responsible for deciding how we hold and use your personal data. We are required under data
                      protection legislation to notify you of the information contained in this Privacy Policy.
                    </p>
                    <p>
                      Our supervisory authority is the Information Commissioner's Office (ICO). You have the right to make
                      a complaint at any time to the ICO (ico.org.uk, telephone 0303 123 1113). We would, however,
                      appreciate the opportunity to resolve your concerns before you approach the ICO, so please contact
                      us first at privacy@nourishneural.co.uk.
                    </p>
                  </div>
                </section>

                {/* Information We Collect */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Database className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    2. Personal Data We Collect
                  </h2>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">2.1 Data You Provide Directly</h3>
                      <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        <p>We collect personal data that you voluntarily provide when you register, use, or interact with the Service:</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-neutral-200 dark:border-neutral-600">
                                <th className="text-left py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">Category</th>
                                <th className="text-left py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">Data</th>
                                <th className="text-left py-3 font-semibold text-neutral-900 dark:text-neutral-100">Purpose</th>
                              </tr>
                            </thead>
                            <tbody className="text-neutral-700 dark:text-neutral-300">
                              <tr className="border-b border-neutral-100 dark:border-neutral-700">
                                <td className="py-3 pr-4 font-medium">Identity</td>
                                <td className="py-3 pr-4">Name, email address</td>
                                <td className="py-3">Account creation and authentication</td>
                              </tr>
                              <tr className="border-b border-neutral-100 dark:border-neutral-700">
                                <td className="py-3 pr-4 font-medium">Credentials</td>
                                <td className="py-3 pr-4">Password (bcrypt-hashed, never stored in plain text)</td>
                                <td className="py-3">Secure account access</td>
                              </tr>
                              <tr className="border-b border-neutral-100 dark:border-neutral-700">
                                <td className="py-3 pr-4 font-medium">Profile</td>
                                <td className="py-3 pr-4">Dietary preferences, allergies, household size, cooking skill</td>
                                <td className="py-3">Personalised recommendations</td>
                              </tr>
                              <tr className="border-b border-neutral-100 dark:border-neutral-700">
                                <td className="py-3 pr-4 font-medium">Food data</td>
                                <td className="py-3 pr-4">Pantry items, grocery lists, meal plans, waste logs</td>
                                <td className="py-3">Core service delivery</td>
                              </tr>
                              <tr className="border-b border-neutral-100 dark:border-neutral-700">
                                <td className="py-3 pr-4 font-medium">Communications</td>
                                <td className="py-3 pr-4">Contact form submissions, support requests</td>
                                <td className="py-3">Customer support</td>
                              </tr>
                              <tr>
                                <td className="py-3 pr-4 font-medium">AI interactions</td>
                                <td className="py-3 pr-4">Queries to the Nurexa AI assistant</td>
                                <td className="py-3">Conversational AI responses</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">2.2 Data Collected Automatically</h3>
                      <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        <p>When you use the Service, we automatically collect:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li><strong>Technical data:</strong> IP address, browser type and version, device type, operating system</li>
                          <li><strong>Usage data:</strong> Pages visited, features used, time spent, referring URL</li>
                          <li><strong>Location data:</strong> Approximate location (city-level) derived from IP address, used for store recommendations. Precise GPS location is only collected with your explicit consent via your device's location permissions.</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">2.3 Special Category Data</h3>
                      <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        <p>
                          We may process data relating to your health where you voluntarily provide it (e.g., food allergies,
                          dietary requirements for medical conditions). This constitutes special category data under UK GDPR
                          Article 9. We process this data on the basis of your explicit consent (Article 9(2)(a)), which you
                          provide when entering this information into the Service. You may withdraw this consent and delete
                          this data at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Lawful Basis for Processing */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Eye className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    3. Lawful Basis for Processing
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Under UK GDPR Article 6, we process your personal data on the following lawful bases:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-600">
                            <th className="text-left py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">Lawful Basis</th>
                            <th className="text-left py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">Processing Activity</th>
                            <th className="text-left py-3 font-semibold text-neutral-900 dark:text-neutral-100">GDPR Article</th>
                          </tr>
                        </thead>
                        <tbody className="text-neutral-700 dark:text-neutral-300">
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">Contract performance</td>
                            <td className="py-3 pr-4">Providing the Service: pantry management, AI recommendations, meal planning, grocery lists</td>
                            <td className="py-3">Art. 6(1)(b)</td>
                          </tr>
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">Consent</td>
                            <td className="py-3 pr-4">Marketing communications, precise location tracking, health-related dietary data, non-essential cookies</td>
                            <td className="py-3">Art. 6(1)(a)</td>
                          </tr>
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">Legitimate interest</td>
                            <td className="py-3 pr-4">Service improvement, fraud prevention, security monitoring, analytics (with balancing test conducted)</td>
                            <td className="py-3">Art. 6(1)(f)</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 font-medium">Legal obligation</td>
                            <td className="py-3 pr-4">Compliance with UK law, responding to lawful data requests from authorities</td>
                            <td className="py-3">Art. 6(1)(c)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p>
                      Where we rely on legitimate interest, we have conducted a Legitimate Interest Assessment (LIA) to
                      ensure our interests do not override your fundamental rights and freedoms. You may request a copy
                      of our LIA by contacting privacy@nourishneural.co.uk.
                    </p>
                  </div>
                </section>

                {/* AI and Automated Decision-Making */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    4. AI Processing and Automated Decision-Making
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Nourish Neural uses AI and machine learning to provide personalised recommendations. In compliance
                      with UK GDPR Article 22, we provide the following information:
                    </p>
                    <ul className="list-disc pl-6 space-y-3">
                      <li>
                        <strong>Waste prediction:</strong> An ensemble of three machine learning models (Random Forest, Gradient Boosting,
                        Neural Network) analyses 45 features including storage conditions, purchase dates, and food categories to predict
                        waste risk. These predictions are advisory only and do not trigger any automated actions without your input.
                      </li>
                      <li>
                        <strong>Recipe and meal recommendations:</strong> Based on your pantry contents, dietary preferences, and
                        nutritional profile. You are always free to accept, modify, or reject any recommendation.
                      </li>
                      <li>
                        <strong>Conversational AI (Nurexa):</strong> Processes your natural language queries to provide food management
                        assistance. AI conversations are processed locally where possible (via Ollama) to minimise data transmission.
                        Conversation data is retained only for the duration of your session unless you opt in to conversation history.
                      </li>
                    </ul>
                    <p>
                      <strong>Your rights regarding automated processing:</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>You have the right to request human review of any AI-generated recommendation</li>
                      <li>You have the right to obtain an explanation of how a prediction was made (feature importance and confidence scores are available in the AI Explainability section)</li>
                      <li>You have the right to contest any AI output and express your point of view</li>
                      <li>No decisions with legal or similarly significant effects are made by automated means alone</li>
                    </ul>
                  </div>
                </section>

                {/* Data Sharing */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Server className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    5. Data Sharing and Third-Party Processors
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      <strong>We do not sell your personal data.</strong> We share your data only with the following
                      categories of recipients, each bound by data processing agreements:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-600">
                            <th className="text-left py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">Processor</th>
                            <th className="text-left py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">Purpose</th>
                            <th className="text-left py-3 font-semibold text-neutral-900 dark:text-neutral-100">Location</th>
                          </tr>
                        </thead>
                        <tbody className="text-neutral-700 dark:text-neutral-300">
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">Supabase</td>
                            <td className="py-3 pr-4">Authentication, database hosting, cloud storage</td>
                            <td className="py-3">EU (Frankfurt)</td>
                          </tr>
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">Vercel</td>
                            <td className="py-3 pr-4">Website hosting and content delivery</td>
                            <td className="py-3">Global CDN (EU primary)</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 font-medium">TomTom</td>
                            <td className="py-3 pr-4">Store location and mapping services</td>
                            <td className="py-3">Netherlands (EU)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p>
                      <strong>AI processing:</strong> The Ollama language model runs locally on our infrastructure. Your
                      AI queries are not sent to external third-party AI providers (such as OpenAI or Google) unless we
                      notify you in advance and obtain your consent.
                    </p>
                    <p>
                      We may also disclose your data where required by law, regulation, court order, or governmental
                      request, or where necessary to protect our rights, property, or safety or that of others.
                    </p>
                  </div>
                </section>

                {/* International Transfers */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Globe className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    6. International Data Transfers
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Your data is primarily stored and processed within the UK and European Economic Area (EEA). Where
                      we transfer personal data outside the UK, we ensure appropriate safeguards are in place as required
                      by UK GDPR Chapter V, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>UK adequacy regulations:</strong> Transfers to countries deemed adequate by the UK Secretary of State</li>
                      <li><strong>International Data Transfer Agreement (IDTA):</strong> The UK's replacement for Standard Contractual Clauses, approved by the ICO</li>
                      <li><strong>UK Addendum to the EU SCCs:</strong> Where applicable for transfers via EU-based processors</li>
                    </ul>
                    <p>
                      You may request details of the specific safeguards applied to your data by contacting privacy@nourishneural.co.uk.
                    </p>
                  </div>
                </section>

                {/* Data Security */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Lock className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    7. Data Security
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      We implement appropriate technical and organisational measures to protect your personal data
                      against unauthorised or unlawful processing and against accidental loss, destruction, or damage,
                      as required by UK GDPR Article 32:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Encryption:</strong> TLS 1.2+ for data in transit; AES-256 for data at rest</li>
                      <li><strong>Authentication:</strong> JWT tokens with secure expiry, bcrypt password hashing</li>
                      <li><strong>Access controls:</strong> Row-Level Security (RLS) on all database tables ensures users can only access their own data</li>
                      <li><strong>Rate limiting:</strong> Protection against brute-force attacks on authentication endpoints</li>
                      <li><strong>Security headers:</strong> Helmet.js with Content Security Policy, X-Frame-Options, X-Content-Type-Options</li>
                      <li><strong>Input validation:</strong> Server-side validation using Joi to prevent injection attacks</li>
                      <li><strong>Regular updates:</strong> Dependencies monitored and updated for known vulnerabilities</li>
                    </ul>
                    <p className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4 dark:text-yellow-200">
                      <strong>Note:</strong> No method of electronic storage or transmission is 100% secure. While we implement
                      industry-standard safeguards, we cannot guarantee absolute security. In the event of a personal data breach,
                      we will notify the ICO within 72 hours where required by UK GDPR Article 33, and affected individuals without
                      undue delay where required by Article 34.
                    </p>
                  </div>
                </section>

                {/* Data Retention */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    8. Data Retention
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      We retain personal data only for as long as necessary to fulfil the purposes for which it was
                      collected, in accordance with UK GDPR Article 5(1)(e) (storage limitation):
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-600">
                            <th className="text-left py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">Data Type</th>
                            <th className="text-left py-3 pr-4 font-semibold text-neutral-900 dark:text-neutral-100">Retention Period</th>
                            <th className="text-left py-3 font-semibold text-neutral-900 dark:text-neutral-100">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="text-neutral-700 dark:text-neutral-300">
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">Account data</td>
                            <td className="py-3 pr-4">Duration of account + 30 days</td>
                            <td className="py-3">Service provision; grace period for reactivation</td>
                          </tr>
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">Food and pantry data</td>
                            <td className="py-3 pr-4">Duration of account + 30 days</td>
                            <td className="py-3">Core service delivery</td>
                          </tr>
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">AI conversation logs</td>
                            <td className="py-3 pr-4">Session duration (unless history opted in)</td>
                            <td className="py-3">Real-time AI response</td>
                          </tr>
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">Contact form submissions</td>
                            <td className="py-3 pr-4">12 months after resolution</td>
                            <td className="py-3">Customer support records</td>
                          </tr>
                          <tr className="border-b border-neutral-100 dark:border-neutral-700">
                            <td className="py-3 pr-4 font-medium">Server access logs</td>
                            <td className="py-3 pr-4">90 days</td>
                            <td className="py-3">Security monitoring</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 font-medium">Anonymised analytics</td>
                            <td className="py-3 pr-4">Indefinite</td>
                            <td className="py-3">Service improvement (no personal data)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p>
                      When you delete your account, we will erase your personal data within 30 days. Anonymised,
                      aggregated data (which cannot identify you) may be retained indefinitely for service improvement.
                      We may retain certain data beyond these periods where required by law (e.g., for tax, legal,
                      or regulatory purposes under the Limitation Act 1980).
                    </p>
                  </div>
                </section>

                {/* Your Rights */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Users className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    9. Your Data Protection Rights
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Under the UK GDPR, you have the following rights. These rights are not absolute and may be subject
                      to certain exemptions under the Data Protection Act 2018:
                    </p>
                    <ul className="list-disc pl-6 space-y-3">
                      <li><strong>Right of access (Article 15):</strong> You may request a copy of all personal data we hold about you. You can also export your data directly via the "My Data" tab in your Profile at any time.</li>
                      <li><strong>Right to rectification (Article 16):</strong> You may request correction of inaccurate or incomplete personal data. You can update most data directly in your Profile settings.</li>
                      <li><strong>Right to erasure (Article 17):</strong> You may request deletion of your personal data where there is no compelling reason for its continued processing. You can delete your account via Profile settings.</li>
                      <li><strong>Right to restrict processing (Article 18):</strong> You may request that we limit how we process your data in certain circumstances (e.g., while we verify the accuracy of disputed data).</li>
                      <li><strong>Right to data portability (Article 20):</strong> You may request your data in a structured, commonly used, machine-readable format (JSON). Use the data export feature in your Profile.</li>
                      <li><strong>Right to object (Article 21):</strong> You may object to processing based on legitimate interests. We will cease processing unless we demonstrate compelling legitimate grounds.</li>
                      <li><strong>Rights related to automated decision-making (Article 22):</strong> You may request human intervention in, and contest the result of, any automated decision-making. See Section 4 above.</li>
                      <li><strong>Right to withdraw consent:</strong> Where processing is based on consent, you may withdraw consent at any time without affecting the lawfulness of processing carried out before withdrawal.</li>
                    </ul>
                    <p>
                      <strong>How to exercise your rights:</strong> Email privacy@nourishneural.co.uk or use the self-service
                      tools in your Profile. We will respond to your request within one month (extendable by two further months
                      for complex requests, in which case we will inform you). We will not charge a fee unless the request
                      is manifestly unfounded or excessive. We may request proof of identity before processing your request.
                    </p>
                  </div>
                </section>

                {/* Cookies and PECR */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Cookie className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    10. Cookies and Electronic Communications (PECR)
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      In compliance with the Privacy and Electronic Communications Regulations 2003 (PECR), we use the
                      following categories of cookies and similar technologies:
                    </p>

                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-6 mb-3">Strictly Necessary Cookies (no consent required)</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Authentication token:</strong> JWT stored in localStorage to maintain your logged-in session</li>
                      <li><strong>Service worker cache:</strong> PWA offline functionality (Workbox)</li>
                      <li><strong>Security cookies:</strong> CSRF protection and rate limiting identifiers</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-6 mb-3">Functional Cookies (consent required)</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>User preferences:</strong> Theme (light/dark mode), language, display settings</li>
                      <li><strong>Session state:</strong> Last visited page, open tabs, form progress</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-6 mb-3">Analytics Cookies (consent required)</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Usage analytics:</strong> Aggregated, anonymised data on feature usage and page visits</li>
                    </ul>

                    <p>
                      We do not use advertising or tracking cookies. We do not engage in cross-site tracking or share
                      cookie data with advertisers.
                    </p>
                    <p>
                      You can manage cookies through your browser settings. Disabling strictly necessary cookies may
                      prevent the Service from functioning correctly. For more information about cookies, visit
                      aboutcookies.org or allaboutcookies.org.
                    </p>
                    <p>
                      <strong>Electronic marketing:</strong> We will only send you marketing communications where you have
                      given explicit opt-in consent in accordance with PECR Regulation 22. You may unsubscribe at any time
                      using the link in any marketing email or by contacting us.
                    </p>
                  </div>
                </section>

                {/* Children's Privacy */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">11. Children's Privacy</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      Nourish Neural is not directed at children under 16 years of age. In accordance with the UK GDPR
                      (which sets the age of consent for data processing at 16 in the UK, as implemented by the Data
                      Protection Act 2018, Section 9) and the ICO's Age Appropriate Design Code (Children's Code):
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>We do not knowingly collect personal data from children under 16 without verifiable parental or guardian consent</li>
                      <li>If we become aware that we have collected personal data from a child under 16 without appropriate consent, we will take steps to delete that data promptly</li>
                      <li>If you are a parent or guardian and believe your child has provided us with personal data, please contact us at privacy@nourishneural.co.uk</li>
                    </ul>
                  </div>
                </section>

                {/* Third-Party Services */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">12. Third-Party Links and Services</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      The Service may contain links to third-party websites or integrate with third-party services.
                      This Privacy Policy does not apply to those third parties. We encourage you to review their
                      privacy policies before providing any personal data.
                    </p>
                    <p>
                      We are not responsible for the privacy practices, content, or security of any third-party websites
                      or services.
                    </p>
                  </div>
                </section>

                {/* Changes */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">13. Changes to This Privacy Policy</h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      We may update this Privacy Policy to reflect changes in our practices, technology, legal
                      requirements, or other factors. We will:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Update the "Last updated" date at the top of this page</li>
                      <li>Notify you of material changes by email or through the Service at least 30 days before they take effect</li>
                      <li>Where changes affect the lawful basis for processing or introduce new categories of data collection, we will seek fresh consent where required</li>
                    </ul>
                    <p>
                      Your continued use of the Service after changes take effect constitutes acceptance. If you do not
                      agree, you should stop using the Service and delete your account.
                    </p>
                  </div>
                </section>

                {/* Contact */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center">
                    <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                    14. Contact Us and Complaints
                  </h2>
                  <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <p>
                      If you have questions about this Privacy Policy, wish to exercise your data protection rights,
                      or have a complaint about how we handle your data:
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 dark:text-green-200">
                      <p><strong>Data Protection Contact:</strong> privacy@nourishneural.co.uk</p>
                      <p><strong>General Support:</strong> support@nourishneural.co.uk</p>
                      <p><strong>Address:</strong> Nourish Neural, London, United Kingdom</p>
                    </div>
                    <p>
                      We aim to respond to all data protection queries within one month.
                    </p>
                    <p>
                      <strong>Supervisory authority:</strong> You have the right to lodge a complaint with the
                      Information Commissioner's Office (ICO) at any time:
                    </p>
                    <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
                      <p><strong>Information Commissioner's Office</strong></p>
                      <p>Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF</p>
                      <p>Telephone: 0303 123 1113</p>
                      <p>Website: ico.org.uk</p>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                      We would appreciate the opportunity to address your concerns before you contact the ICO. However,
                      this does not affect your right to lodge a complaint with the ICO at any time.
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
                  <Link to="/terms" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                    Terms of Service
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
