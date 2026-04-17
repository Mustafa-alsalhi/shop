import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import api from '../services/api'

const CategoryBanner = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Navigation functions
  const goToNextCategories = () => {
    const container = document.getElementById('categories-banner-container')
    if (container) {
      // Calculate scroll amount based on screen size
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 144 // 1 category * 144px each (w-32 + gap-4)
      } else if (screenWidth <= 768) {
        scrollAmount = 196 // 1 category * 196px each (w-44 + gap-4)
      } else if (screenWidth <= 1024) {
        scrollAmount = 176 // 1 category * 176px each (w-40 + gap-4)
      } else {
        scrollAmount = 196 // 1 category * 196px each (w-44 + gap-4)
      }
      
      const maxScroll = container.scrollWidth - container.clientWidth
      
      // Check if we've reached end
      if (container.scrollLeft + scrollAmount >= maxScroll) {
        // Reset to beginning smoothly
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        // Scroll normally
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  const goToPreviousCategories = () => {
    const container = document.getElementById('categories-banner-container')
    if (container) {
      // Calculate scroll amount based on screen size
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 144 // 1 category * 144px each
      } else if (screenWidth <= 768) {
        scrollAmount = 196 // 1 category * 196px each (w-44 + gap-4)
      } else if (screenWidth <= 1024) {
        scrollAmount = 176 // 1 category * 176px each (w-40 + gap-4)
      } else {
        scrollAmount = 196 // 1 category * 196px each (w-44 + gap-4)
      }
      
      // Check if we're at the beginning
      if (container.scrollLeft - scrollAmount <= 0) {
        // Go to end smoothly
        const maxScroll = container.scrollWidth - container.clientWidth
        container.scrollTo({ left: maxScroll, behavior: 'smooth' })
      } else {
        // Scroll normally
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      }
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || categories.length === 0) return

    const interval = setInterval(() => {
      const container = document.getElementById('categories-banner-container')
      if (!container) return

      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 144 // 1 category * 144px each
      } else if (screenWidth <= 768) {
        scrollAmount = 196 // 1 category * 196px each (w-44 + gap-4)
      } else if (screenWidth <= 1024) {
        scrollAmount = 176 // 1 category * 176px each (w-40 + gap-4)
      } else {
        scrollAmount = 196 // 1 category * 196px each (w-44 + gap-4)
      }

      const maxScroll = container.scrollWidth - container.clientWidth
      
      // Check if we've reached the end
      if (container.scrollLeft + scrollAmount >= maxScroll) {
        // Reset to beginning smoothly
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }, 4000) // Auto-play every 4 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, categories])

  // Handle mouse drag/swipe functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('categories-banner-container')
      if (!container) {
        console.log('Categories banner container not found - retrying...')
        return
      }

      console.log('Categories banner container found:', container)
      console.log('Categories banner container children:', container.children.length)

      let isDown = false
      let startX
      let scrollLeft

      const handleMouseDown = (e) => {
        console.log('Categories banner mouse down triggered on:', e.target)
        setIsAutoPlaying(false) // Stop auto-play on user interaction
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
        console.log('Categories banner mouse leave triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseUp = () => {
        console.log('Categories banner mouse up triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseMove = (e) => {
        if (!isDown) return
        console.log('Categories banner mouse move triggered')
        e.preventDefault()
        e.stopPropagation()
        const x = e.pageX - container.offsetLeft
        const walk = (x - startX) * 4 // Increase scroll speed significantly
        container.scrollLeft = scrollLeft - walk
      }

      // Add mouse event listeners with capture
      container.addEventListener('mousedown', handleMouseDown, { passive: false })
      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })
      container.addEventListener('mouseup', handleMouseUp, { passive: true })
      container.addEventListener('mousemove', handleMouseMove, { passive: false })

      // Add touch event listeners for mobile
      const handleTouchStart = (e) => {
        console.log('Categories banner touch start triggered')
        setIsAutoPlaying(false) // Stop auto-play on user interaction
        isDown = true
        container.style.userSelect = 'none'
        container.style.webkitUserSelect = 'none'
        startX = e.touches[0].pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
        e.preventDefault()
      }

      const handleTouchEnd = () => {
        console.log('Categories banner touch end triggered')
        isDown = false
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleTouchMove = (e) => {
        if (!isDown) return
        console.log('Categories banner touch move triggered')
        e.preventDefault()
        const x = e.touches[0].pageX - container.offsetLeft
        const walk = (x - startX) * 4 // Increase scroll speed significantly
        container.scrollLeft = scrollLeft - walk
      }

      // Add touch event listeners
      container.addEventListener('touchstart', handleTouchStart, { passive: false })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })

      // Cleanup function
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
    const fetchCategories = async () => {
      try {
        console.log('🔄 Starting fetch categories...')
        console.log('🌐 API URL:', import.meta.env.VITE_API_URL)
        const response = await api.get('/categories')
        console.log('✅ Categories response:', response.data)
        setCategories(response.data)
        setLoading(false)
      } catch (err) {
        console.error('❌ Failed to fetch categories:', err)
        console.error('❌ Error details:', {
          message: err.message,
          code: err.code,
          config: err.config,
          baseURL: err.config?.baseURL,
          url: err.config?.url
        })
        setError('فشل في تحميل الفئات')
        setLoading(false)
      }
    }

              fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm py-8 border-y border-amber-200/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">**</h2>
            <Link 
              to="/categories" 
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors text-xs sm:text-sm md:text-base"
            >
              <span>**</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />
            </Link>
          </div>
          <div className="relative">
            <div className="relative">
              <div 
                id="categories-banner-container"
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {[...Array(8)].map((_, index) => (
                  <div 
                    key={index} 
                    className="flex-none w-32 h-32 bg-amber-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || categories.length === 0) {
    return null // Don't show anything if there's an error or no categories
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm py-8 border-y border-amber-200/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">تسوق حسب الفئة</h2>
          <Link 
            to="/categories" 
            className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors text-xs sm:text-sm md:text-base"
          >
            <span>عرض جميع الفئات</span>
            <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />
          </Link>
        </div>

        {Array.isArray(categories) && categories.length > 0 ? (
          <div className="relative">
            <div className="relative">
              {/* Scroll Buttons */}
              <button
                onClick={goToPreviousCategories}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -ml-4 sm:-ml-6"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </button>
              
              <button
                onClick={goToNextCategories}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -mr-4 sm:-mr-6"
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </button>

              {/* Categories Container */}
              <div 
                id="categories-banner-container"
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {Array.isArray(categories) && categories.map((category, index) => (
                  <div 
                    key={category.id} 
                    className="flex-none w-32 sm:w-36 md:w-40 lg:w-44 xl:w-48"
                  >
                    <Link 
                      to={`/products?category=${category.slug}`}
                      className="block bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-amber-200/50 transition-all duration-300 transform hover:scale-105 border border-amber-200/30 hover:border-amber-300/60"
                    >
                      <div className="h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center relative overflow-hidden">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-amber-900/10 flex items-center justify-center" style={{ display: category.image_url ? 'none' : 'flex' }}>
                          <span className="text-3xl">
                            {category.name.includes('إلكترونيات') || category.name.toLowerCase().includes('electronics') ? '💻' :
                             category.name.includes('ملابس') || category.name.toLowerCase().includes('clothing') ? '👕' :
                             category.name.includes('أولاد') || category.name.includes('بنات') || category.name.toLowerCase().includes('kids') ? '👦👧' :
                             category.name.includes('رياضة') || category.name.toLowerCase().includes('sports') ? '⚽' :
                             category.name.includes('منزل') || category.name.toLowerCase().includes('home') ? '🏠' : '📦'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-white/60 backdrop-blur-sm">
                        <h3 className="text-sm font-semibold text-amber-800 text-center truncate">{category.name}</h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-amber-600">لا توجد فئات متاحة في الوقت الحالي.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryBanner
