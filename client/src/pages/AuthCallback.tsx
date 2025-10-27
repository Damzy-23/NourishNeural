import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      try {
        // Store the token and update auth state
        login(token)
        setStatus('success')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/app/dashboard')
        }, 1500)
      } catch (err) {
        setStatus('error')
        setError('Failed to authenticate. Please try again.')
      }
    } else {
      setStatus('error')
      setError('No authentication token received.')
    }
  }, [searchParams, login, navigate])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            Authenticating...
          </h2>
          <p className="text-neutral-600">
            Please wait while we complete your sign-in.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-neutral-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
          Welcome to PantryPal!
        </h2>
        <p className="text-neutral-600">
          You've been successfully signed in. Redirecting to your dashboard...
        </p>
      </div>
    </div>
  )
} 