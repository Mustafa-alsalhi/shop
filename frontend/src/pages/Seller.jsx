import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, ChatBubbleLeftIcon, TagIcon } from '@heroicons/react/24/outline'
import {
  fetchProducts,
  selectProducts,
  selectIsLoading,
  selectPagination,
  setFilters,
  clearFilters,
} from '../store/slices/productsSlice'
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice'
import ProductCard from '../components/Product/ProductCard'
import ProductFilters from '../components/Product/ProductFilters'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import api from '../services/api'

const Seller = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [seller, setSeller] = useState(null)
  const [loadingSeller, setLoadingSeller] = useState(true)
  const [coupons, setCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(true)
  const products = useSelector(selectProducts)
  const isLoadingProducts = useSelector(selectIsLoading)
  const pagination = useSelector(selectPagination)
  const filters = useSelector((state) => state.products.filters)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectUser)
  
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoadingSeller(true)
        
        // Fetch seller details
        const sellerResponse = await fetch(`${import.meta.env.VITE_API_URL}/sellers/${id}`)
        if (sellerResponse.ok) {
          const sellerData = await sellerResponse.json()
          const seller = sellerData.data || sellerData
          console.log('Seller data:', seller)
          console.log('Seller categories:', seller.categories)
          setSeller(seller)
        }
      } catch (error) {
        console.error('Error fetching seller data:', error)
      } finally {
        setLoadingSeller(false)
      }
    }

    fetchSellerData()
  }, [id])

  useEffect(() => {
    const fetchSellerCoupons = async () => {
      try {
        setLoadingCoupons(true)
        const response = await api.get(`/sellers/${id}/coupons`)
        console.log('Full response:', response)
        console.log('Response data:', response.data)
        console.log('Coupons data:', response.data.data)
        const couponsData = response.data.data || response.data || []
        console.log('Coupons array:', couponsData)
        console.log('Coupons length:', couponsData.length)
        setCoupons(couponsData)
      } catch (error) {
        console.error('Error fetching seller coupons:', error)
        console.error('Error response:', error.response)
        setCoupons([])
      } finally {
        setLoadingCoupons(false)
      }
    }

    fetchSellerCoupons()
  }, [id])

  // Fetch seller products using Redux with filters
  const fetchSellerProducts = useCallback(() => {
    if (id) {
      const params = {
        seller_id: id,
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
      
      dispatch(fetchProducts(params))
    }
  }, [id, filters, dispatch])

  useEffect(() => {
    fetchSellerProducts()
  }, [fetchSellerProducts])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      dispatch(setFilters({ ...filters, search: searchQuery.trim(), page: 1 }))
    }
  }

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }
    dispatch(setFilters(updatedFilters))
    if (window.innerWidth < 1024) {
      setShowFilters(false)
    }
  }

  const handlePageChange = (page) => {
    dispatch(setFilters({ ...filters, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearAllFilters = () => {
    dispatch(setFilters({
      search: '',
      category_id: null,
      min_price: null,
      max_price: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
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
      key !== 'seller_id' &&
      value !== null && 
      value !== ''
  ).length

  const handleChatWithSeller = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/seller/${id}` } })
      return
    }
    
    // Check if user is trying to chat with themselves
    if (currentUser?.seller_id === parseInt(id)) {
      alert('لا يمكنك الدردشة مع نفسك')
      return
    }
    navigate(`/chat/${id}`, { 
      state: { 
        sellerName: seller?.store_name 
      } 
    })
  }

  if (loadingSeller || isLoadingProducts) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">البائع غير موجود</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm sm:text-base">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8" dir="rtl">
      {/* Seller Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative flex-shrink-0">
            {seller.avatar ? (
              <img
                src={seller.avatar.startsWith('http') ? seller.avatar : `${import.meta.env.VITE_API_URL.replace('/api', '')}${seller.avatar}`}
                alt={seller.store_name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-500"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold" style={{display: seller.avatar ? 'none' : 'flex'}}>
              {seller.store_name ? seller.store_name.charAt(0) : 'ب'}
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-right">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{seller.store_name || 'اسم المتجر'}</h1>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{seller.description || 'وصف المتجر'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5" fill={i < Math.floor(seller.rating || 0) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 text-sm sm:text-base">({seller.rating || '0.0'})</span>
              </div>
              <div className="text-gray-600 text-sm sm:text-base">{seller.reviews_count || 0} تقييم</div>
              <div className="text-gray-600 text-sm sm:text-base">{seller.total_products || 0} منتج</div>
              
              {/* Chat Button */}
              <button
                onClick={handleChatWithSeller}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base font-medium"
              >
                <ChatBubbleLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>دردشة مع البائع</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Categories Section */}
      {seller.categories && seller.categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 ml-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            فئات البائع
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {seller.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleFilterChange({ category_id: [category.id] })}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg hover:from-amber-100 hover:to-orange-100 transition-all duration-300 text-sm sm:text-base text-gray-700 hover:text-amber-800 font-medium"
              >
                {category.name}
                <span className="mr-2 text-amber-600 text-xs">({category.products_count || 0})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seller Coupons Section */}
      {!loadingCoupons && coupons.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TagIcon className="h-5 w-5 ml-2 text-amber-600" />
            كوبونات البائع
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-xl p-4 hover:border-amber-500 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-4 h-4 bg-white rounded-full -mr-2 -mt-2 border-2 border-amber-300"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full -mr-2 -mb-2 border-2 border-amber-300"></div>
                <div className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full -ml-2 -mt-2 border-2 border-amber-300"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-white rounded-full -ml-2 -mb-2 border-2 border-amber-300"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                      {coupon.code}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-600">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ريال`}
                    </span>
                  </div>
                  
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{coupon.name || 'كوبون'}</h3>
                  
                  {coupon.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{coupon.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {coupon.minimum_amount && (
                      <span>الحد الأدنى: {coupon.minimum_amount} ريال</span>
                    )}
                    {coupon.usage_limit && (
                      <span>الاستخدام: {coupon.used_count || 0}/{coupon.usage_limit}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">منتجات البائع</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {pagination.total || products.length} منتج
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث في منتجات البائع..."
                className="w-full pr-10 pl-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
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
            className="px-3 sm:px-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
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
            className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors bg-white/80 backdrop-blur-sm"
          >
            <FunnelIcon className="h-5 w-5 ml-2 text-amber-600" />
            <span className="text-sm sm:text-base">الترشيحات</span>
            {activeFiltersCount > 0 && (
              <span className="mr-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoadingProducts ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
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
                  onClick={clearAllFilters}
                  className="px-6 py-3 border-2 border-amber-600 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all duration-300 font-semibold"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid - 2 columns on mobile, more on larger screens */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="px-2 sm:px-3 py-2 border border-amber-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
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
                            className={`px-2 sm:px-3 py-2 border rounded-md transition-all duration-300 text-sm sm:text-base ${
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
                      className="px-2 sm:px-3 py-2 border border-amber-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
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

export default Seller
