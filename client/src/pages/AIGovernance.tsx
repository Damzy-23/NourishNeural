import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ShieldCheck,
  Eye,
  Scale,
  Lock,
  FileCheck,
  Users,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  Wrench,
  CheckCircle2,
  Info,
} from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const riskTiers = [
  {
    level: 'Unacceptable Risk',
    color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
    textColor: 'text-red-800 dark:text-red-300',
    badgeColor: 'bg-red-600',
    description: 'Social scoring, real-time biometric surveillance',
    status: null,
  },
  {
    level: 'High Risk',
    color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
    textColor: 'text-amber-800 dark:text-amber-300',
    badgeColor: 'bg-amber-600',
    description: 'Medical devices, clinical decision support, diagnostic AI',
    detail: 'Healthcare AI tools that directly influence clinical decisions',
    status: null,
  },
  {
    level: 'Limited Risk',
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 ring-2 ring-blue-400 dark:ring-blue-500',
    textColor: 'text-blue-800 dark:text-blue-300',
    badgeColor: 'bg-blue-600',
    description: 'AI chatbots, recommendation systems, food safety tools',
    detail: 'Nourish Neural operates here: transparency obligations apply',
    status: 'current',
  },
  {
    level: 'Minimal Risk',
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
    textColor: 'text-green-800 dark:text-green-300',
    badgeColor: 'bg-green-600',
    description: 'Spam filters, AI-enhanced games',
    status: null,
  },
]

const governancePillars = [
  {
    icon: ShieldCheck,
    title: 'Safety First',
    description:
      'AI outputs are constrained by guardrails. Medical advice is explicitly blocked. Predictions include confidence scores so users can make informed decisions.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description:
      'Every AI prediction is explainable. Users see which features drove the decision, individual model scores, and confidence intervals.',
  },
  {
    icon: Scale,
    title: 'Fairness & Bias',
    description:
      'Models are tested across demographics, household sizes, and geographic regions. No user group receives systematically worse predictions.',
  },
  {
    icon: Lock,
    title: 'Privacy by Design',
    description:
      'GDPR-compliant from architecture level. Data minimisation, purpose limitation, user consent, and right to erasure built in.',
  },
  {
    icon: FileCheck,
    title: 'Auditability',
    description:
      'All AI decisions are logged with timestamps, input data, model versions, and output scores. Full audit trail for regulatory review.',
  },
  {
    icon: Users,
    title: 'Human Oversight',
    description:
      'AI assists but never overrides human judgement. High-risk predictions (expired food safety) are flagged for manual review.',
  },
]

const safeguards = [
  {
    title: 'No Medical Advice Boundary',
    description:
      'The AI assistant explicitly refuses to provide medical, dietary, or clinical advice. When asked health-related questions, the system redirects users to qualified professionals.',
    example:
      "User: \"Should I take supplements for my condition?\"\nSystem: \"I'm not qualified to give medical advice. Please consult your GP or a registered dietitian.\"",
  },
  {
    title: 'Food Safety Conservatism',
    description:
      'Expiry predictions err on the side of caution. The system would rather flag a safe item as "check before consuming" than miss a genuinely expired product. False positives are safer than false negatives in food safety.',
    example:
      'Prediction confidence < 70% triggers a "Check before consuming" warning rather than a definitive safe/expired label.',
  },
  {
    title: 'Allergen Awareness',
    description:
      'The system tracks user allergies and cross-references with recipe suggestions. An allergen match triggers a prominent warning, never a silent substitution.',
    example:
      'Recipe contains peanuts + user has nut allergy = red banner: "ALLERGEN WARNING: This recipe contains peanuts, which is listed in your allergen profile."',
  },
  {
    title: 'Source Attribution',
    description:
      'AI recommendations always cite the data source (pantry item, waste log, nutrition profile). Users can trace exactly why a suggestion was made.',
    example:
      'Suggestion: "Use the chicken breast expiring tomorrow" cites: source=pantry_item_#1247, expiry=2026-06-11, confidence=0.92',
  },
  {
    title: 'Graceful Degradation',
    description:
      'When the ML model or LLM is unavailable, the system falls back to rule-based predictions rather than providing no guidance. Fallback behaviour is clearly labelled.',
    example:
      'LLM offline: "[Rule-based fallback] Based on typical shelf life, this item should be used within 3 days."',
  },
]

const complianceStandards = [
  {
    standard: 'GDPR (UK)',
    articles: 'Articles 5, 6, 13-22, 25, 35',
    compliance:
      'Data protection by design, transparency, right to explanation, DPIA',
  },
  {
    standard: 'NHS Digital Service Standards',
    articles: 'All 14 standards',
    compliance:
      'Accessible, evidence-based, clinically safe, interoperable',
  },
  {
    standard: 'NICE Evidence Standards',
    articles: 'Evidence Standards Framework',
    compliance:
      'Demonstrated effectiveness, appropriate evidence generation',
  },
  {
    standard: 'EU AI Act',
    articles: 'Title IV, Annex VIII',
    compliance:
      'Transparency obligations for limited-risk AI, voluntary high-risk governance',
  },
  {
    standard: 'ICO AI Guidance',
    articles: 'AI auditing framework',
    compliance:
      'Fairness, accountability, transparency in automated decision-making',
  },
  {
    standard: 'MHRA SaMD Guidelines',
    articles: 'Software as Medical Device',
    compliance:
      'While not a medical device, architecture follows SaMD principles for future extensibility',
  },
]

const incidentSteps = [
  {
    icon: Search,
    title: 'Detect',
    description:
      'Automated monitoring flags anomalous predictions (confidence < 40%, repeated errors, user reports)',
  },
  {
    icon: AlertTriangle,
    title: 'Contain',
    description:
      'Affected AI feature automatically falls back to rule-based logic. Users are notified of reduced functionality.',
  },
  {
    icon: Wrench,
    title: 'Investigate',
    description:
      'Audit trail reviewed. Root cause analysis on model inputs, training data, and prompt behaviour.',
  },
  {
    icon: CheckCircle2,
    title: 'Remediate',
    description:
      'Model retrained or prompt updated. Post-incident review documented. Affected users notified.',
  },
]

const continuousImprovement = [
  {
    title: 'Monthly Model Validation',
    description:
      'Predictions compared against actual outcomes (did the food actually go to waste?). Model accuracy tracked over time.',
  },
  {
    title: 'User Feedback Loop',
    description:
      'Users can flag incorrect predictions. Feedback is aggregated and used in monthly retraining cycles.',
  },
  {
    title: 'Emerging Standards Monitoring',
    description:
      'We track updates to NHS AI guidelines, EU AI Act implementation, and MHRA guidance to ensure ongoing compliance.',
  },
]

export default function AIGovernance() {
  return (
    <>
      <Helmet>
        <title>AI Governance & Healthcare Compliance - Nourish Neural</title>
        <meta
          name="description"
          content="Responsible AI governance, healthcare compliance, and safety practices for Nourish Neural's food waste prediction system"
        />
      </Helmet>

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Header */}
        <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  to="/"
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Nourish Neural" className="h-8 w-8" />
                  </div>
                  <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Nourish Neural
                  </span>
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

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Gradient Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-12 text-white"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    AI Governance & Healthcare Compliance
                  </h1>
                  <p className="text-teal-100 mt-1">
                    Building trustworthy AI for health-sensitive applications
                  </p>
                </div>
              </div>
              <p className="text-teal-100 max-w-3xl">
                Our approach to responsible AI development, aligned with NHS Digital
                standards, NICE evidence frameworks, and the EU AI Act risk
                classification.
              </p>
            </motion.div>

            <div className="px-8 py-10 space-y-16">
              {/* Section 1: Risk Classification */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
                custom={0}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  AI Risk Classification
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  EU AI Act Framework
                </p>
                <div className="space-y-3">
                  {riskTiers.map((tier) => (
                    <div
                      key={tier.level}
                      className={`rounded-xl border p-5 ${tier.color} transition-all`}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`inline-flex items-center rounded-full ${tier.badgeColor} px-3 py-1 text-xs font-semibold text-white whitespace-nowrap`}
                        >
                          {tier.level}
                        </span>
                        <div className="flex-1">
                          <p className={`font-medium ${tier.textColor}`}>
                            {tier.description}
                          </p>
                          {tier.detail && (
                            <p className={`text-sm mt-1 ${tier.textColor} opacity-80`}>
                              {tier.detail}
                            </p>
                          )}
                          {tier.status === 'current' && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                Our classification
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-teal-800 dark:text-teal-300">
                      While Nourish Neural is classified as limited risk, we voluntarily
                      apply high-risk governance practices because our food safety
                      predictions can indirectly affect health outcomes.
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Section 2: Governance Framework */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
                custom={1}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Our AI Governance Framework
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {governancePillars.map((pillar) => {
                    const Icon = pillar.icon
                    return (
                      <motion.div
                        key={pillar.title}
                        whileHover={{ y: -2 }}
                        className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:border-teal-300 dark:hover:border-teal-600 transition-colors"
                      >
                        <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400 mb-3" />
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                          {pillar.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {pillar.description}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>

              {/* Section 3: Healthcare-Specific Safeguards */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
                custom={2}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Healthcare Context Safeguards
                </h2>
                <div className="space-y-4">
                  {safeguards.map((safeguard, index) => (
                    <div
                      key={safeguard.title}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            {safeguard.title}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                            {safeguard.description}
                          </p>
                          <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 px-4 py-3">
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-500 uppercase tracking-wide mb-1">
                              Example
                            </p>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line leading-relaxed">
                              {safeguard.example}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Section 4: Compliance Alignment */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
                custom={3}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Regulatory Alignment
                </h2>
                <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                  {complianceStandards.map((item, index) => (
                    <div
                      key={item.standard}
                      className={`flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 p-5 ${
                        index !== complianceStandards.length - 1
                          ? 'border-b border-neutral-200 dark:border-neutral-700'
                          : ''
                      } ${
                        index % 2 === 0
                          ? 'bg-white dark:bg-neutral-800'
                          : 'bg-neutral-50 dark:bg-neutral-800/50'
                      }`}
                    >
                      <div className="sm:w-56 flex-shrink-0">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                          {item.standard}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
                          {item.articles}
                        </p>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {item.compliance}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Section 5: Incident Response */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
                custom={4}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  AI Incident Response Protocol
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {incidentSteps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div key={step.title} className="relative">
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 h-full">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                          </div>
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                            {step.title}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        {index < incidentSteps.length - 1 && (
                          <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                            <ArrowRight className="h-5 w-5 text-teal-400 dark:text-teal-600" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.section>

              {/* Section 6: Continuous Improvement */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
                custom={5}
              >
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Quality Assurance & Continuous Improvement
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {continuousImprovement.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5"
                    >
                      <RefreshCw className="h-6 w-6 text-teal-600 dark:text-teal-400 mb-3" />
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Section 7: Healthcare Application Callout */}
              <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
                custom={6}
              >
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                        Built for Healthcare-Grade Trust
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        The governance practices demonstrated here — risk
                        classification, safety guardrails, audit trails, incident
                        response, and regulatory alignment — are not just best
                        practices for a food management app. They are the exact same
                        frameworks used in patient-facing AI tools, clinical decision
                        support systems, and healthcare communications platforms. This
                        architecture is designed to be extended into regulated
                        healthcare environments with minimal additional governance
                        overhead.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Footer */}
            <div className="bg-neutral-50 dark:bg-neutral-900 px-8 py-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  &copy; 2026 Nourish Neural. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <Link
                    to="/support"
                    className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    Support
                  </Link>
                  <Link
                    to="/privacy"
                    className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/"
                    className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
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
