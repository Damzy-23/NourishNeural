import { useState, useEffect, createContext, useContext } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { setAuthToken, removeAuthToken, apiService } from '../services/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  age?: number
  avatarUrl?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  isVerified: boolean
  role: string
  createdAt: string
  updatedAt: string
}

interface UserPreferences {
  id: string
  userId: string
  dietaryRestrictions: string[]
  budgetLimit: number
  householdSize: number
  preferredStores: string[]
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  preferences: UserPreferences | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData?: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('pantrypal_token'))
  // Initialize user as null - we'll fetch fresh data from server
  const [user, setUser] = useState<User | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const queryClient = useQueryClient()

  // Set auth token in API service
  useEffect(() => {
    if (token) {
      setAuthToken(token)
    } else {
      removeAuthToken()
    }
  }, [token])

  // Fetch user data when token exists - always fetch fresh data from server
  const { isLoading: userLoading } = useQuery(
    ['user', token],
    async () => {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      return response.json()
    },
    {
      enabled: !!token, // Always fetch when token exists to get fresh data
      retry: false,
      staleTime: 0, // Always fetch fresh data
      onSuccess: (data: any) => {
        // Update user data from API
        setUser(data)
        // Also update localStorage for offline access
        localStorage.setItem('pantrypal_user', JSON.stringify(data))
      },
      onError: () => {
        // Token is invalid, clear it
        setToken(null)
        localStorage.removeItem('pantrypal_token')
        localStorage.removeItem('pantrypal_user')
        setUser(null)
        setPreferences(null)
      }
    }
  )

  // Fetch user preferences when user is loaded
  const { isLoading: prefsLoading } = useQuery(
    ['preferences', user?.id],
    () => apiService.get('/api/users/preferences'),
    {
      enabled: !!user?.id,
      retry: false,
      onSuccess: (data: any) => {
        setPreferences(data.preferences || data)
      }
    }
  )

  // Update loading state
  useEffect(() => {
    if (token) {
      setIsLoading(userLoading || prefsLoading)
    } else {
      setIsLoading(false)
    }
  }, [token, userLoading, prefsLoading])

  // Debug: Log auth state
  useEffect(() => {
    console.log('Auth Context - Token:', token)
    console.log('Auth Context - User:', user)
    console.log('Auth Context - Is Authenticated:', !!token && !!user)
    console.log('Auth Context - LocalStorage User:', localStorage.getItem('pantrypal_user'))
  }, [token, user])

  const login = (newToken: string, userData?: User) => {
    setToken(newToken)
    localStorage.setItem('pantrypal_token', newToken)
    // If user data is provided, set it immediately to avoid race condition
    if (userData) {
      setUser(userData)
      localStorage.setItem('pantrypal_user', JSON.stringify(userData))
    }
    // Clear any cached data except user
    queryClient.invalidateQueries(['preferences'])
  }

  const logout = async () => {
    try {
      // Call logout API if token exists
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local data regardless of API call result
      setToken(null)
      setUser(null)
      setPreferences(null)
      localStorage.removeItem('pantrypal_token')
      localStorage.removeItem('pantrypal_user')
      removeAuthToken()
      // Clear all cached data
      queryClient.clear()
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      // Update localStorage with new user data
      localStorage.setItem('pantrypal_user', JSON.stringify(updatedUser))
    }
  }

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    if (preferences) {
      setPreferences({ ...preferences, ...prefs })
    }
  }

  const value: AuthContextType = {
    user,
    preferences,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
    updatePreferences
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for checking if user has specific role
export function useRole(requiredRole: string | string[]) {
  const { user } = useAuth()
  
  if (!user) return false
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(user.role)
}

// Hook for checking if user has permission
export function usePermission(permission: string) {
  const { user } = useAuth()
  
  if (!user) return false
  
  // Simple permission system - can be expanded
  switch (permission) {
    case 'admin':
      return user.role === 'admin'
    case 'moderator':
      return ['admin', 'moderator'].includes(user.role)
    case 'user':
      return true
    default:
      return false
  }
} 