import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeUp, scaleIn, staggerContainer } from '../utils/motion'
import { supabase } from '../lib/supabase'

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { login } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters'
    }

    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Age
    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 13 || Number(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age (13-120)'
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Terms Agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Use Supabase directly for registration
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            age: parseInt(formData.age)
          }
        }
      })

      if (authError) {
        console.error('Supabase registration error:', authError)
        if (authError.message.includes('already registered')) {
          setErrors({ email: 'An account with this email already exists' })
          toast.error('Email already registered')
          return
        }
        throw new Error(authError.message || 'Registration failed')
      }

      if (!authData.user) {
        throw new Error('Registration failed - no user returned')
      }

      // If no session, email confirmation is required
      if (!authData.session) {
        toast.success('Registration successful! Please check your email to confirm your account.')
        setIsLoading(false)
        navigate('/login')
        return
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: parseInt(formData.age)
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail registration if profile creation fails
      }

      // Create default preferences
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: authData.user.id
        })

      if (prefsError) {
        console.error('Preferences creation error:', prefsError)
        // Don't fail registration
      }

      // Construct user object
      const user = {
        id: authData.user.id,
        email: authData.user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        avatarUrl: null,
        isVerified: authData.user.email_confirmed_at != null,
        role: authData.user.role || 'authenticated',
        createdAt: authData.user.created_at,
        updatedAt: new Date().toISOString()
      }

      // Store token and user data
      localStorage.setItem('pantrypal_token', authData.session.access_token)
      localStorage.setItem('pantrypal_user', JSON.stringify(user))

      // Login the user
      login(authData.session.access_token)

      toast.success('Welcome to Nourish Neural! Your account has been created successfully.')
      navigate('/app/dashboard', { replace: true })
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
      setErrors({ general: error.message || 'Registration failed. Please check your information and try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({ ...prev, [name]: newValue }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' }
    if (password.length < 6) return { strength: 1, text: 'Weak', color: 'bg-red-500' }
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 2, text: 'Fair', color: 'bg-yellow-500' }
    }
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
      return { strength: 4, text: 'Strong', color: 'bg-green-500' }
    }
    return { strength: 3, text: 'Good', color: 'bg-blue-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const onboardingHighlights = [
    'AI-personalised grocery forecasting and pantry orchestration',
    'Live UK supermarket pricing with intelligent substitutions',
    'Sustainability nudges tailored to your household cadence'
  ]
 
  return (
    <>
      <Helmet>
        <title>Create Account - Nourish Neural</title>
        <meta name="description" content="Sign up for Nourish Neural and start managing your food smarter" />
      </Helmet>

      <div className="min-h-screen gradient-bg-primary dark:bg-gradient-to-br dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <motion.div
          className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent-300/25 blur-3xl"
          animate={{ y: [0, -30, 0], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-48 right-[-12%] h-96 w-96 rounded-full bg-primary-300/25 blur-3xl"
          animate={{ y: [0, 28, 0], opacity: [0.5, 0.85, 0.5], scale: [1, 1.06, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="relative max-w-5xl w-full grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="hidden lg:flex flex-col justify-between rounded-[32px] border border-white/50 dark:border-neutral-700/60 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl shadow-2xl shadow-primary-500/20 p-10 space-y-8"
            variants={scaleIn}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="inline-flex items-center space-x-3 rounded-full border border-primary-200/70 dark:border-primary-700/70 bg-white/85 dark:bg-neutral-800/85 px-4 py-2 text-sm font-semibold text-primary-700 dark:text-primary-300 shadow-soft"
              variants={fadeUp}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 dark:from-primary-400/30 dark:to-accent-400/30">
                <img src="/favicon.svg" alt="Nourish Neural" className="h-4 w-4" />
              </span>
              <span>Activate neural nourishment for your household</span>
            </motion.div>

            <motion.div className="space-y-4" variants={fadeUp} transition={{ duration: 0.65 }}>
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                Create your <span className="gradient-text">Nourish Neural</span> identity.
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed">
                Unlock predictive grocery planning, AI-crafted pantry insights, and zero-waste coaching—all tuned to
                your lifestyle.
              </p>
            </motion.div>

            <motion.ul className="space-y-4" variants={fadeUp} transition={{ duration: 0.65, delay: 0.05 }}>
              {onboardingHighlights.map((highlight, index) => (
                <motion.li
                  key={highlight}
                  className="flex items-start space-x-3 rounded-2xl border border-primary-100/60 dark:border-primary-700/60 bg-white/75 dark:bg-neutral-800/75 px-5 py-4 shadow-soft"
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                >
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/15 dark:bg-primary-500/25 text-primary-600 dark:text-primary-400">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                  <span className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{highlight}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div className="grid grid-cols-2 gap-4 pt-4" variants={fadeUp} transition={{ duration: 0.6, delay: 0.08 }}>
              {[
                { label: 'Households onboarded', value: '18k+' },
                { label: 'Avg. waste reduction', value: '52%' },
                { label: 'Pantry freshness score', value: '92/100' },
                { label: 'Weekly savings', value: '£42' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="rounded-2xl border border-primary-100/70 dark:border-primary-700/60 bg-white/80 dark:bg-neutral-800/80 px-5 py-4 text-left shadow-soft"
                  whileHover={{ y: -4, scale: 1.03 }}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-500 dark:text-primary-400">{stat.label}</p>
                  <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="max-w-md w-full mx-auto lg:mx-0 space-y-8 rounded-[28px] border border-white/40 dark:border-neutral-700/60 bg-white/85 dark:bg-neutral-800/85 backdrop-blur-xl shadow-xl shadow-primary-500/10 p-10"
            variants={scaleIn}
            transition={{ duration: 0.7, delay: 0.12 }}
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
              <motion.h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100" variants={fadeUp} transition={{ duration: 0.55 }}>
                Create your account
              </motion.h2>
              <motion.p className="text-neutral-600 dark:text-neutral-400 text-base" variants={fadeUp}>
                Calibrate your culinary copilot in under two minutes.
              </motion.p>
            </motion.div>

            {errors.general && (
              <motion.div
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{errors.general}</p>
              </motion.div>
            )}

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Name Fields */}
              <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={fadeUp}>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    First name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        errors.firstName ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 dark:text-neutral-100'
                      }`}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Last name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        errors.lastName ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 dark:text-neutral-100'
                      }`}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={fadeUp}>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
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
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 dark:text-neutral-100'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </motion.div>

              {/* Age Field */}
              <motion.div variants={fadeUp}>
                <label htmlFor="age" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Age
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="13"
                    max="120"
                    autoComplete="off"
                    value={formData.age}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.age ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 dark:text-neutral-100'
                    }`}
                    placeholder="Enter your age"
                  />
                </div>
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div variants={fadeUp}>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Password
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
                      errors.password ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 dark:text-neutral-100'
                    }`}
                    placeholder="Create a strong password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-600">{passwordStrength.text}</span>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={fadeUp}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Confirm password
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
                      errors.confirmPassword ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 dark:text-neutral-100'
                    }`}
                    placeholder="Confirm your password"
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
              </motion.div>

              {/* Terms Agreement */}
              <motion.div variants={fadeUp}>
                <div className="flex items-start space-x-3">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded ${
                      errors.agreeToTerms ? 'border-red-300' : ''
                    }`}
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-neutral-700 dark:text-neutral-300">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create account
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <motion.div className="mt-6" variants={fadeUp} transition={{ duration: 0.5, delay: 0.08 }}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">Or continue with</span>
                </div>
              </div>
            </motion.div>

            {/* Social Registration */}
            <motion.div
              className="mt-6 grid grid-cols-2 gap-3"
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.12 }}
            >
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-lg shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-lg shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Sign In Link */}
          <motion.div className="text-center" variants={fadeUp} transition={{ duration: 0.5, delay: 0.18 }}>
            <p className="text-neutral-600 dark:text-neutral-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
