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
    
    // Extract product data from the product object
    const wishlistItem = {
      product_id: itemData.id || itemData.product_id,
      product_name: itemData.name || itemData.product_name || `Product ${itemData.id || itemData.product_id}`,
      price: parseFloat(itemData.price) || 0,
      image_url: itemData.image_url || itemData.main_image_url || null,
      currency: itemData.currency || 'USD',
      // Complete product details for database storage
      sku: itemData.sku || null,
      weight: itemData.weight || null,
      dimensions: itemData.dimensions || null,
      category: itemData.category?.name || itemData.category || null,
      brand: itemData.brand?.name || itemData.brand || null,
      description: itemData.description || null,
      short_description: itemData.short_description || null,
      status: itemData.status || 'active',
      featured: itemData.featured || false,
    }
    
    console.log('Wishlist item data to send:', wishlistItem)
    
    try {
      // Try to add to database first
      console.log('Attempting to add to database via API...')
      const response = await apiRequest.post('/wishlist', wishlistItem)
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
