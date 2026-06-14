import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClockIcon, TagIcon, ChevronLeftIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import api from '../services/api'

const Offers = () => {
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [filteredOffers, setFilteredOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchOffers()
  }, [])

  useEffect(() => {
    filterOffers()
  }, [searchQuery, filterType, offers])

  const fetchOffers = async () => {
    try {
      const response = await api.get('/offers')
      const offersData = response.data.data || response.data
      setOffers(offersData)
      setFilteredOffers(offersData)
    } catch (err) {
      console.error('Failed to fetch offers:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterOffers = () => {
    let filtered = [...offers]

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.description && offer.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(offer => offer.discount_type === filterType)
    }

    setFilteredOffers(filtered)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    filterOffers()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterType('all')
  }

  const activeFiltersCount = (searchQuery.trim() ? 1 : 0) + (filterType !== 'all' ? 1 : 0)

  const getBannerUrl = (banner) => {
    if (!banner) return 'https://via.placeholder.com/800x400?text=No+Banner'
    if (banner.startsWith('http')) return banner
    // For Laravel storage, use the storage URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://shop-production-d82a.up.railway.app'
    return `${baseUrl}/storage/${banner.startsWith('/') ? banner.slice(1) : banner}`
  }

  const getDiscountTypeLabel = (type) => {
    const typeMap = {
      percentage: '%',
      fixed: 'خصم',
      free_shipping: 'شحن مجاني'
    }
    return typeMap[type] || type
  }

  const getTimeRemaining = (endDate) => {
    if (!endDate) return null
    
    const now = new Date()
    const end = new Date(endDate)
    const diff = end - now

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days} يوم ${hours} ساعة`
    } else if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`
    } else {
      return `${minutes} دقيقة`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">العروض والخصومات</h1>
          <p className="text-gray-600 text-sm sm:text-base">استمتع بأفضل العروض والخصومات على منتجاتنا المميزة</p>
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
                placeholder="البحث في العروض..."
                className="w-full pr-10 pl-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
              />
            </div>
          </form>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm text-sm sm:text-base"
          >
            <option value="all">جميع أنواع الخصومات</option>
            <option value="percentage">نسبة مئوية</option>
            <option value="fixed">مبلغ ثابت</option>
            <option value="free_shipping">شحن مجاني</option>
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

        {/* Offers Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <TagIcon className="h-12 sm:h-16 w-12 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">لا توجد عروض حالياً</h3>
            <p className="text-gray-500 text-sm sm:text-base">تابعنا للحصول على أحدث العروض والخصومات</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 border-2 border-amber-600 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => navigate(`/offers/${offer.id}`)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
              >
                {/* Banner */}
                <div className="relative h-40 sm:h-56">
                  <img
                    src={getBannerUrl(offer.banner)}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Discount Badge */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                    {getDiscountTypeLabel(offer.discount_type)}
                    {offer.discount_type !== 'free_shipping' && ` ${offer.discount_value}`}
                  </div>

                  {/* Time Remaining */}
                  {offer.end_date && getTimeRemaining(offer.end_date) && (
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                      <div className="flex items-center text-gray-800">
                        <ClockIcon className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
                        <span className="text-xs sm:text-sm font-medium">{getTimeRemaining(offer.end_date)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 sm:p-5">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-1">{offer.title}</h3>
                  
                  {offer.description && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{offer.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <TagIcon className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
                      <span>{offer.products_count || 0} منتج</span>
                    </div>
                    
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm flex items-center">
                      عرض المنتجات
                      <ChevronLeftIcon className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Offers
