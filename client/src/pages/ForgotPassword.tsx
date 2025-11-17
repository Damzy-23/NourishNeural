import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Mail, BrainCircuit, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeUp, scaleIn, staggerContainer } from '../utils/motion'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setIsSuccess(true)
      toast.success('Password reset link sent to your email')
    } catch (error) {
      // For security, we still show success message
      // This prevents email enumeration attacks
      setIsSuccess(true)
      toast.success('If an account exists, a reset link has been sent')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) {
      setError('')
    }
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password - Nourish Neural</title>
        <meta name="description" content="Reset your Nourish Neural account password" />
      </Helmet>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <motion.div
          className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent-300/25 blur-3xl"
          animate={{ y: [0, -30, 0], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 right-[-10%] h-96 w-96 rounded-full bg-primary-300/25 blur-3xl"
          animate={{ y: [0, 24, 0], opacity: [0.5, 0.85, 0.5], scale: [1, 1.05, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="relative max-w-md w-full mx-auto space-y-8 rounded-[28px] border border-white/40 bg-white/80 backdrop-blur-xl shadow-xl shadow-primary-500/10 p-10"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.65 }}
        >
          {/* Back to Login Link */}
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>

          <motion.div className="text-center space-y-3" variants={staggerContainer}>
            <motion.div
              className="inline-flex items-center justify-center space-x-3"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BrainCircuit className="h-8 w-8 text-white" />
              </div>
              <span className="text-4xl font-bold gradient-text">Nourish Neural</span>
            </motion.div>
            <motion.h2 className="text-3xl font-bold text-neutral-900" variants={fadeUp} transition={{ duration: 0.55 }}>
              Forgot password?
            </motion.h2>
            <motion.p className="text-neutral-600 text-base" variants={fadeUp}>
              {isSuccess
                ? "Check your email for reset instructions"
                : "No worries, we'll send you reset instructions."
              }
            </motion.p>
          </motion.div>

          {isSuccess ? (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-green-900 mb-1">Email sent successfully</h3>
                    <p className="text-sm text-green-700">
                      We've sent a password reset link to <strong>{email}</strong>.
                      Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-neutral-600">
                <p>Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1 text-neutral-500">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email address</li>
                  <li>Wait a few minutes and check again</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setIsSuccess(false)
                  setEmail('')
                }}
                className="w-full flex justify-center items-center py-3 px-4 border border-primary-600 rounded-lg shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Try another email
              </button>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        error ? 'border-red-300 bg-red-50' : 'border-neutral-300 bg-white'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </motion.form>
            </>
          )}

          {/* Sign In Link */}
          <motion.div className="text-center" variants={fadeUp} transition={{ duration: 0.5, delay: 0.12 }}>
            <p className="text-neutral-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
