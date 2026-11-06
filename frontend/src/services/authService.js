import { apiRequest } from './api'

const authService = {
  // Authentication
  login: async (credentials) => {
    return await apiRequest.post('/login', credentials)
  },

  register: async (userData) => {
    return await apiRequest.post('/register', userData)
  },

  verifyRegisterOtp: async (data) => {
    return await apiRequest.post('/verify-register-otp', data)
  },

  resendRegisterOtp: async (data) => {
    return await apiRequest.post('/resend-register-otp', data)
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

  forgotPassword: async (identifier) => {
    const payload = typeof identifier === 'object' ? identifier : { phone: identifier }
    return await apiRequest.post('/forgot-password', payload)
  },

  resetPassword: async (resetData) => {
    return await apiRequest.post('/reset-password', resetData)
  },

  refreshToken: async () => {
    return await apiRequest.post('/auth/refresh')
  },
}

export default authService
