import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import cartService from '../../services/cartService'

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cart'
      )
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData, { rejectWithValue }) => {
    console.log('=== addToCart Redux Thunk ===')
    console.log('Item data received:', itemData)
    try {
      const response = await cartService.addToCart(itemData)
      console.log('Cart service response:', response)
      console.log('Response data:', response.data)
      return response.data
    } catch (error) {
      console.error('addToCart error in Redux:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add item to cart'
      )
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(id, { quantity })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update cart item'
      )
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      await cartService.removeFromCart(itemId)
      return itemId
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove item from cart'
      )
    }
  }
)

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart()
      return true
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear cart'
      )
    }
  }
)

export const getCartSummary = createAsyncThunk(
  'cart/getCartSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCartSummary()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get cart summary'
      )
    }
  }
)

// Initial state
const initialState = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  totalItems: 0,
  isLoading: false,
  error: null,
  isOpen: false,
}

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    openCart: (state) => {
      state.isOpen = true
    },
    closeCart: (state) => {
      state.isOpen = false
    },
    clearError: (state) => {
      state.error = null
    },
    // Optimistic updates for better UX
    optimisticUpdateItem: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find(item => item.id === id)
      if (item) {
        item.quantity = quantity
        item.total = item.price * quantity
      }
    },
    optimisticRemoveItem: (state, action) => {
      const itemId = action.payload
      state.items = state.items.filter(item => item.id !== itemId)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items || []
        state.subtotal = action.payload.subtotal || 0
        state.tax = action.payload.tax || 0
        state.total = action.payload.total || 0
        state.totalItems = action.payload.total_items || 0
        state.error = null
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        console.log('addToCart pending in reducer')
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        console.log('addToCart fulfilled in reducer. Action:', action)
        console.log('Action payload:', action.payload)
        console.log('Action payload structure:', Object.keys(action.payload))
        
        state.isLoading = false
        
        // Handle different response structures
        if (action.payload.items && Array.isArray(action.payload.items)) {
          // API response with items array
          state.items = action.payload.items
          state.subtotal = action.payload.subtotal || 0
          state.tax = action.payload.tax || 0
          state.total = action.payload.total || 0
          state.totalItems = action.payload.total_items || 0
        } else if (action.payload.data && action.payload.data.items) {
          // Nested data structure
          state.items = action.payload.data.items
          state.subtotal = action.payload.data.subtotal || 0
          state.tax = action.payload.data.tax || 0
          state.total = action.payload.data.total || 0
          state.totalItems = action.payload.data.total_items || 0
        } else {
          // Single item response - create cart with this item
          const newItem = {
            id: action.payload.id || Date.now(),
            product_id: action.payload.product_id,
            product_name: action.payload.product_name || `Product ${action.payload.product_id}`,
            price: action.payload.price || 0,
            quantity: action.payload.quantity || 1,
            image_url: action.payload.image_url || null,
            created_at: action.payload.created_at || new Date().toISOString()
          }
          
          // Check if item already exists
          const existingItem = state.items.find(item => item.product_id === newItem.product_id)
          if (existingItem) {
            existingItem.quantity += newItem.quantity
          } else {
            state.items.push(newItem)
          }
          
          // Calculate totals
          state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          state.tax = state.subtotal * 0.1
          state.total = state.subtotal + state.tax
          state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
        }
        
        state.error = null
        console.log('Final cart state:', state)
        console.log('Cart items after update:', state.items)
      })
      .addCase(addToCart.rejected, (state, action) => {
        console.log('addToCart rejected in reducer. Error:', action)
        state.isLoading = false
        state.error = action.payload
      })
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.error = null
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.subtotal = action.payload.subtotal || 0
        state.tax = action.payload.tax || 0
        state.total = action.payload.total || 0
        state.totalItems = action.payload.total_items || 0
        state.error = null
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const itemId = action.payload
        state.items = state.items.filter(item => item.id !== itemId)
        // Recalculate totals
        state.subtotal = state.items.reduce((sum, item) => sum + item.total, 0)
        state.tax = state.subtotal * 0.1 // 10% tax
        state.total = state.subtotal + state.tax
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
        state.error = null
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload
      })
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false
        state.items = []
        state.subtotal = 0
        state.tax = 0
        state.total = 0
        state.totalItems = 0
        state.error = null
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Get cart summary
      .addCase(getCartSummary.fulfilled, (state, action) => {
        state.subtotal = action.payload.subtotal || 0
        state.tax = action.payload.tax || 0
        state.total = action.payload.total || 0
        state.totalItems = action.payload.total_items || 0
      })
  },
})

export const {
  toggleCart,
  openCart,
  closeCart,
  clearError,
  optimisticUpdateItem,
  optimisticRemoveItem,
} = cartSlice.actions

// Selectors
export const selectCartItems = (state) => state.cart?.items || []
export const selectCartTotal = (state) => state.cart?.total || 0
export const selectCartTotalItems = (state) => state.cart?.totalItems || state.cart?.items?.length || 0
export const selectCartIsLoading = (state) => state.cart?.isLoading || false
export const selectCartIsOpen = (state) => state.cart.isOpen
export const selectCartError = (state) => state.cart.error
export const selectCartSubtotal = (state) => state.cart?.subtotal || 0
export const selectCartTax = (state) => state.cart?.tax || 0
export const selectIsLoading = (state) => state.cart?.isLoading || false

export default cartSlice.reducer
