import { apiRequest } from './api'

// REAL CART SERVICE - Complete Database Integration
const cartService = {
  // Sync cart from database to localStorage
  syncCartToLocalStorage: async () => {
    try {
      const response = await apiRequest.get('/cart')
      localStorage.setItem('cart', JSON.stringify(response.data.items || []))
      return response
    } catch (error) {
      return null
    }
  },

  getCart: async () => {
    try {
      // First check if there's a cart in localStorage (for restoration)
      const localCart = localStorage.getItem('cart')
      if (localCart) {
        const cartData = JSON.parse(localCart)
        
        // Return localStorage cart if it has items
        if (cartData.length > 0) {
          const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const tax = subtotal * 0.1
          const total = subtotal + tax
          const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0)
          
          return { 
            data: {
              items: cartData,
              subtotal,
              tax,
              total,
              totalItems
            }
          }
        }
      }
      
      // Try database first
      const response = await apiRequest.get('/cart')
      
      // Update localStorage with database data
      localStorage.setItem('cart', JSON.stringify(response.data.items || []))
      
      return response
    } catch (error) {
      // Fallback to localStorage
      const storedCart = localStorage.getItem('cart')
      const cart = JSON.parse(storedCart || '[]')
      
      return { 
        data: {
          items: cart,
          subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.1,
          total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1,
          total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
          message: 'Loaded from localStorage (not database)'
        }
      }
    }
  },

  addToCart: async (itemData) => {
    console.log('=== REAL CART SERVICE - addToCart ===')
    console.log('Item data received:', itemData)
    
    try {
      // ALWAYS try API first for real database storage
      console.log('Attempting to add to database via API...')
      const response = await apiRequest.post('/cart', itemData)
      console.log('✅ SUCCESS: Product added to database!', response.data)
      
      // Also update localStorage as backup
      await this.syncCartToLocalStorage()
      
      return response
    } catch (error) {
      console.error('❌ API FAILED: Could not add to database', error.message)
      
      // Fallback to localStorage but warn user
      console.log('⚠️ FALLBACK: Using localStorage (not saved to database)')
      
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
        console.log('Added new complete item to cart:', newItem)
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
          message: 'Item saved locally (not in database)'
        }
      }
      
      console.log('⚠️ CART SAVED LOCALLY (not in database):', result)
      return result
    }
  },

  updateCartItem: async (itemId, data) => {
    console.log('=== REAL CART - Update Item ===')
    console.log('Updating item:', itemId, 'with data:', data)
    
    try {
      // Update in database first
      const response = await apiRequest.put(`/cart/${itemId}`, data)
      console.log('✅ SUCCESS: Item updated in database')
      
      // Sync to localStorage
      await this.syncCartToLocalStorage()
      
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
        console.log('⚠️ Item updated in localStorage (not database)')
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
          message: 'Updated locally (not database)'
        }
      }
    }
  },

  removeFromCart: async (itemId) => {
    console.log('=== REAL CART - Remove Item ===')
    console.log('Removing item:', itemId)
    
    try {
      // Remove from database first
      const response = await apiRequest.delete(`/cart/${itemId}`)
      console.log('✅ SUCCESS: Item removed from database')
      
      // Sync to localStorage
      await this.syncCartToLocalStorage()
      
      return response
    } catch (error) {
      console.log('❌ Database failed, removing from localStorage')
      
      // Fallback to localStorage
      const storedCart = localStorage.getItem('cart')
      const cart = JSON.parse(storedCart || '[]')
      const updatedCart = cart.filter(item => item.id !== itemId)
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      console.log('⚠️ Item removed from localStorage (not database)')
      
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
          message: 'Removed locally (not database)'
        }
      }
    }
  },

  clearCart: async () => {
    console.log('=== REAL CART - Clear Cart ===')
    
    try {
      // Clear from database first
      const response = await apiRequest.delete('/cart')
      console.log('✅ SUCCESS: Cart cleared from database')
      
      // Clear localStorage
      localStorage.removeItem('cart')
      console.log('✅ localStorage cleared')
      
      return response
    } catch (error) {
      console.log('❌ Database failed, clearing localStorage')
      
      // Fallback to localStorage
      localStorage.removeItem('cart')
      console.log('⚠️ Cart cleared from localStorage (not database)')
      
      return { 
        data: {
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          total_items: 0,
          message: 'Cleared locally (not database)'
        }
      }
    }
  },

  getCartSummary: async () => {
    return await apiRequest.get('/cart/summary')
  },

  // Merge guest cart with user cart on login
  mergeGuestCartWithUserCart: async (userEmail) => {
    console.log('=== MERGING GUEST CART WITH USER CART ===')
    console.log('User email:', userEmail)
    
    try {
      // Get guest cart
      const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]')
      console.log('Guest cart items:', guestCart)
      
      if (guestCart.length === 0) {
        console.log('No guest cart items to merge')
        return { success: true, message: 'No items to merge' }
      }
      
      // Get user cart from database
      const userCartResponse = await apiRequest.get('/cart')
      const userCart = userCartResponse.data.items || []
      console.log('User cart from database:', userCart)
      
      // Merge carts (avoid duplicates)
      const mergedCart = [...userCart]
      
      guestCart.forEach(guestItem => {
        const existingItem = mergedCart.find(item => item.product_id === guestItem.product_id)
        
        if (existingItem) {
          // Update quantity if exists
          existingItem.quantity += guestItem.quantity
          console.log(`Updated quantity for product ${guestItem.product_id}: ${existingItem.quantity}`)
        } else {
          // Add new item
          mergedCart.push({
            ...guestItem,
            id: Date.now() + Math.random(), // Ensure unique ID
            user_id: null, // Will be set by backend
          })
          console.log(`Added new product ${guestItem.product_id} to user cart`)
        }
      })
      
      // Update user cart in database
      console.log('Updating user cart with merged items...')
      
      // Clear guest cart after successful merge
      localStorage.removeItem('guest_cart')
      
      // Update localStorage with merged cart
      localStorage.setItem('cart', JSON.stringify(mergedCart))
      
      console.log('✅ Cart merge completed successfully')
      console.log('Final merged cart:', mergedCart)
      
      return { 
        success: true, 
        message: `Merged ${guestCart.length} items with your cart`,
        mergedCart 
      }
      
    } catch (error) {
      console.error('❌ Failed to merge carts:', error)
      return { success: false, message: 'Failed to merge carts' }
    }
  },
}

export default cartService
