import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  MagnifyingGlassIcon,
  CogIcon,
  XMarkIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import {
  fetchProducts,
  setFilters,
  clearFilters,
  fetchCategories,
  selectProducts,
  selectPagination,
  selectIsLoading,
  selectFilters,
  selectCategories,
  updatePagination,
} from '../store/slices/productsSlice'
import ProductCard from '../components/Product/ProductCard'
import ProductFilters from '../components/Product/ProductFilters'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const Products = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const products = useSelector(selectProducts)
  const pagination = useSelector(selectPagination)
  const isLoading = useSelector(selectIsLoading)
  const filters = useSelector(selectFilters)
  const categories = useSelector(selectCategories)
  
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      category_id: searchParams.get('category') ? parseInt(searchParams.get('category')) : null,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')) : null,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')) : null,
      sortBy: searchParams.get('sort') || 'created_at',
      sortOrder: searchParams.get('order') || 'desc',
      featured: searchParams.get('featured') === 'true' ? true : null,
      page: parseInt(searchParams.get('page')) || 1,
    }
    
    dispatch(setFilters(urlFilters))
    setSearchQuery(urlFilters.search)
  }, [searchParams, dispatch])

  // Fetch products when filters change - simplified
  const fetchProductsData = useCallback(() => {
    console.log('Products.jsx: Fetching products with filters:', JSON.stringify(filters, null, 2))
    
    // Build API params
    const params = {
      ...filters,
      per_page: 12,
    }
    
    // Convert array category_id to comma-separated string for API
    if (Array.isArray(params.category_id)) {
      params.category_id = params.category_id.join(',')
    }
    
    // Remove page from params if not specified
    if (!params.page) {
      delete params.page
    }
    
    // Remove featured=false to prevent infinite rendering
    if (params.featured === false) {
      delete params.featured
    }
    
    console.log('Products.jsx: API params:', JSON.stringify(params, null, 2))
    
    // Use the imported fetchProducts action
    dispatch(fetchProducts(params))
  }, [JSON.stringify(filters)])

  // Only run fetchProductsData when filters actually change
  useEffect(() => {
    fetchProductsData()
  }, [fetchProductsData])

  // Initialize filters on component mount - only run once
  useEffect(() => {
    console.log('Products.jsx: Component mounted, initial fetch')
    dispatch(fetchProducts({ per_page: 12 }))
  }, []) // Empty dependency array - only run once

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      dispatch(setFilters({ ...filters, search: searchQuery.trim(), page: 1 }))
    }
  }

  const handleFilterChange = (newFilters) => {
    console.log('Products.jsx: handleFilterChange called with:', newFilters)
    console.log('Products.jsx: Current filters:', filters)
    
    // Simple update - no complex comparison logic
    const updatedFilters = { ...filters, ...newFilters, page: 1 }
    console.log('Products.jsx: Updated filters:', updatedFilters)
    dispatch(setFilters(updatedFilters))
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ ...filters, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    dispatch(setFilters({
      search: '',
      category_id: null,
      min_price: null,
      max_price: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
      featured: null,
      rating: null,
      in_stock: null,
      page: 1,
    }))
    setSearchQuery('')
  }

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => 
      key !== 'page' && 
      key !== 'sortBy' && 
      key !== 'sortOrder' && 
      value !== null && 
      value !== '' && 
      !(key === 'featured' && value === false)
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" dir="rtl">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            {filters.search ? `نتائج البحث لـ "${filters.search}"` : 'جميع المنتجات'}
          </h1>
          <p className="text-gray-600">
            {pagination.total} منتج تم العثور عليه
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-8 flex flex-col lg:flex-row-reverse gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث في المنتجات..."
                className="w-full pr-10 pl-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </form>

          {/* Sort */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              handleFilterChange({ sortBy, sortOrder })
            }}
            className="px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
          >
            <option value="created_at-desc">الأحدث أولاً</option>
            <option value="created_at-asc">الأقدم أولاً</option>
            <option value="name-asc">الاسم: أ-ي</option>
            <option value="name-desc">الاسم: ي-أ</option>
            <option value="price-asc">السعر: منخفض للمرتفع</option>
            <option value="price-desc">السعر: مرتفع للمنخفض</option>
            <option value="rating-desc">الأعلى تقييماً</option>
            <option value="sales-desc">الأكثر مبيعاً</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-3 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors bg-white/80 backdrop-blur-sm"
          >
            <FunnelIcon className="h-5 w-5 ml-2 text-amber-600" />
            الترشيحات
            {activeFiltersCount > 0 && (
              <span className="mr-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-amber-400 mb-4">
                  <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900 mb-2">
                  لم يتم العثور على منتجات
                </h3>
                <p className="text-amber-700 mb-6">
                  حاول تعديل الفلاتر أو كلمات البحث
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 border-2 border-amber-600 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all duration-300 font-semibold"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="px-3 py-2 border border-amber-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 bg-white/80 backdrop-blur-sm"
                    >
                      السابق
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i
                        } else {
                          pageNum = pagination.currentPage - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 border rounded-md transition-all duration-300 ${
                              pageNum === pagination.currentPage
                                ? 'bg-amber-600 text-white border-amber-600 shadow-lg'
                                : 'border-amber-300 hover:bg-amber-50 bg-white/80 backdrop-blur-sm'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="px-3 py-2 border border-amber-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 bg-white/80 backdrop-blur-sm"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
