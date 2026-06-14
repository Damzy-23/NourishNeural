import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'

type FormStatus = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })

      if (res.ok) {
        setStatus('sent')
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Us - Nourish Neural</title>
        <meta name="description" content="Get in touch with the Nourish Neural team - we'd love to hear from you" />
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
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 px-8 py-12 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mail className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Contact Us</h1>
                  <p className="text-primary-100 mt-1">We'd love to hear from you</p>
                </div>
              </div>
              <p className="text-primary-100 max-w-2xl">
                Have a question, suggestion, or just want to say hello? Fill in the form below or reach out using our contact details.
              </p>
            </div>

            <div className="px-8 py-10">
              <div className="grid gap-10 lg:grid-cols-5">

                {/* Contact Info Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Get in Touch</h2>
                    <div className="space-y-5">
                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">General Inquiries</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">support@nourishneural.co.uk</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Privacy & Data</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">privacy@nourishneural.co.uk</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Address</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Nourish Neural<br />London, United Kingdom</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Response Time</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">We typically respond within 24 hours on business days.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-neutral-50 dark:bg-neutral-700/50 p-5">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Looking for help?</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      Check our Support Centre for FAQs and guides before reaching out.
                    </p>
                    <Link
                      to="/support"
                      className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
                    >
                      Visit Support Centre
                    </Link>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-3">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Send a Message</h2>

                  {status === 'sent' ? (
                    <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-8 text-center">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Message Sent</h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                        Thanks for getting in touch. We'll get back to you as soon as possible.
                      </p>
                      <button
                        onClick={() => setStatus('idle')}
                        className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            Name
                          </label>
                          <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                          Subject
                        </label>
                        <select
                          id="subject"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
                        >
                          <option value="">Select a topic</option>
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Bug Report">Bug Report</option>
                          <option value="Feature Request">Feature Request</option>
                          <option value="Account Issue">Account Issue</option>
                          <option value="Privacy & Data">Privacy & Data</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                          Message
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors resize-none"
                          placeholder="How can we help?"
                        />
                      </div>

                      {status === 'error' && (
                        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>Something went wrong. Please try again or email us directly.</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {status === 'sending' ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900 px-8 py-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  © 2026 Nourish Neural. All rights reserved.
                </p>
                <div className="flex space-x-6">
                  <Link to="/support" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                    Support
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
