import { apiRequest } from './api'

const authService = {
  // Authentication
  login: async (credentials) => {
    return await apiRequest.post('/login', credentials)
  },

  register: async (userData) => {
    return await apiRequest.post('/register', userData)
  },

  logout: async () => {
    return await apiRequest.post('/logout')
  },

  getCurrentUser: async () => {
    return await apiRequest.get('/user')
  },

  updateProfile: async (userData) => {
    return await apiRequest.put('/auth/profile', userData)
  },

  changePassword: async (passwordData) => {
    return await apiRequest.post('/auth/change-password', passwordData)
  },

  forgotPassword: async (email) => {
    return await apiRequest.post('/auth/forgot-password', { email })
  },

  resetPassword: async (resetData) => {
    return await apiRequest.post('/auth/reset-password', resetData)
  },

  refreshToken: async () => {
    return await apiRequest.post('/auth/refresh')
  },
}

export default authService
