import api from './api.service'
import { storageService } from './storage.service'

export const authService = {
  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/signin', credentials)
      const { token, user } = response.data

      // Store auth data
      storageService.setToken(token)
      storageService.setUser(user)

      return { token, user }
    } catch (error) {
      throw error
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await api.post('/auth/signup', userData)
      const { token, user } = response.data

      // Store auth data
      storageService.setToken(token)
      storageService.setUser(user)

      return { token, user }
    } catch (error) {
      throw error
    }
  },

  // Logout user
  logout() {
    storageService.clearAuth()
  },

  // Get current user
  getCurrentUser() {
    const user = storageService.getUser()
    const isTokenValid = storageService.isTokenValid()

    if (!user || !isTokenValid) {
      this.logout()
      return null
    }

    return user
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getCurrentUser()
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword: password
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Refresh user data
  async refreshUser() {
    try {
      const response = await api.get('/auth/me')
      const user = response.data.user

      storageService.setUser(user)
      return user
    } catch (error) {
      this.logout()
      throw error
    }
  }
}