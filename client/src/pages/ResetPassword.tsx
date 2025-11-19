import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeUp, scaleIn, staggerContainer } from '../utils/motion'

export default function ResetPassword() {
  useSearchParams() // Required for URL handling
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [token, setToken] = useState('')

  useEffect(() => {
    // Extract token from URL hash (Supabase sends it as #access_token=...)
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      if (accessToken) {
        setToken(accessToken)
      } else {
        setErrors({ general: 'Invalid or missing reset token. Please request a new password reset.' })
      }
    } else {
      setErrors({ general: 'Invalid or missing reset token. Please request a new password reset.' })
    }
  }, [])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (formData.password.length > 72) {
      newErrors.password = 'Password must be less than 72 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setErrors({ general: 'Invalid reset token. Please request a new password reset.' })
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setIsSuccess(true)
      toast.success('Password reset successfully!')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
      setErrors({ general: error.message || 'Failed to reset password. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }

    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' }
    if (strength <= 3) return { strength, label: 'Fair', color: 'bg-yellow-500' }
    if (strength <= 4) return { strength, label: 'Good', color: 'bg-blue-500' }
    return { strength, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <>
      <Helmet>
        <title>Reset Password - Nourish Neural</title>
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
          <motion.div className="text-center space-y-3" variants={staggerContainer}>
            <motion.div
              className="inline-flex items-center justify-center space-x-3"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <img src="/favicon.svg" alt="Nourish Neural" className="h-16 w-16" />
              </div>
              <span className="text-4xl font-bold gradient-text">Nourish Neural</span>
            </motion.div>
            <motion.h2 className="text-3xl font-bold text-neutral-900" variants={fadeUp} transition={{ duration: 0.55 }}>
              Reset your password
            </motion.h2>
            <motion.p className="text-neutral-600 text-base" variants={fadeUp}>
              {isSuccess
                ? "Your password has been reset successfully"
                : "Enter your new password below"
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
                    <h3 className="text-sm font-medium text-green-900 mb-1">Password reset successful</h3>
                    <p className="text-sm text-green-700">
                      Your password has been reset successfully. Redirecting you to login...
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Go to login
              </Link>
            </motion.div>
          ) : (
            <>
              {errors.general && (
                <motion.div
                  className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-700 text-sm">{errors.general}</p>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-red-600 hover:text-red-500 underline mt-1 inline-block"
                    >
                      Request new reset link
                    </Link>
                  </div>
                </motion.div>
              )}

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-neutral-300 bg-white'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  {formData.password && !errors.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-neutral-600">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength.label === 'Weak' ? 'text-red-600' :
                          passwordStrength.label === 'Fair' ? 'text-yellow-600' :
                          passwordStrength.label === 'Good' ? 'text-blue-600' :
                          'text-green-600'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-neutral-300 bg-white'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-neutral-700 mb-2">Password must:</p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li className="flex items-center">
                      <span className={`mr-2 ${formData.password.length >= 6 ? 'text-green-500' : 'text-neutral-400'}`}>
                        {formData.password.length >= 6 ? '✓' : '○'}
                      </span>
                      Be at least 6 characters long
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-neutral-400'}`}>
                        {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                      </span>
                      Include uppercase letters
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${/\d/.test(formData.password) ? 'text-green-500' : 'text-neutral-400'}`}>
                        {/\d/.test(formData.password) ? '✓' : '○'}
                      </span>
                      Include numbers
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Resetting password...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </button>
              </motion.form>
            </>
          )}

          {/* Back to Login Link */}
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
