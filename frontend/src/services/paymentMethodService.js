import api from './api'

const paymentMethodService = {
  // Get all active payment methods for checkout
  getActivePaymentMethods: async () => {
    try {
      const response = await api.get('/payment-methods/active')
      return response.data
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      throw error
    }
  },

  // Get all payment methods (admin)
  getAllPaymentMethods: async () => {
    try {
      const response = await api.get('/admin/payment-methods')
      return response.data
    } catch (error) {
      console.error('Error fetching all payment methods:', error)
      throw error
    }
  },

  // Create payment method (admin)
  createPaymentMethod: async (methodData) => {
    try {
      const response = await api.post('/admin/payment-methods', methodData)
      return response.data
    } catch (error) {
      console.error('Error creating payment method:', error)
      throw error
    }
  },

  // Update payment method (admin)
  updatePaymentMethod: async (id, methodData) => {
    try {
      const response = await api.put(`/admin/payment-methods/${id}`, methodData)
      return response.data
    } catch (error) {
      console.error('Error updating payment method:', error)
      throw error
    }
  },

  // Delete payment method (admin)
  deletePaymentMethod: async (id) => {
    try {
      const response = await api.delete(`/admin/payment-methods/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting payment method:', error)
      throw error
    }
  }
}

export default paymentMethodService
