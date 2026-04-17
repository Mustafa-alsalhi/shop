import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const AdvertisementBanner = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await api.get('/banners?position=home')
      const bannerData = response.data.data || []
      setBanners(bannerData)
    } catch (error) {
      console.error('Error fetching banners:', error)
      // Fallback to dummy data if API fails
      setBanners([
        {
          id: 1,
          image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop',
          title: 'Summer Sale',
          description: 'Up to 50% Off',
          link_url: '/products',
          link_text: 'تسوق الآن'
        },
        {
          id: 2,
          image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop',
          title: 'New Arrivals',
          description: 'Latest Collection',
          link_url: '/products',
          link_text: 'استكشف الآن'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [banners.length])

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const handleBannerClick = (linkUrl, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    // If no link_url provided, default to /products
    const targetUrl = linkUrl || '/products'
    
    try {
      navigate(targetUrl)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to window.location
      window.location.href = targetUrl
    }
  }

  if (loading) {
    return (
      <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 text-sm sm:text-base">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return null // Don't show anything if no banners
  }

  const currentBanner = banners[currentSlide]

  return (
    <div 
      id="banner-container"
      className="relative w-full h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 overflow-hidden rounded-lg banner-container" 
      dir="rtl"
    >
      {/* Banner Images Container */}
      <div 
        id="banner-images-container"
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(${currentSlide * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="relative w-full h-full flex-shrink-0 banner-slide">
            <img
              src={banner.full_image_url || (banner.image_url.startsWith('http') ? banner.image_url : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://shop-production-d82a.up.railway.app'}${banner.image_url}`)}
              alt={banner.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={(e) => handleBannerClick(banner.link_url, e)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/800x400?text=Banner+Image';
              }}
            />
            
            {/* Overlay - Removed orange background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent">
              <div className="h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
                <div className="text-center text-white max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl">
                  <h2 
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-black/30 backdrop-blur-sm border-2 border-white/20 rounded-lg sm:rounded-xl cursor-pointer hover:bg-black/40 hover:border-white/30 hover:text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 banner-title"
                    onClick={(e) => handleBannerClick(banner.link_url, e)}
                  >
                    <span className="truncate">{banner.title}</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </h2>
                  {banner.description && (
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-3 sm:mb-4 md:mb-6 text-white/90 line-clamp-2 sm:line-clamp-3 banner-description">
                      {banner.description}
                    </p>
                  )}
                  {banner.link_url && (
                    <button
                      onClick={(e) => handleBannerClick(banner.link_url, e)}
                      className="inline-block bg-white text-gray-900 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl text-sm sm:text-base md:text-lg border border-white/50 banner-button"
                    >
                      {banner.link_text || 'اكتشف الآن'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute right-2 sm:right-3 md:right-4 lg:right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-1.5 sm:p-2 md:p-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-110 banner-arrows"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute left-2 sm:left-3 md:left-4 lg:left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-1.5 sm:p-2 md:p-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-110 banner-arrows"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-reverse space-x-1.5 sm:space-x-2 banner-indicators" style={{ zIndex: 30 }}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 scale-125 shadow-lg shadow-amber-500/50'
                  : 'bg-amber-200/50 hover:bg-amber-300/75 hover:scale-110'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AdvertisementBanner
