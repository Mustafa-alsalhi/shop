import { apiRequest } from './api'

// REAL CART SERVICE - Complete Database Integration (No localStorage)
const cartService = {
  getCart: async () => {
    try {
      // Get cart from database only
      const response = await apiRequest.get('/cart')
      return response
    } catch (error) {
      console.error('Failed to fetch cart from database:', error)
      return { 
        data: {
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          total_items: 0,
          message: 'Failed to load cart from database'
        }
      }
    }
  },

  addToCart: async (itemData) => {
    console.log('=== REAL CART SERVICE - addToCart ===')
    console.log('Item data received:', itemData)
    
    try {
      // Try to add to database first
      console.log('Attempting to add to database via API...')
      const response = await apiRequest.post('/cart', itemData)
      console.log('✅ SUCCESS: Product added to database!', response.data)
      return response
    } catch (error) {
      console.error('❌ API FAILED: Could not add to database', error.message)
      console.log('⚠️ FALLBACK: Using localStorage')
      
      // Fallback to localStorage
      const storedCart = localStorage.getItem('cart')
      const cart = JSON.parse(storedCart || '[]')
      
      // Check if item already exists
      const existingItem = cart.find(item => item.product_id === itemData.product_id)
      
      if (existingItem) {
        existingItem.quantity += itemData.quantity
        console.log('Updated existing item quantity:', existingItem.quantity)
      } else {
        // Create complete cart item with ALL product data
        const newItem = {
          id: Date.now(),
          product_id: itemData.product_id,
          product_name: itemData.product_name || `Product ${itemData.product_id}`,
          price: parseFloat(itemData.price) || 0,
          quantity: itemData.quantity,
          image_url: itemData.image_url || itemData.main_image_url || null,
          variant_id: itemData.variant_id || null,
          variant_attributes: null,
          created_at: new Date().toISOString(),
          // Additional product details
          sku: itemData.sku || null,
          weight: itemData.weight || null,
          dimensions: itemData.dimensions || null,
          category: itemData.category || null,
          brand: itemData.brand || null,
        }
        cart.push(newItem)
        console.log('Added new item to cart:', newItem)
      }
      
      localStorage.setItem('cart', JSON.stringify(cart))
      
      // Calculate totals
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.1
      const total = subtotal + tax
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      
      const result = { 
        data: {
          items: cart,
          subtotal,
          tax,
          total,
          total_items: totalItems,
          message: 'Item saved locally (database failed)'
        }
      }
      
      console.log('⚠️ CART SAVED LOCALLY (database failed):', result)
      return result
    }
  },

  updateCartItem: async (itemId, data) => {
    console.log('=== REAL CART - Update Item ===')
    console.log('Updating item:', itemId, 'with data:', data)
    
    try {
      // Try to update in database first
      const response = await apiRequest.put(`/cart/${itemId}`, data)
      console.log('✅ SUCCESS: Item updated in database')
      return response
    } catch (error) {
      console.log('❌ Database failed, updating localStorage')
      
      // Fallback to localStorage
      const storedCart = localStorage.getItem('cart')
      const cart = JSON.parse(storedCart || '[]')
      
      const itemIndex = cart.findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        cart[itemIndex].quantity = data.quantity
        localStorage.setItem('cart', JSON.stringify(cart))
        console.log('⚠️ Item updated in localStorage (database failed)')
      }
      
      // Calculate totals
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.1
      const total = subtotal + tax
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      
      return { 
        data: {
          items: cart,
          subtotal,
          tax,
          total,
          total_items: totalItems,
          message: 'Updated locally (database failed)'
        }
      }
    }
  },

  removeFromCart: async (itemId) => {
    console.log('=== REAL CART - Remove Item ===')
    console.log('Removing item:', itemId)
    
    try {
      // Try to remove from database first
      const response = await apiRequest.delete(`/cart/${itemId}`)
      console.log('✅ SUCCESS: Item removed from database')
      return response
    } catch (error) {
      console.log('❌ Database failed, removing from localStorage')
      
      // Fallback to localStorage
      const storedCart = localStorage.getItem('cart')
      const cart = JSON.parse(storedCart || '[]')
      const updatedCart = cart.filter(item => item.id !== itemId)
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      console.log('⚠️ Item removed from localStorage (database failed)')
      
      // Calculate totals
      const subtotal = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.1
      const total = subtotal + tax
      const totalItems = updatedCart.reduce((sum, item) => sum + item.quantity, 0)
      
      return { 
        data: {
          items: updatedCart,
          subtotal,
          tax,
          total,
          total_items: totalItems,
          message: 'Removed locally (database failed)'
        }
      }
    }
  },

  clearCart: async () => {
    console.log('=== REAL CART - Clear Cart ===')
    
    try {
      // Clear from database only
      const response = await apiRequest.delete('/cart')
      console.log('✅ SUCCESS: Cart cleared from database')
      return response
    } catch (error) {
      console.error('❌ Database failed:', error)
      throw error
    }
  },

  getCartSummary: async () => {
    return await apiRequest.get('/cart/summary')
  },
}

export default cartService
