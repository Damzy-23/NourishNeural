import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeUp, scaleIn, staggerContainer } from '../utils/motion'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/app/dashboard'

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
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
      // Use Supabase directly for login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) {
        console.error('Supabase login error:', authError)
        throw new Error(authError.message || 'Login failed')
      }

      if (!authData.session || !authData.user) {
        throw new Error('No session returned')
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.warn('Could not fetch profile:', profileError)
      }

      // Construct user object
      const user = {
        id: authData.user.id,
        email: authData.user.email,
        firstName: profile?.first_name || authData.user.user_metadata?.first_name || '',
        lastName: profile?.last_name || authData.user.user_metadata?.last_name || '',
        age: profile?.age || authData.user.user_metadata?.age,
        avatarUrl: profile?.avatar_url || null,
        isVerified: authData.user.email_confirmed_at != null,
        role: authData.user.role || 'authenticated',
        createdAt: authData.user.created_at,
        updatedAt: profile?.updated_at || authData.user.updated_at
      }

      // Store token and user data
      localStorage.setItem('pantrypal_token', authData.session.access_token)
      localStorage.setItem('pantrypal_user', JSON.stringify(user))

      // Login the user
      login(authData.session.access_token)

      toast.success('Welcome back to Nourish Neural!')
      navigate(from, { replace: true })
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error('Login failed. Please check your credentials.')
      setErrors({ general: error.message || 'Invalid email or password' })
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

  return (
    <>
      <Helmet>
        <title>Login - Nourish Neural</title>
        <meta name="description" content="Sign in to your Nourish Neural account" />
      </Helmet>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
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
          className="relative max-w-5xl w-full grid gap-8 lg:grid-cols-[1fr_1fr] items-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="hidden lg:block rounded-[32px] border border-white/40 dark:border-neutral-700/60 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl shadow-2xl shadow-primary-500/20 p-10 space-y-6"
            variants={scaleIn}
            transition={{ duration: 0.65 }}
          >
            <motion.div
              className="inline-flex items-center space-x-3 rounded-full border border-primary-200/70 dark:border-primary-700/70 bg-white/80 dark:bg-neutral-800/80 px-4 py-2 text-sm font-semibold text-primary-700 dark:text-primary-300 shadow-soft"
              variants={fadeUp}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 dark:from-primary-400/30 dark:to-accent-400/30">
                <img src="/favicon.svg" alt="Nourish Neural" className="h-4 w-4" />
              </span>
              <span>Neural pantry intelligence, always learning</span>
            </motion.div>
            <motion.h2
              className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              Welcome back to <span className="gradient-text">Nourish Neural</span>.
            </motion.h2>
            <motion.p className="text-neutral-600 dark:text-neutral-300 text-lg leading-relaxed" variants={fadeUp}>
              Sign in to orchestrate grocery planning, predictive pantry insights, and sustainable meal rituals—all
              within a single neural dashboard.
            </motion.p>
            <motion.div
              className="grid grid-cols-2 gap-4 pt-4"
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              {[
                { label: 'Active automations', value: '24' },
                { label: 'Weekly savings', value: '£34.50' },
                { label: 'Waste avoided', value: '2.8kg' },
                { label: 'Nutrition insights', value: '7' },
              ].map((metric) => (
                <motion.div
                  key={metric.label}
                  className="rounded-2xl border border-primary-100/60 dark:border-primary-700/60 bg-white/80 dark:bg-neutral-800/80 px-5 py-4 text-left shadow-soft"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-500 dark:text-primary-400">{metric.label}</p>
                  <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">{metric.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="max-w-md w-full mx-auto lg:mx-0 space-y-8 rounded-[28px] border border-white/40 dark:border-neutral-700/60 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl shadow-xl shadow-primary-500/10 p-10"
            variants={scaleIn}
            transition={{ duration: 0.65, delay: 0.1 }}
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
                Welcome back
              </motion.h2>
              <motion.p className="text-neutral-600 dark:text-neutral-400 text-base" variants={fadeUp}>
                Sign in to resume your culinary intelligence journey.
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
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
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
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 dark:text-neutral-100'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-600 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </Link>
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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </motion.form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Social Login */}
            <motion.div
              className="mt-6 grid grid-cols-2 gap-3"
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm bg-white dark:bg-neutral-700 text-sm font-medium text-neutral-500 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
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
                className="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm bg-white dark:bg-neutral-700 text-sm font-medium text-neutral-500 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div className="text-center" variants={fadeUp} transition={{ duration: 0.5, delay: 0.12 }}>
              <p className="text-neutral-600 dark:text-neutral-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
