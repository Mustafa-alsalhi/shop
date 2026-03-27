import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService from '../../services/productService'
import cartService from '../../services/cartService'

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(params)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products'
      )
    }
  }
)

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProduct(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product'
      )
    }
  }
)

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(query)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search products'
      )
    }
  }
)

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts(params)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch featured products'
      )
    }
  }
)

export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelatedProducts',
  async (id, { rejectWithValue }) => {
    console.log('Redux: Fetching related products for product ID:', id)
    try {
      const response = await productService.getRelatedProducts(id)
      console.log('Redux: Related products response:', response)
      console.log('Redux: Related products data:', response.data)
      return response.data
    } catch (error) {
      console.error('Redux: Failed to fetch related products:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch related products'
      )
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getCategories(params)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories'
      )
    }
  }
)

export const fetchCategoryTree = createAsyncThunk(
  'products/fetchCategoryTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getCategoryTree()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch category tree'
      )
    }
  }
)

// Initial state
const initialState = {
  products: [],
  currentProduct: null,
  featuredProducts: [],
  relatedProducts: [],
  categories: [],
  categoryTree: [],
  searchResults: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    perPage: 12,
    total: 0,
  },
  filters: {
    category_id: null,
    search: '',
    min_price: null,
    max_price: null,
    sortBy: 'created_at',
    sortOrder: 'desc',
    featured: null,
    rating: null,
    in_stock: null,
    page: 1,
  },
  isLoading: false,
  isProductLoading: false,
  error: null,
  searchLoading: false,
}

// Slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        category_id: null,
        search: '',
        min_price: null,
        max_price: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        featured: null,
        rating: null,
        in_stock: null,
        page: 1,
      }
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.data || action.payload
        state.pagination = {
          currentPage: action.payload.current_page || 1,
          totalPages: action.payload.last_page || 1,
          perPage: action.payload.per_page || 12,
          total: action.payload.total || 0,
        }
        state.error = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch single product
      .addCase(fetchProduct.pending, (state) => {
        state.isProductLoading = true
        state.error = null
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isProductLoading = false
        state.currentProduct = action.payload
        state.error = null
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isProductLoading = false
        state.error = action.payload
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true
        state.error = null
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload
        state.error = null
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false
        state.error = action.payload
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.featuredProducts = action.payload
        state.error = null
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch related products
      .addCase(fetchRelatedProducts.pending, (state) => {
        console.log('Redux: fetchRelatedProducts pending')
        state.error = null
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        console.log('Redux: fetchRelatedProducts fulfilled')
        console.log('Redux: Setting related products:', action.payload)
        state.relatedProducts = action.payload
        console.log('Redux: Related products in state:', state.relatedProducts)
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        console.log('Redux: fetchRelatedProducts rejected:', action)
        state.error = action.payload
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload
        state.error = null
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch category tree
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.categoryTree = action.payload
      })
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const {
  setFilters,
  clearFilters,
  clearError,
  clearCurrentProduct,
  clearSearchResults,
  updatePagination,
} = productsSlice.actions

// Add missing addToCart action (should be in cartSlice but importing here for compatibility)
export const addToCart = createAsyncThunk(
  'products/addToCart',
  async (itemData, { rejectWithValue }) => {
    try {
      // This should use cartService instead
      const response = await cartService.addToCart(itemData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add item to cart'
      )
    }
  }
)

// Selectors
export const selectProducts = (state) => state.products.products
export const selectCurrentProduct = (state) => state.products.currentProduct
export const selectFeaturedProducts = (state) => state.products.featuredProducts?.data || state.products.featuredProducts || []
export const selectRelatedProducts = (state) => state.products.relatedProducts
export const selectCategories = (state) => state.products.categories
export const selectCategoryTree = (state) => state.products.categoryTree
export const selectSearchResults = (state) => state.products.searchResults
export const selectPagination = (state) => state.products.pagination
export const selectFilters = (state) => state.products.filters
export const selectIsLoading = (state) => state.products.isLoading
export const selectIsProductLoading = (state) => state.products.isProductLoading
export const selectSearchLoading = (state) => state.products.searchLoading
export const selectError = (state) => state.products.error
export const selectCartItems = (state) => state.cart.items

export default productsSlice.reducer
