import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, TagIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { FireIcon as FireSolidIcon } from '@heroicons/react/24/solid'
import api from '../services/api'

const OffersBanner = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPausedOffers, setIsPausedOffers] = useState(false)
  const offersIntervalRef = useRef(null)

  // Navigation functions
  const goToNextOffers = () => {
    const container = document.getElementById('offers-banner-container')
    if (container) {
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 280 // 1 offer card * 280px each
      } else if (screenWidth <= 768) {
        scrollAmount = 300 // 1 offer card * 300px each
      } else if (screenWidth <= 1024) {
        scrollAmount = 320 // 1 offer card * 320px each
      } else {
        scrollAmount = 340 // 1 offer card * 340px each
      }
      
      const maxScroll = container.scrollWidth - container.clientWidth
      
      if (container.scrollLeft + scrollAmount >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  const goToPreviousOffers = () => {
    const container = document.getElementById('offers-banner-container')
    if (container) {
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 280
      } else if (screenWidth <= 768) {
        scrollAmount = 300
      } else if (screenWidth <= 1024) {
        scrollAmount = 320
      } else {
        scrollAmount = 340
      }
      
      if (container.scrollLeft - scrollAmount <= 0) {
        const maxScroll = container.scrollWidth - container.clientWidth
        container.scrollTo({ left: maxScroll, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      }
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || offers.length === 0) return
    if (isPausedOffers) return

    const interval = setInterval(() => {
      const container = document.getElementById('offers-banner-container')
      if (!container) return

      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 280
      } else if (screenWidth <= 768) {
        scrollAmount = 300
      } else if (screenWidth <= 1024) {
        scrollAmount = 320
      } else {
        scrollAmount = 340
      }

      const maxScroll = container.scrollWidth - container.clientWidth
      
      if (container.scrollLeft + scrollAmount >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, offers, isPausedOffers])

  // Handle mouse drag/swipe functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('offers-banner-container')
      if (!container) return

      let isDown = false
      let startX
      let scrollLeft

      const handleMouseDown = (e) => {
        setIsAutoPlaying(false)
        isDown = true
        container.style.cursor = 'grabbing'
        container.style.userSelect = 'none'
        container.style.webkitUserSelect = 'none'
        startX = e.pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
        e.preventDefault()
        e.stopPropagation()
      }

      const handleMouseLeave = () => {
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseUp = () => {
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseMove = (e) => {
        if (!isDown) return
        e.preventDefault()
        e.stopPropagation()
        const x = e.pageX - container.offsetLeft
        const walk = (x - startX) * 2
        container.scrollLeft = scrollLeft - walk
      }

      container.addEventListener('mousedown', handleMouseDown, { passive: false })
      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })
      container.addEventListener('mouseup', handleMouseUp, { passive: true })
      container.addEventListener('mousemove', handleMouseMove, { passive: false })

      const handleTouchStart = (e) => {
        setIsAutoPlaying(false)
        isDown = true
        container.style.userSelect = 'none'
        container.style.webkitUserSelect = 'none'
        startX = e.touches[0].pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
        e.preventDefault()
      }

      const handleTouchEnd = () => {
        isDown = false
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleTouchMove = (e) => {
        if (!isDown) return
        e.preventDefault()
        const x = e.touches[0].pageX - container.offsetLeft
        const walk = (x - startX) * 2
        container.scrollLeft = scrollLeft - walk
      }

      container.addEventListener('touchstart', handleTouchStart, { passive: false })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })

      return () => {
        container.removeEventListener('mousedown', handleMouseDown)
        container.removeEventListener('mouseleave', handleMouseLeave)
        container.removeEventListener('mouseup', handleMouseUp)
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchend', handleTouchEnd)
        container.removeEventListener('touchmove', handleTouchMove)
      }
    }, 100)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      const response = await api.get('/offers?show_in_home=1')
      const allOffers = response.data.data || response.data
      setOffers(allOffers)
    } catch (err) {
      console.error('Failed to fetch offers:', err)
    } finally {
      setLoading(false)
    }
  }

  const getBannerUrl = (banner) => {
    if (!banner) return 'https://via.placeholder.com/400x400?text=No+Banner'
    if (banner.startsWith('http')) return banner
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
      <div className="bg-white/80 backdrop-blur-sm py-8 border-y border-red-200/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">**</h2>
            <Link 
              to="/offers"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium transition-colors text-xs sm:text-sm md:text-base"
            >
              <span>**</span>
              <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />
            </Link>
          </div>
          <div className="relative">
            <div className="relative">
              <div 
                id="offers-banner-container"
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {[...Array(8)].map((_, index) => (
                  <div 
                    key={index} 
                    className="flex-none w-64 h-80 bg-red-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (offers.length === 0) {
    return null
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm py-6 sm:py-8 border-y border-red-200/30">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center mb-8 sm:mb-12 gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
              <FireSolidIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div className="flex-1 sm:flex-none">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                العروض والخصومات
              </h2>
              <p className="text-gray-600 text-[9px] sm:text-[10px] md:text-xs mt-0.5 hidden sm:block">استمتع بأفضل الخصومات على منتجاتنا المميزة</p>
            </div>
          </div>
          <Link 
            to="/offers"
            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
          >
            <span>جميع العروض</span>
            <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1" />
          </Link>
        </div>

        {Array.isArray(offers) && offers.length > 0 ? (
          <div className="relative"
            onMouseEnter={() => {
              setIsPausedOffers(true)
              setIsAutoPlaying(false)
              if (offersIntervalRef.current) {
                clearInterval(offersIntervalRef.current)
              }
            }}
            onMouseLeave={() => {
              setIsPausedOffers(false)
              setTimeout(() => {
                setIsAutoPlaying(true)
              }, 2000)
            }}
          >
            <div className="relative">
              {/* Scroll Buttons */}
              <button
                onClick={goToPreviousOffers}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -ml-2 sm:-ml-4 md:-ml-6"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </button>
              
              <button
                onClick={goToNextOffers}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -mr-2 sm:-mr-4 md:-mr-6"
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </button>

              {/* Offers Container */}
              <div 
                id="offers-banner-container"
                className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {Array.isArray(offers) && offers.map((offer) => (
                  <div 
                    key={offer.id} 
                    className="flex-none w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px]"
                  >
                    <Link 
                      to={`/offers/${offer.id}`}
                      className="block bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-red-200/50 transition-all duration-300 transform hover:scale-105 border border-red-200/30 hover:border-red-300/60"
                    >
                      <div className="h-48 sm:h-52 md:h-56 lg:h-60 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center relative overflow-hidden">
                        {offer.banner ? (
                          <img
                            src={getBannerUrl(offer.banner)}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-red-900/10 flex items-center justify-center" style={{ display: offer.banner ? 'none' : 'flex' }}>
                          <span className="text-3xl sm:text-4xl">🎉</span>
                        </div>
                        
                        {/* Discount Badge */}
                        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl shadow-lg">
                            <span className="text-xs sm:text-sm font-bold">
                              {getDiscountTypeLabel(offer.discount_type)}
                              {offer.discount_type !== 'free_shipping' && ` ${offer.discount_value}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 bg-white/60 backdrop-blur-sm">
                        <h3 className="text-sm sm:text-base font-semibold text-red-800 text-center truncate mb-1 sm:mb-2">{offer.title}</h3>
                        {offer.description && (
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 text-right">{offer.description}</p>
                        )}
                        <div className="flex items-center justify-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                          <TagIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{offer.products_count || 0} منتج</span>
                        </div>
                        {offer.end_date && getTimeRemaining(offer.end_date) && (
                          <div className="flex items-center justify-center gap-1 sm:gap-2 text-red-500 text-xs sm:text-sm mt-2">
                            <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-medium">{getTimeRemaining(offer.end_date)}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-red-600">لا توجد عروض متاحة في الوقت الحالي.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OffersBanner
