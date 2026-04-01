import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'
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

export interface HouseholdMember {
  userId: string
  firstName: string
  lastName: string
  avatarUrl?: string | null
  role: 'admin' | 'member'
  joinedAt: string
}

export interface Household {
  id: string
  name: string
  inviteCode: string
  createdBy: string
  createdAt: string
  role: 'admin' | 'member'
  members: HouseholdMember[]
}

interface AuthContextType {
  user: User | null
  preferences: UserPreferences | null
  household: Household | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData?: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  updatePreferences: (prefs: Partial<UserPreferences>) => void
  refreshHousehold: () => void
}

const TOKEN_KEY = 'nourish_neural_token'
const REFRESH_KEY = 'nourish_neural_refresh_token'
const USER_KEY = 'pantrypal_user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Try to refresh the access token using the stored refresh token.
 * Returns the new access token or null if refresh failed.
 */
async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) return null

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!response.ok) return null

    const data = await response.json()
    if (data.token) {
      // Persist the new tokens
      localStorage.setItem(TOKEN_KEY, data.token)
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_KEY, data.refresh_token)
      }
      return data.token
    }
    return null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => {
    // Hydrate user from localStorage immediately so the UI doesn't flash
    try {
      const cached = localStorage.getItem(USER_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshAttempted = useRef(false)

  const queryClient = useQueryClient()

  // Set auth token in API service
  useEffect(() => {
    if (token) {
      setAuthToken(token)
    } else {
      removeAuthToken()
    }
  }, [token])

  // Clear all auth state
  const clearAuth = useCallback(() => {
    setToken(null)
    setUser(null)
    setPreferences(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    removeAuthToken()
    queryClient.clear()
  }, [queryClient])

  // Fetch user data when token exists
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
      enabled: !!token,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 min — no need to re-fetch on every render
      cacheTime: 10 * 60 * 1000,
      onSuccess: (data: any) => {
        refreshAttempted.current = false
        setUser(data)
        localStorage.setItem(USER_KEY, JSON.stringify(data))
      },
      onError: async () => {
        // Token might be expired — try refreshing once
        if (!refreshAttempted.current) {
          refreshAttempted.current = true
          const newToken = await tryRefreshToken()
          if (newToken) {
            setToken(newToken)
            setAuthToken(newToken)
            // react-query will re-run the query because `token` changed
            return
          }
        }
        // Refresh also failed — truly logged out
        clearAuth()
      }
    }
  )

  // Fetch user's household when user is loaded
  const { data: householdData } = useQuery(
    ['household', user?.id],
    () => apiService.get<{ household: Household | null }>('/api/households/mine'),
    {
      enabled: !!user?.id,
      retry: false,
      staleTime: 30000,
    }
  )

  const household = householdData?.household || null

  const refreshHousehold = () => {
    queryClient.invalidateQueries(['household'])
  }

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

  const login = (newToken: string, userData?: User) => {
    refreshAttempted.current = false
    setToken(newToken)
    localStorage.setItem(TOKEN_KEY, newToken)
    if (userData) {
      setUser(userData)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
    }
    queryClient.invalidateQueries(['preferences'])
  }

  const logout = async () => {
    try {
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
      clearAuth()
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
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
    household,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
    updatePreferences,
    refreshHousehold
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

export function useRole(requiredRole: string | string[]) {
  const { user } = useAuth()
  if (!user) return false
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(user.role)
}

export function usePermission(permission: string) {
  const { user } = useAuth()
  if (!user) return false
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
