import { apiRequest } from './api'

const productService = {
  // Products
  getProducts: async (params = {}) => {
    // Clean up null and undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== null && value !== undefined && value !== ''
      )
    )
    
    const queryParams = new URLSearchParams(cleanParams).toString()
    return await apiRequest.get(`/products${queryParams ? `?${queryParams}` : ''}`)
  },

  getProduct: async (id) => {
    return await apiRequest.get(`/products/${id}`)
  },

  searchProducts: async (query) => {
    return await apiRequest.get(`/products/search?q=${encodeURIComponent(query)}`)
  },

  getFeaturedProducts: async (params = {}) => {
    // Clean up null and undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => 
        value !== null && value !== undefined && value !== ''
      )
    )
    
    const queryParams = new URLSearchParams(cleanParams).toString()
    return await apiRequest.get(`/products/featured${queryParams ? `?${queryParams}` : ''}`)
  },

  getRelatedProducts: async (id) => {
    console.log('Fetching related products for product ID:', id)
    try {
      const response = await apiRequest.get(`/products/${id}/related`)
      console.log('Related products API response:', response)
      return response
    } catch (error) {
      console.log('Related products API failed, using mock data')
      // Fallback to mock data if API fails
      const mockRelatedProducts = [
        {
          id: 1,
          name: 'Laptop Pro',
          price: '999.99',
          image_url: '/images/products/laptop1.jpg',
          main_image_url: '/images/products/laptop1.jpg',
          rating: 4.5,
          reviews_count: 23,
          compare_at_price: '1299.99'
        },
        {
          id: 2,
          name: 'Wireless Mouse',
          price: '29.99',
          image_url: '/images/products/mouse1.jpg',
          main_image_url: '/images/products/mouse1.jpg',
          rating: 4.2,
          reviews_count: 15,
          compare_at_price: null
        },
        {
          id: 3,
          name: 'USB Keyboard',
          price: '49.99',
          image_url: '/images/products/keyboard1.jpg',
          main_image_url: '/images/products/keyboard1.jpg',
          rating: 4.7,
          reviews_count: 31,
          compare_at_price: '69.99'
        }
      ]
      return { data: mockRelatedProducts }
    }
  },

  getProductReviews: async (id, params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return await apiRequest.get(`/products/${id}/reviews${queryParams ? `?${queryParams}` : ''}`)
  },

  // Categories
  getCategories: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return await apiRequest.get(`/categories${queryParams ? `?${queryParams}` : ''}`)
  },

  getCategory: async (id) => {
    return await apiRequest.get(`/categories/${id}`)
  },

  getCategoryTree: async () => {
    return await apiRequest.get('/categories/tree')
  },

  getCategoryProducts: async (id, params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return await apiRequest.get(`/categories/${id}/products${queryParams ? `?${queryParams}` : ''}`)
  },
}

export default productService
