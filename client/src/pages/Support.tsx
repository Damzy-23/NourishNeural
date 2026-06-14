import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, LifeBuoy, BookOpen, MessageCircle, Zap, ChevronDown, ChevronUp, Mail, ExternalLink } from 'lucide-react'

const faqs = [
  {
    question: 'How does the AI waste prediction work?',
    answer: 'Our machine learning ensemble (GradientBoosting + RandomForest + Neural Network) analyses your pantry items, storage conditions, and historical usage patterns to predict when items are likely to expire or go to waste. The system learns and improves over time based on your household behaviour.',
  },
  {
    question: 'Can I use Nourish Neural offline?',
    answer: 'Yes. Nourish Neural is a Progressive Web App with offline support. Core features like viewing your pantry, grocery lists, and cached meal plans work without an internet connection. AI features require connectivity to process requests.',
  },
  {
    question: 'How do I add items to my pantry?',
    answer: 'Navigate to the Neural Pantry page and tap the "Add Item" button. You can enter items manually, scan a barcode using your device camera, or import items directly from a completed grocery list.',
  },
  {
    question: 'What is the Nurexa AI assistant?',
    answer: 'Nurexa is our conversational AI copilot powered by a local language model. It can check your pantry, find expiring items, predict waste risk, suggest recipes based on what you have, and provide personalised meal planning advice.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'From the login page, click "Forgot Password" and enter your registered email address. You\'ll receive a password reset link. If you don\'t receive the email within a few minutes, check your spam folder or contact support.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use Supabase for authentication with industry-standard JWT tokens, enforce rate limiting on all auth endpoints, and never store passwords in plain text. Your data is encrypted in transit and at rest. See our Privacy Policy for full details.',
  },
  {
    question: 'Can I share grocery lists with my household?',
    answer: 'Household sharing features are on our roadmap. Currently, each account manages its own pantry and grocery lists independently.',
  },
  {
    question: 'Which UK stores are supported?',
    answer: 'We support major UK supermarkets including Tesco, Sainsbury\'s, Asda, Morrisons, Aldi, Lidl, Waitrose, M&S Food, Co-op, and Iceland. Store availability data is refreshed regularly.',
  },
]

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      <Helmet>
        <title>Support - Nourish Neural</title>
        <meta name="description" content="Get help with Nourish Neural - FAQs, guides, and support resources" />
      </Helmet>

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <LifeBuoy className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Support Centre</h1>
                  <p className="text-primary-100 mt-1">Find answers and get help</p>
                </div>
              </div>
              <p className="text-primary-100 max-w-2xl">
                Browse our frequently asked questions, explore guides, or reach out to our team directly.
              </p>
            </div>

            <div className="px-8 py-10 space-y-12">

              {/* Quick Help Cards */}
              <section>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Quick Help</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400 mb-3" />
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Getting Started</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Create an account, set up your pantry, and start your first grocery list.
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                    <Zap className="h-6 w-6 text-primary-600 dark:text-primary-400 mb-3" />
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">AI Features</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Learn how waste prediction, Nurexa AI, and smart meal planning work.
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                    <MessageCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mb-3" />
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Contact Us</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Can't find what you need? Get in touch with our support team.
                    </p>
                    <Link to="/contact" className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 mt-2 hover:underline">
                      Go to Contact <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                      >
                        <span className="font-medium text-neutral-900 dark:text-neutral-100 pr-4">{faq.question}</span>
                        {openFaq === i ? (
                          <ChevronUp className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                        )}
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Still need help */}
              <section>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 text-center">
                  <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Still need help?</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    Our team typically responds within 24 hours.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                  >
                    Contact Support
                  </Link>
                </div>
              </section>

            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900 px-8 py-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  © 2026 Nourish Neural. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <Link to="/contact" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                    Contact
                  </Link>
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
