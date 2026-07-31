import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, TagIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { FireIcon as FireSolidIcon } from '@heroicons/react/24/solid'
import api from '../services/api'
import CountdownTimer from './CountdownTimer'

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
      
      if (Math.abs(container.scrollLeft) + scrollAmount >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
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
      
      if (Math.abs(container.scrollLeft) - scrollAmount <= 0) {
        const maxScroll = container.scrollWidth - container.clientWidth
        container.scrollTo({ left: -maxScroll, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
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
      
      if (Math.abs(container.scrollLeft) + scrollAmount >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
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

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm py-6 sm:py-8 border-y border-red-200/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-row-reverse flex-wrap items-center mb-6 sm:mb-12 gap-y-4 w-full">
            <div className="flex items-center gap-2 flex-row-reverse flex-shrink-0 order-1">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <FireSolidIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div className="text-right">
                <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  العروض والخصومات
                </h2>
                <p className="text-gray-600 text-[9px] sm:text-[10px] md:text-xs mt-0.5 hidden sm:block">استمتع بأفضل الخصومات على منتجاتنا المميزة</p>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex justify-center md:justify-center flex-grow order-3 md:order-2 mt-2 md:mt-0 basis-full md:basis-auto">
              <CountdownTimer hours={3} />
            </div>

            <Link 
              to="/offers"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-bold transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap flex-shrink-0 order-2 md:order-3 mr-auto sm:mr-0 pl-2"
            >
              <span>جميع العروض</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1" />
            </Link>
          </div>
          <div className="relative">
            <div 
              className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex-none w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px]"
                >
                  <div className="block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-red-200/30 flex flex-col h-[320px] sm:h-[340px] md:h-[360px] lg:h-[360px] animate-pulse">
                    {/* Banner Skeleton */}
                    <div className="relative flex-shrink-0 h-48 bg-gray-200">
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold w-16 h-6"></div>
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg w-24 h-8"></div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="p-3 sm:p-5 flex flex-col">
                      <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-10 bg-gray-200 rounded mb-4 w-full"></div>
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t mt-auto">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
        <div className="flex flex-row-reverse flex-wrap items-center mb-6 sm:mb-12 gap-y-4 w-full">
            <div className="flex items-center gap-2 flex-row-reverse flex-shrink-0 order-1">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <FireSolidIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div className="text-right">
                <h2 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  العروض والخصومات
                </h2>
                <p className="text-gray-600 text-[9px] sm:text-[10px] md:text-xs mt-0.5 hidden sm:block">استمتع بأفضل الخصومات على منتجاتنا المميزة</p>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex justify-center md:justify-center flex-grow order-3 md:order-2 mt-2 md:mt-0 basis-full md:basis-auto">
              <CountdownTimer hours={3} />
            </div>

            <Link 
              to="/offers"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-bold transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap flex-shrink-0 order-2 md:order-3 mr-auto pl-2 sm:pl-0"
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
                dir="rtl"
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
                      className="block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-red-200/50 transition-all duration-300 transform hover:scale-105 border border-red-200/30 hover:border-red-300/60 flex flex-col h-[320px] sm:h-[340px] md:h-[360px] lg:h-[360px]"
                    >
                      {/* Banner */}
                      <div className="relative flex-shrink-0 h-40 sm:h-48">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" style={{ display: offer.banner ? 'block' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {!offer.banner && <span className="text-3xl sm:text-4xl">🎉</span>}
                        </div>

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
                      <div className="p-3 sm:p-5 flex flex-col">
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 truncate h-7 overflow-hidden" dir="rtl">{offer.title}</h3>

                        <div className="mb-3 sm:mb-4 h-9 sm:h-10 overflow-hidden">
                          {offer.description ? (
                            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2" dir="rtl">{offer.description}</p>
                          ) : (
                            <p className="text-gray-400 text-xs sm:text-sm" dir="rtl">لا يوجد وصف</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t mt-auto">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <TagIcon className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
                            <span>{offer.products_count || 0} منتج</span>
                          </div>

                          <span className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm flex items-center">
                            عرض المنتجات
                            <ChevronLeftIcon className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                          </span>
                        </div>
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
