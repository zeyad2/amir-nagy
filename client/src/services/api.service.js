import axios from 'axios'
import { storageService } from './storage.service'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = storageService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response, config } = error

    // Handle token expiration
    if (response?.status === 401) {
      storageService.clearAuth()

      // Don't redirect on login/register requests
      if (!config.url.includes('/auth/')) {
        toast.error('Session expired. Please login again.')
        window.location.href = '/login'
      }
    }

    // Handle network errors
    if (!response) {
      toast.error('Network error. Please check your connection.')
    }

    // Handle server errors
    if (response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }

    // Handle validation errors
    if (response?.status === 400) {
      const message = response.data?.message || 'Invalid request'
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api