const TOKEN_KEY = 'sat_platform_token'
const USER_KEY = 'sat_platform_user'

export const storageService = {
  // Token management
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  },

  setToken(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch (error) {
      console.error('Error setting token:', error)
    }
  },

  removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch (error) {
      console.error('Error removing token:', error)
    }
  },

  // User data management
  getUser() {
    try {
      const userString = localStorage.getItem(USER_KEY)
      return userString ? JSON.parse(userString) : null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  },

  setUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Error setting user:', error)
    }
  },

  removeUser() {
    try {
      localStorage.removeItem(USER_KEY)
    } catch (error) {
      console.error('Error removing user:', error)
    }
  },

  // Clear all auth data
  clearAuth() {
    this.removeToken()
    this.removeUser()
  },

  // Check if token exists and is not expired
  isTokenValid() {
    const token = this.getToken()
    if (!token) return false

    try {
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000

      // Check if token is expired (with 5 minute buffer)
      return payload.exp > currentTime + 300
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }
}