import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import toast from 'react-hot-toast'

// Determine API base URL
const getApiBaseUrl = () => {
  // Check for environment variable first
  if ((import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL
  }
  // In production, use relative URL for Vercel serverless functions
  if ((import.meta as any).env?.PROD) {
    return ''  // Will use relative paths like /api/...
  }
  // Default to localhost in development
  return 'http://localhost:5000'
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 120000, // Increased to 120s for local LLM cold starts
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nourish_neural_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('nourish_neural_token')
          window.location.href = '/'
          break
        case 403:
          toast.error('You do not have permission to perform this action')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 422:
          // Validation error
          if (data && typeof data === 'object' && 'message' in data) {
            toast.error(data.message as string)
          } else {
            toast.error('Validation failed')
          }
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
          toast.error('Server error. Please try again later.')
          break
        default:
          toast.error('An unexpected error occurred')
      }
    } else if (error.request) {
      // Network error - only show once per session in production
      const lastNetworkError = sessionStorage.getItem('lastNetworkError')
      const now = Date.now()
      if (!lastNetworkError || now - parseInt(lastNetworkError) > 10000) {
        sessionStorage.setItem('lastNetworkError', now.toString())
        if ((import.meta as any).env?.PROD && !getApiBaseUrl()) {
          toast.error('Backend not configured. Some features are unavailable.')
        } else {
          toast.error('Network error. Please check your connection.')
        }
      }
    } else {
      // Other error
      toast.error('An error occurred')
    }

    return Promise.reject(error)
  }
)

  // Add auth token management methods to the api instance
  ; (api as any).setAuthToken = (token: string) => {
    localStorage.setItem('nourish_neural_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  ; (api as any).removeAuthToken = () => {
    localStorage.removeItem('nourish_neural_token')
    delete api.defaults.headers.common['Authorization']
  }

// API methods
export const apiService = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<T> => {
    const response = await api.get(url, { params })
    return response.data
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: { timeout?: number }): Promise<T> => {
    const response = await api.post(url, data, config)
    return response.data
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.put(url, data)
    return response.data
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.patch(url, data)
    return response.data
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await api.delete(url)
    return response.data
  },

  // File upload
  upload: async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  },
}

// Auth token management (standalone functions for backward compatibility)
export const setAuthToken = (token: string) => {
  localStorage.setItem('nourish_neural_token', token)
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const removeAuthToken = () => {
  localStorage.removeItem('nourish_neural_token')
  delete api.defaults.headers.common['Authorization']
}

// Export the axios instance and service
export { api }
export default apiService 