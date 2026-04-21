import { apiRequest } from './api'

// REAL WISHLIST SERVICE - Complete Database Integration (No localStorage)
const wishlistService = {
  getWishlist: async () => {
    try {
      // Get wishlist from database only
      const response = await apiRequest.get('/wishlist')
      return response
    } catch (error) {
      console.error('Failed to fetch wishlist from database:', error)
      return { 
        data: [],
        message: 'Failed to load wishlist from database'
      }
    }
  },

  addToWishlist: async (itemData) => {
    console.log('=== REAL WISHLIST SERVICE - addToWishlist ===')
    console.log('Item data received:', itemData)
    
    try {
      // Try to add to database first
      console.log('Attempting to add to database via API...')
      const response = await apiRequest.post('/wishlist', itemData)
      console.log('✅ SUCCESS: Product added to database!', response.data)
      return response
    } catch (error) {
      console.error('❌ API FAILED: Could not add to database', error.message)
      throw error
    }
  },

  removeFromWishlist: async (itemId) => {
    console.log('=== REAL WISHLIST - Remove Item ===')
    console.log('Removing item:', itemId)
    
    try {
      // Try to remove from database first
      const response = await apiRequest.delete(`/wishlist/${itemId}`)
      console.log('✅ SUCCESS: Item removed from database')
      return response
    } catch (error) {
      console.log('❌ Database failed')
      throw error
    }
  },

  clearWishlist: async () => {
    console.log('=== REAL WISHLIST - Clear Wishlist ===')
    
    try {
      // Clear from database only
      const response = await apiRequest.delete('/wishlist')
      console.log('✅ SUCCESS: Wishlist cleared from database')
      return response
    } catch (error) {
      console.error('❌ Database failed:', error)
      throw error
    }
  },
}

export default wishlistService
