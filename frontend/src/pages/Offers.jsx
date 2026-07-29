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
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://shop-production-8385.up.railway.app'
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50" dir="rtl">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-12 sm:py-16 mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <TagIcon className="h-12 w-12 text-amber-200" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">العروض والخصومات</h1>
            <p className="text-base sm:text-lg md:text-xl text-amber-100 max-w-2xl mx-auto">
              استمتع بأفضل العروض والخصومات الحصرية على منتجاتنا المميزة
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 sm:mt-8">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <ClockIcon className="h-5 w-5 ml-2" />
                <span className="text-sm sm:text-base">عروض محدودة الوقت</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm sm:text-base">خصومات تصل إلى 70%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8 sm:pb-12">
        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث في العروض..."
                  className="w-full pr-10 pl-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-sm sm:text-base"
                />
              </div>
            </form>

            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-sm sm:text-base"
            >
              <option value="all">جميع أنواع الخصومات</option>
              <option value="percentage">نسبة مئوية</option>
              <option value="fixed">مبلغ ثابت</option>
              <option value="free_shipping">شحن مجاني</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors bg-gray-50"
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
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center"
              >
                <XMarkIcon className="h-4 w-4 ml-1" />
                مسح الفلاتر
              </button>
            </div>
          )}
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse border border-gray-100">
                <div className="h-48 sm:h-56 bg-gray-200"></div>
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                     <div className="h-4 bg-gray-200 rounded"></div>
                     <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between">
                     <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                     <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
              <TagIcon className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">لا توجد عروض حالياً</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6">تابعنا للحصول على أحدث العروض والخصومات الحصرية</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Offers Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 text-sm sm:text-base">
                <span className="font-bold text-amber-600">{filteredOffers.length}</span> عرض متاح
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></span>
                  نشط
                </span>
              </div>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredOffers.map((offer) => (
                <div
                  key={offer.id}
                  onClick={() => navigate(`/offers/${offer.id}`)}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-gray-100 hover:border-amber-300"
                >
                  {/* Banner */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={getBannerUrl(offer.banner)}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Discount Badge */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      {getDiscountTypeLabel(offer.discount_type)}
                      {offer.discount_type !== 'free_shipping' && ` ${offer.discount_value}`}
                    </div>

                    {/* Time Remaining */}
                    {offer.end_date && getTimeRemaining(offer.end_date) && (
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg">
                        <div className="flex items-center text-gray-800">
                          <ClockIcon className="h-4 sm:h-5 w-4 sm:w-5 ml-1.5 text-amber-600" />
                          <span className="text-xs sm:text-sm font-semibold">{getTimeRemaining(offer.end_date)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors" dir="rtl">{offer.title}</h3>

                    <div className="mb-4">
                      {offer.description ? (
                        <p className="text-gray-600 text-sm line-clamp-2" dir="rtl">{offer.description}</p>
                      ) : (
                        <p className="text-gray-400 text-sm" dir="rtl">لا يوجد وصف</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-600">
                        <TagIcon className="h-4 w-4 ml-1.5 text-amber-600" />
                        <span className="font-medium">{offer.products_count || 0} منتج</span>
                      </div>

                      <button className="flex items-center text-amber-600 hover:text-amber-700 font-semibold text-sm transition-colors">
                        عرض المنتجات
                        <ChevronLeftIcon className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Offers
