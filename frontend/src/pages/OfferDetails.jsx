import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ClockIcon, ChevronLeftIcon, HeartIcon, ShoppingBagIcon, StarIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import api from '../services/api'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { showSuccessNotification, showErrorNotification } from '../store/slices/uiSlice'
import { openCart } from '../store/slices/uiSlice'

const OfferDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  
  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filterPriceRange, setFilterPriceRange] = useState('all')

  useEffect(() => {
    fetchOfferDetails()
    if (user) {
      fetchWishlist()
    }
  }, [id, user])

  useEffect(() => {
    let interval
    if (offer?.end_date) {
      interval = setInterval(() => {
        const remaining = getTimeRemaining(offer.end_date)
        setTimeRemaining(remaining)
        if (!remaining) {
          clearInterval(interval)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [offer])

  useEffect(() => {
    if (offer?.products) {
      filterProducts()
    }
  }, [searchQuery, filterPriceRange, offer])

  const fetchOfferDetails = async () => {
    try {
      const response = await api.get(`/offers/${id}`)
      setOffer(response.data)
      setFilteredProducts(response.data.products || [])
      
      // Set initial time remaining
      if (response.data.end_date) {
        setTimeRemaining(getTimeRemaining(response.data.end_date))
      }
    } catch (err) {
      console.error('Failed to fetch offer details:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist')
      setWishlist(response.data.data || response.data)
    } catch (err) {
      console.error('Failed to fetch wishlist:', err)
    }
  }

  const filterProducts = () => {
    if (!offer?.products) return

    let filtered = [...offer.products]

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by price range
    if (filterPriceRange !== 'all') {
      if (filterPriceRange === 'low') {
        filtered = filtered.filter(product => parseFloat(product.discounted_price || product.original_price || product.price || 0) < 50)
      } else if (filterPriceRange === 'medium') {
        filtered = filtered.filter(product => {
          const p = parseFloat(product.discounted_price || product.original_price || product.price || 0)
          return p >= 50 && p < 100
        })
      } else if (filterPriceRange === 'high') {
        filtered = filtered.filter(product => parseFloat(product.discounted_price || product.original_price || product.price || 0) >= 100)
      }
    }

    setFilteredProducts(filtered)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    filterProducts()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterPriceRange('all')
  }

  const activeFiltersCount = (searchQuery.trim() ? 1 : 0) + (filterPriceRange !== 'all' ? 1 : 0)

  const getTimeRemaining = (endDate) => {
    if (!endDate) return null
    
    const now = new Date()
    const end = new Date(endDate)
    const diff = end - now

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  }

  const getBannerUrl = (banner) => {
    if (!banner) return 'https://via.placeholder.com/1200x400?text=No+Banner'
    if (banner.startsWith('http')) return banner
    // For Laravel storage, use the storage URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://shop-production-d82a.up.railway.app'
    return `${baseUrl}/storage/${banner.startsWith('/') ? banner.slice(1) : banner}`
  }

  const getProductImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/300x300?text=No+Image'
    if (image.startsWith('http')) return image
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://shop-production-d82a.up.railway.app'}${image.startsWith('/') ? image : '/' + image}`
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId)
  }

  const toggleWishlist = async (productId) => {
    if (!user) {
      alert('يجب تسجيل الدخول لإضافة المنتجات إلى المفضلة')
      return
    }

    try {
      if (isInWishlist(productId)) {
        await api.delete(`/wishlist/${wishlist.find(item => item.product_id === productId).id}`)
        setWishlist(prev => prev.filter(item => item.product_id !== productId))
      } else {
        await api.post('/wishlist', { product_id: productId })
        setWishlist(prev => [...prev, { product_id: productId }])
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err)
    }
  }

  const handleAddToCart = async (product) => {
    if (!user) {
      dispatch(showErrorNotification('يجب تسجيل الدخول لإضافة المنتجات إلى السلة'))
      return
    }

    try {
      // Create complete cart item with all product data (like ProductDetail.jsx)
      const cartItem = {
        product_id: product.id,
        quantity: 1,
        product_name: product.name || `Product ${product.id}`,
        price: parseFloat(product.discounted_price || product.original_price || product.price) || 0,
        image_url: product.image_url || null,
        variant_id: null,
        currency: product.currency || 'USD',
        sku: product.sku || null,
        weight: product.weight || null,
        dimensions: product.dimensions || null,
        category: product.category?.name || null,
        brand: product.brand?.name || null,
        description: product.description || null,
        short_description: product.short_description || null,
        status: product.status || 'active',
        featured: product.featured || false,
        added_at: new Date().toISOString(),
        user_id: null, // Will be set by backend
      }

      console.log('🛒 Adding to cart from offer:', cartItem)

      // Add to cart using Redux action (like ProductDetail.jsx)
      await dispatch(addToCart(cartItem)).unwrap()
      dispatch(showSuccessNotification(`${product.name} تمت إضافته للسلة!`))

      // Force cart sidebar to open
      setTimeout(() => {
        dispatch(openCart())
      }, 500)

    } catch (error) {
      console.error('❌ Error adding to cart:', error)
      dispatch(showErrorNotification('فشل في الإضافة للسلة. يرجى المحاولة مرة أخرى.'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">العرض غير موجود</h2>
          <button
            onClick={() => navigate('/offers')}
            className="text-blue-600 hover:text-blue-700"
          >
            العودة للعروض
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Banner */}
      <div className="relative h-80 md:h-96">
        <img
          src={getBannerUrl(offer.banner)}
          alt={offer.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
          <button
            onClick={() => navigate('/offers')}
            className="flex items-center text-white hover:text-gray-200 mb-4 w-fit"
          >
            <ChevronLeftIcon className="h-5 w-5 ml-2" />
            العودة للعروض
          </button>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{offer.title}</h1>
          
          {offer.description && (
            <p className="text-gray-200 text-lg mb-4 max-w-2xl">{offer.description}</p>
          )}

          {/* Countdown Timer */}
          {timeRemaining && (
            <div className="flex items-center bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl w-fit">
              <ClockIcon className="h-6 w-6 text-red-600 ml-2" />
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{String(timeRemaining.days).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600">يوم</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{String(timeRemaining.hours).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600">ساعة</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600">دقيقة</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-600">ثانية</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            المنتجات ({filteredProducts.length || 0})
          </h2>
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
                placeholder="البحث في المنتجات..."
                className="w-full pr-10 pl-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
              />
            </div>
          </form>

          {/* Filter Price Range */}
          <select
            value={filterPriceRange}
            onChange={(e) => setFilterPriceRange(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
          >
            <option value="all">جميع الأسعار</option>
            <option value="low">أقل من 50</option>
            <option value="medium">50 - 100</option>
            <option value="high">أكثر من 100</option>
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

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <div className="mb-6">
            <button
              onClick={clearFilters}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              مسح الفلاتر
            </button>
          </div>
        )}

        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {/* Product Image */}
                <div className="relative h-40 sm:h-56">
                  <img
                    src={getProductImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 sm:top-3 left-2 sm:left-3 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    {isInWishlist(product.id) ? (
                      <HeartSolidIcon className="h-4 sm:h-5 w-4 sm:w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                    )}
                  </button>

                  {/* Discount Badge */}
                  {product.discount_percentage > 0 && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                      -{product.discount_percentage}%
                    </div>
                  )}

                  {/* Stock Status */}
                  {product.stock <= 0 && (
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-gray-800 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                      نفذت الكمية
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 line-clamp-2 h-10 sm:h-12">{product.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-3 sm:h-4 w-3 sm:w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 mr-1">({product.reviews_count || 0})</span>
                  </div>

                  {/* Prices */}
                  <div className="flex items-center gap-2 mb-3">
                    {product.discounted_price && product.discounted_price < product.original_price ? (
                      <>
                        <span className="text-sm sm:text-lg font-bold text-red-600">
                          {product.discounted_price} {product.currency || 'USD'}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                          {product.original_price} {product.currency || 'USD'}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm sm:text-lg font-bold text-gray-900">
                        {product.original_price} {product.currency || 'USD'}
                      </span>
                    )}
                  </div>

                  {/* Free Shipping Badge */}
                  {product.is_free_shipping && (
                    <div className="mb-3">
                      <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        شحن مجاني
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs sm:text-sm"
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`flex-1 flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                        product.stock <= 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <ShoppingBagIcon className="h-4 sm:h-5 w-4 sm:w-5 ml-1" />
                      {product.stock <= 0 ? 'نفذت' : 'إضافة'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <ShoppingBagIcon className="h-12 sm:h-16 w-12 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">لا توجد منتجات في هذا العرض</h3>
            <p className="text-gray-500 text-sm sm:text-base">تابعنا للحصول على تحديثات حول المنتجات</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 border-2 border-amber-600 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OfferDetails
