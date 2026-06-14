import api from './api'

const shippingService = {
  // Get all active shipping companies for checkout
  getActiveShippingCompanies: async () => {
    try {
      const response = await api.get('/shipping-companies/active')
      return response.data
    } catch (error) {
      console.error('Error fetching shipping companies:', error)
      throw error
    }
  },

  // Get all shipping companies (admin)
  getAllShippingCompanies: async () => {
    try {
      const response = await api.get('/admin/shipping-companies')
      return response.data
    } catch (error) {
      console.error('Error fetching all shipping companies:', error)
      throw error
    }
  },

  // Create shipping company (admin)
  createShippingCompany: async (companyData) => {
    try {
      const response = await api.post('/admin/shipping-companies', companyData)
      return response.data
    } catch (error) {
      console.error('Error creating shipping company:', error)
      throw error
    }
  },

  // Update shipping company (admin)
  updateShippingCompany: async (id, companyData) => {
    try {
      const response = await api.put(`/admin/shipping-companies/${id}`, companyData)
      return response.data
    } catch (error) {
      console.error('Error updating shipping company:', error)
      throw error
    }
  },

  // Delete shipping company (admin)
  deleteShippingCompany: async (id) => {
    try {
      const response = await api.delete(`/admin/shipping-companies/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting shipping company:', error)
      throw error
    }
  }
}

export default shippingService
