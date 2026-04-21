import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Helper function to get user-specific wishlist key
const getWishlistKey = () => {
  const token = localStorage.getItem('token')
  if (!token) return 'guest_wishlist'
  // Use a simple hash of token as user identifier
  return `wishlist_${token.substring(0, 10)}`
}

// Mock wishlist service - replace with actual API calls
const wishlistService = {
  getWishlist: async () => {
    // Simulate API call
    const wishlistKey = getWishlistKey()
    const storedWishlist = localStorage.getItem(wishlistKey)
    return { data: JSON.parse(storedWishlist || '[]') }
  },
  
  addToWishlist: async (product) => {
    const wishlistKey = getWishlistKey()
    const storedWishlist = localStorage.getItem(wishlistKey)
    const wishlist = JSON.parse(storedWishlist || '[]')
    const exists = wishlist.find(item => item.id === product.id)
    
    if (!exists) {
      // Ensure product has in_stock field, default to true if not present
      const productWithStock = {
        ...product,
        in_stock: product.in_stock !== undefined ? product.in_stock : true,
        added_at: new Date().toISOString()
      }
      wishlist.push(productWithStock)
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist))
    }
    
    return { data: wishlist }
  },
  
  removeFromWishlist: async (productId) => {
    const wishlistKey = getWishlistKey()
    const storedWishlist = localStorage.getItem(wishlistKey)
    const wishlist = JSON.parse(storedWishlist || '[]')
    const updatedWishlist = wishlist.filter(item => item.id !== productId)
    localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist))
    
    return { data: updatedWishlist }
  },
  
  clearWishlist: async () => {
    const wishlistKey = getWishlistKey()
    localStorage.removeItem(wishlistKey)
    return { data: [] }
  }
}

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wishlist'
      )
    }
  }
)

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (product, { rejectWithValue }) => {
    console.log('Adding to wishlist:', product)
    try {
      const response = await wishlistService.addToWishlist(product)
      console.log('Wishlist service response:', response)
      return response.data
    } catch (error) {
      console.error('Wishlist service error:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add to wishlist'
      )
    }
  }
)

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistService.removeFromWishlist(productId)
      return { productId, wishlist: response.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove from wishlist'
      )
    }
  }
)

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      await wishlistService.clearWishlist()
      return true
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear wishlist'
      )
    }
  }
)

// Initial state
const initialState = {
  items: [],
  isLoading: false,
  error: null,
  totalCount: 0,
}

// Slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    // Check if product is in wishlist
    isInWishlist: (state, productId) => {
      return state.items.some(item => item.id === productId)
    },
    // Optimistic updates
    optimisticAddToWishlist: (state, action) => {
      const product = action.payload
      const exists = state.items.find(item => item.id === product.id)
      if (!exists) {
        // Ensure product has in_stock field, default to true if not present
        const productWithStock = {
          ...product,
          in_stock: product.in_stock !== undefined ? product.in_stock : true,
          added_at: new Date().toISOString()
        }
        state.items.push(productWithStock)
        state.totalCount = state.items.length
      }
    },
    optimisticRemoveFromWishlist: (state, action) => {
      const productId = action.payload
      state.items = state.items.filter(item => item.id !== productId)
      state.totalCount = state.items.length
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload || []
        state.totalCount = state.items.length
        state.error = null
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.error = null
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload || []
        state.totalCount = state.items.length
        state.error = null
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.error = null
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        const { productId, wishlist } = action.payload
        state.items = wishlist || []
        state.totalCount = state.items.length
        state.error = null
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload
      })
      // Clear wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.isLoading = false
        state.items = []
        state.totalCount = 0
        state.error = null
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  clearError,
  optimisticAddToWishlist,
  optimisticRemoveFromWishlist,
} = wishlistSlice.actions

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items
export const selectWishlistCount = (state) => state.wishlist.totalCount
export const selectWishlistIsLoading = (state) => state.wishlist.isLoading
export const selectWishlistError = (state) => state.wishlist.error
export const selectIsInWishlist = (state, productId) => 
  state.wishlist.items.some(item => item.id === productId)

export default wishlistSlice.reducer
