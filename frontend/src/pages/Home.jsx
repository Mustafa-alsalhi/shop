import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ChevronLeftIcon, ChevronRightIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import AdvertisementBanner from '../components/AdvertisementBanner'
import CategoryBanner from '../components/CategoryBanner'
import ProductCard from '../components/Product/ProductCard'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { fetchFeaturedProducts, selectFeaturedProducts, selectIsLoading } from '../store/slices/productsSlice'

const Home = () => {
  const dispatch = useDispatch()
  const featuredProducts = useSelector(selectFeaturedProducts)
  const isLoading = useSelector(selectIsLoading)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [latestProducts, setLatestProducts] = useState([])
  const [isLoadingLatest, setIsLoadingLatest] = useState(true)
  const [bestSellers, setBestSellers] = useState([])
  const [clothingProducts, setClothingProducts] = useState([])
  const [kidsProducts, setKidsProducts] = useState([])
  const [electronicsProducts, setElectronicsProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [clothingCategoryName, setClothingCategoryName] = useState('الملابس')
  const [kidsCategoryName, setKidsCategoryName] = useState('بناتي وأولاد')
  const [electronicsCategoryName, setElectronicsCategoryName] = useState('الإلكترونيات')
  const sliderRef = useRef(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Get number of products to show based on screen size
  const getProductsPerView = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width >= 1536) return 5 // 2xl: 5 products
      if (width >= 1280) return 4 // xl: 4 products
      if (width >= 1024) return 3 // lg: 3 products
      if (width >= 768) return 2  // md: 2 products
      if (width >= 640) return 1  // sm: 1 product
      return 1 // xs: 1 product
    }
    return 1 // Default for SSR
  }

  // Get max index for carousel
  const getMaxIndex = () => {
    if (!Array.isArray(featuredProducts) || featuredProducts.length === 0) return 0
    const productsPerView = getProductsPerView()
    return Math.max(0, featuredProducts.length - productsPerView)
  }

  // Auto-scroll functionality for new products
  useEffect(() => {
    if (isLoadingLatest || !Array.isArray(latestProducts) || latestProducts.length === 0) return
    
    const interval = setInterval(() => {
      const container = document.getElementById('new-products-container')
      if (container) {
        // Calculate scroll amount based on screen size
        const screenWidth = window.innerWidth
        let scrollAmount
        
        if (screenWidth <= 480) {
          // For small screens (max-width: 480px) - show 2 products, scroll by 2 products
          scrollAmount = 200 // 2 products * 100px each (w-48 + gap-2)
        } else if (screenWidth <= 768) {
          // For medium screens (max-width: 768px) - show 3 products, scroll by 3 products
          scrollAmount = 204 // 3 products * 68px each (w-64 + gap-4)
        } else if (screenWidth <= 1024) {
          // For large screens (max-width: 1024px) - show 4 products, scroll by 4 products
          scrollAmount = 304 // 4 products * 76px each (w-72 + gap-5)
        } else {
          // For extra large screens - use default scroll amount
          scrollAmount = 344 // 4 products * 86px each (w-80 + gap-6)
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
    }, 4000) // Auto-scroll every 4 seconds

    return () => clearInterval(interval)
  }, [isLoadingLatest, latestProducts])

  // Auto-scroll functionality for horizontal slider
  useEffect(() => {
    if (isLoading || !Array.isArray(featuredProducts) || featuredProducts.length === 0) return
    
    const interval = setInterval(() => {
      const container = document.getElementById('featured-products-container')
      if (container) {
        // Calculate scroll amount based on screen size
        const screenWidth = window.innerWidth
        let scrollAmount
        
        if (screenWidth <= 480) {
          // For small screens (max-width: 480px) - show 2 products, scroll by 2 products
          scrollAmount = 200 // 2 products * 100px each (w-48 + gap-2)
        } else if (screenWidth <= 768) {
          // For medium screens (max-width: 768px) - show 3 products, scroll by 3 products
          scrollAmount = 204 // 3 products * 68px each (w-64 + gap-4)
        } else if (screenWidth <= 1024) {
          // For large screens (max-width: 1024px) - show 4 products, scroll by 4 products
          scrollAmount = 304 // 4 products * 76px each (w-72 + gap-5)
        } else {
          // For extra large screens - use default scroll amount
          scrollAmount = 344 // 4 products * 86px each (w-80 + gap-6)
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
    }, 4000) // Auto-scroll every 4 seconds

    return () => clearInterval(interval)
  }, [isLoading, featuredProducts])

  // Manual navigation for horizontal slider
  const goToPrevious = () => {
    const container = document.getElementById('featured-products-container')
    if (container) {
      // Calculate scroll amount based on screen size
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        // For small screens (max-width: 480px) - scroll by 2 products
        scrollAmount = 200 // 2 products * 100px each (w-48 + gap-2)
      } else if (screenWidth <= 768) {
        // For medium screens (max-width: 768px) - scroll by 3 products
        scrollAmount = 204 // 3 products * 68px each (w-64 + gap-4)
      } else if (screenWidth <= 1024) {
        // For large screens (max-width: 1024px) - scroll by 4 products
        scrollAmount = 304 // 4 products * 76px each (w-72 + gap-5)
      } else {
        // For extra large screens - use default scroll amount
        scrollAmount = 344 // 4 products * 86px each (w-80 + gap-6)
      }
      
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const goToNext = () => {
    const container = document.getElementById('featured-products-container')
    if (container) {
      // Calculate scroll amount based on screen size
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        // For small screens (max-width: 480px) - scroll by 2 products
        scrollAmount = 200 // 2 products * 100px each (w-48 + gap-2)
      } else if (screenWidth <= 768) {
        // For medium screens (max-width: 768px) - scroll by 3 products
        scrollAmount = 204 // 3 products * 68px each (w-64 + gap-4)
      } else if (screenWidth <= 1024) {
        // For large screens (max-width: 1024px) - scroll by 4 products
        scrollAmount = 304 // 4 products * 76px each (w-72 + gap-5)
      } else {
        // For extra large screens - use default scroll amount
        scrollAmount = 344 // 4 products * 86px each (w-80 + gap-6)
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

  const goToPreviousNew = () => {
    const container = document.getElementById('new-products-container')
    if (container) {
      // Calculate scroll amount based on screen size
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        // For small screens (max-width: 480px) - scroll by 2 products
        scrollAmount = 200 // 2 products * 100px each (w-48 + gap-2)
      } else if (screenWidth <= 768) {
        // For medium screens (max-width: 768px) - scroll by 3 products
        scrollAmount = 204 // 3 products * 68px each (w-64 + gap-4)
      } else if (screenWidth <= 1024) {
        // For large screens (max-width: 1024px) - scroll by 4 products
        scrollAmount = 304 // 4 products * 76px each (w-72 + gap-5)
      } else {
        // For extra large screens - use default scroll amount
        scrollAmount = 344 // 4 products * 86px each (w-80 + gap-6)
      }
      
      const maxScroll = container.scrollWidth - container.clientWidth
      
      // Check if we're at the beginning and need to go to end
      if (container.scrollLeft - scrollAmount <= 0) {
        // Go to end smoothly
        container.scrollTo({ left: maxScroll, behavior: 'smooth' })
      } else {
        // Scroll normally
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      }
    }
  }

  // Fetch categories and category-specific products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`)
        if (response.ok) {
          const data = await response.json()
          console.log('Categories from database:', data)
          
          // Find category names from database
          const clothingCat = data.find(cat => 
            cat.name.includes('ملابس') || 
            cat.name.toLowerCase().includes('clothing')
          )
          const kidsCat = data.find(cat => 
            cat.name.includes('أولاد') || 
            cat.name.includes('بنات') ||
            cat.name.toLowerCase().includes('kids')
          )
          const electronicsCat = data.find(cat => 
            cat.name.includes('إلكترونيات') || 
            cat.name.toLowerCase().includes('electronics')
          )
          
          // Update category names from database
          if (clothingCat) {
            setClothingCategoryName(clothingCat.name)
            console.log('Clothing category found:', clothingCat.name)
          }
          if (kidsCat) {
            setKidsCategoryName(kidsCat.name)
            console.log('Kids category found:', kidsCat.name)
          }
          if (electronicsCat) {
            setElectronicsCategoryName(electronicsCat.name)
            console.log('Electronics category found:', electronicsCat.name)
          }
          
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    const fetchClothingProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/clothing`)
        if (response.ok) {
          const data = await response.json()
          const products = data.data || data || []
          setClothingProducts(Array.isArray(products) ? products.slice(0, 8) : [])
        }
      } catch (error) {
        console.error('Error fetching clothing products:', error)
        setClothingProducts([])
      }
    }

    const fetchKidsProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/kids`)
        if (response.ok) {
          const data = await response.json()
          const products = data.data || data || []
          setKidsProducts(Array.isArray(products) ? products.slice(0, 8) : [])
        }
      } catch (error) {
        console.error('Error fetching kids products:', error)
        setKidsProducts([])
      }
    }

    const fetchElectronicsProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/electronics`)
        if (response.ok) {
          const data = await response.json()
          const products = data.data || data || []
          setElectronicsProducts(Array.isArray(products) ? products.slice(0, 8) : [])
        }
      } catch (error) {
        console.error('Error fetching electronics products:', error)
        setElectronicsProducts([])
      }
    }

    // Fetch categories first, then products
    fetchCategories().then(() => {
      fetchClothingProducts()
      fetchKidsProducts()
      fetchElectronicsProducts()
    })
  }, [])

  // Navigation functions for categories
  const goToNextCategories = () => {
    const container = document.getElementById('categories-container')
    if (container) {
      // Calculate scroll amount based on screen size
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        // For small screens - scroll by 1 category
        scrollAmount = 280 // 1 category * 280px each (w-64 + gap-4)
      } else if (screenWidth <= 768) {
        // For medium screens - scroll by 1 category
        scrollAmount = 316 // 1 category * 316px each (w-72 + gap-5)
      } else if (screenWidth <= 1024) {
        // For large screens - scroll by 1 category
        scrollAmount = 352 // 1 category * 352px each (w-80 + gap-6)
      } else {
        // For extra large screens - scroll by 1 category
        scrollAmount = 424 // 1 category * 424px each (w-96 + gap-8)
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
    const container = document.getElementById('categories-container')
    if (container) {
      // Calculate scroll amount based on screen size
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 280 // 1 category * 280px each
      } else if (screenWidth <= 768) {
        scrollAmount = 316 // 1 category * 316px each
      } else if (screenWidth <= 1024) {
        scrollAmount = 352 // 1 category * 352px each
      } else {
        scrollAmount = 424 // 1 category * 424px each
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

  // Scroll functions for Clothing
  const goToPreviousClothing = () => {
    const container = document.getElementById('clothing-container')
    if (!container) return
    
    let scrollAmount
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width <= 480) scrollAmount = 200
      else if (width <= 768) scrollAmount = 204
      else if (width <= 1024) scrollAmount = 304
      else scrollAmount = 344
    } else {
      scrollAmount = 304
    }
    
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }

  const goToNextClothing = () => {
    const container = document.getElementById('clothing-container')
    if (!container) return
    
    let scrollAmount
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width <= 480) scrollAmount = 200
      else if (width <= 768) scrollAmount = 204
      else if (width <= 1024) scrollAmount = 304
      else scrollAmount = 344
    } else {
      scrollAmount = 304
    }
    
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  // Scroll functions for Kids
  const goToPreviousKids = () => {
    const container = document.getElementById('kids-container')
    if (!container) return
    
    let scrollAmount
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width <= 480) scrollAmount = 200
      else if (width <= 768) scrollAmount = 204
      else if (width <= 1024) scrollAmount = 304
      else scrollAmount = 344
    } else {
      scrollAmount = 304
    }
    
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }

  const goToNextKids = () => {
    const container = document.getElementById('kids-container')
    if (!container) return
    
    let scrollAmount
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width <= 480) scrollAmount = 200
      else if (width <= 768) scrollAmount = 204
      else if (width <= 1024) scrollAmount = 304
      else scrollAmount = 344
    } else {
      scrollAmount = 304
    }
    
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  // Scroll functions for Electronics
  const goToPreviousElectronics = () => {
    const container = document.getElementById('electronics-container')
    if (!container) return
    
    let scrollAmount
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width <= 480) scrollAmount = 200
      else if (width <= 768) scrollAmount = 204
      else if (width <= 1024) scrollAmount = 304
      else scrollAmount = 344
    } else {
      scrollAmount = 304
    }
    
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }

  const goToNextElectronics = () => {
    const container = document.getElementById('electronics-container')
    if (!container) return
    
    let scrollAmount
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width <= 480) scrollAmount = 200
      else if (width <= 768) scrollAmount = 204
      else if (width <= 1024) scrollAmount = 304
      else scrollAmount = 344
    } else {
      scrollAmount = 304
    }
    
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const goToNextNew = () => {
    const container = document.getElementById('new-products-container')
    if (container) {
      // Calculate scroll amount based on screen size
      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        // For small screens (max-width: 480px) - scroll by 2 products
        scrollAmount = 200 // 2 products * 100px each (w-48 + gap-2)
      } else if (screenWidth <= 768) {
        // For medium screens (max-width: 768px) - scroll by 3 products
        scrollAmount = 204 // 3 products * 68px each (w-64 + gap-4)
      } else if (screenWidth <= 1024) {
        // For large screens (max-width: 1024px) - scroll by 4 products
        scrollAmount = 304 // 4 products * 76px each (w-72 + gap-5)
      } else {
        // For extra large screens - use default scroll amount
        scrollAmount = 344 // 4 products * 86px each (w-80 + gap-6)
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

  // Auto-play functionality for categories
  useEffect(() => {
    if (!isAutoPlaying || categories.length === 0) return

    const interval = setInterval(() => {
      const container = document.getElementById('categories-container')
      if (!container) return

      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 280 // 1 category * 280px each
      } else if (screenWidth <= 768) {
        scrollAmount = 316 // 1 category * 316px each
      } else if (screenWidth <= 1024) {
        scrollAmount = 352 // 1 category * 352px each
      } else {
        scrollAmount = 424 // 1 category * 424px each
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

  // Handle mouse drag/swipe functionality for categories
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('categories-container')
      if (!container) {
        console.log('Categories container not found - retrying...')
        return
      }

      console.log('Categories container found:', container)
      console.log('Categories container children:', container.children.length)

      let isDown = false
      let startX
      let scrollLeft

      const handleMouseDown = (e) => {
        console.log('Categories mouse down triggered on:', e.target)
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
        console.log('Categories mouse leave triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseUp = () => {
        console.log('Categories mouse up triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseMove = (e) => {
        if (!isDown) return
        console.log('Categories mouse move triggered')
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
        console.log('Categories touch start triggered')
        setIsAutoPlaying(false) // Stop auto-play on user interaction
        isDown = true
        container.style.userSelect = 'none'
        container.style.webkitUserSelect = 'none'
        startX = e.touches[0].pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
        e.preventDefault()
      }

      const handleTouchEnd = () => {
        console.log('Categories touch end triggered')
        isDown = false
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleTouchMove = (e) => {
        if (!isDown) return
        console.log('Categories touch move triggered')
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

  // Handle mouse drag/swipe functionality for clothing products
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('clothing-container')
      if (!container) {
        console.log('Clothing products container not found - retrying...')
        return
      }

      console.log('Clothing products container found:', container)
      console.log('Clothing products container children:', container.children.length)

      let isDown = false
      let startX
      let scrollLeft

      const handleMouseDown = (e) => {
        console.log('Clothing products mouse down triggered on:', e.target)
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
        console.log('Clothing products mouse leave triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseUp = () => {
        console.log('Clothing products mouse up triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseMove = (e) => {
        if (!isDown) return
        console.log('Clothing products mouse move triggered')
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
        console.log('Clothing products touch start triggered')
        setIsAutoPlaying(false) // Stop auto-play on user interaction
        isDown = true
        container.style.userSelect = 'none'
        container.style.webkitUserSelect = 'none'
        startX = e.touches[0].pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
        e.preventDefault()
      }

      const handleTouchEnd = () => {
        console.log('Clothing products touch end triggered')
        isDown = false
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleTouchMove = (e) => {
        if (!isDown) return
        console.log('Clothing products touch move triggered')
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

  // Handle mouse drag/swipe functionality for kids products
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('kids-container')
      if (!container) {
        console.log('Kids products container not found - retrying...')
        return
      }

      console.log('Kids products container found:', container)
      console.log('Kids products container children:', container.children.length)

      let isDown = false
      let startX
      let scrollLeft

      const handleMouseDown = (e) => {
        console.log('Kids products mouse down triggered on:', e.target)
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
        console.log('Kids products mouse leave triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseUp = () => {
        console.log('Kids products mouse up triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseMove = (e) => {
        if (!isDown) return
        console.log('Kids products mouse move triggered')
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
        console.log('Kids products touch start triggered')
        setIsAutoPlaying(false) // Stop auto-play on user interaction
        isDown = true
        container.style.userSelect = 'none'
        container.style.webkitUserSelect = 'none'
        startX = e.touches[0].pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
        e.preventDefault()
      }

      const handleTouchEnd = () => {
        console.log('Kids products touch end triggered')
        isDown = false
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleTouchMove = (e) => {
        if (!isDown) return
        console.log('Kids products touch move triggered')
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

  // Handle mouse drag/swipe functionality for security features
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('security-features-container')
      if (!container) {
        console.log('Security features container not found - retrying...')
        return
      }

      console.log('Security features container found:', container)
      console.log('Security features container children:', container.children.length)

      let isDown = false
      let startX
      let scrollLeft

      const handleMouseDown = (e) => {
        console.log('Security features mouse down triggered on:', e.target)
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
        console.log('Security features mouse leave triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseUp = () => {
        console.log('Security features mouse up triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseMove = (e) => {
        if (!isDown) return
        console.log('Security features mouse move triggered')
        e.preventDefault()
        e.stopPropagation()
        const x = e.pageX - container.offsetLeft
        const walk = (x - startX) * 2 // Moderate scroll speed
        container.scrollLeft = scrollLeft - walk
      }

      // Add mouse event listeners with capture
      container.addEventListener('mousedown', handleMouseDown, { passive: false })
      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })
      container.addEventListener('mouseup', handleMouseUp, { passive: true })
      container.addEventListener('mousemove', handleMouseMove, { passive: false })

      // Add touch event listeners for mobile
      const handleTouchStart = (e) => {
        console.log('Security features touch start triggered')
        isDown = true
        container.style.userSelect = 'none'
        container.style.webkitUserSelect = 'none'
        startX = e.touches[0].pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
        e.preventDefault()
      }

      const handleTouchEnd = () => {
        console.log('Security features touch end triggered')
        isDown = false
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleTouchMove = (e) => {
        if (!isDown) return
        console.log('Security features touch move triggered')
        e.preventDefault()
        const x = e.touches[0].pageX - container.offsetLeft
        const walk = (x - startX) * 2 // Moderate scroll speed
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

  // Auto-play functionality for clothing products
  useEffect(() => {
    if (!isAutoPlaying || clothingProducts.length === 0) return

    const interval = setInterval(() => {
      const container = document.getElementById('clothing-container')
      if (!container) return

      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 200 // 2 products * 100px each
      } else if (screenWidth <= 768) {
        scrollAmount = 204 // 3 products * 68px each
      } else if (screenWidth <= 1024) {
        scrollAmount = 304 // 4 products * 76px each
      } else {
        scrollAmount = 344 // 4 products * 86px each
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
  }, [isAutoPlaying, clothingProducts])

  // Auto-play functionality for kids products
  useEffect(() => {
    if (!isAutoPlaying || kidsProducts.length === 0) return

    const interval = setInterval(() => {
      const container = document.getElementById('kids-container')
      if (!container) return

      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 200 // 2 products * 100px each
      } else if (screenWidth <= 768) {
        scrollAmount = 204 // 3 products * 68px each
      } else if (screenWidth <= 1024) {
        scrollAmount = 304 // 4 products * 76px each
      } else {
        scrollAmount = 344 // 4 products * 86px each
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
  }, [isAutoPlaying, kidsProducts])

  // Auto-play functionality for electronics products
  useEffect(() => {
    if (!isAutoPlaying || electronicsProducts.length === 0) return

    const interval = setInterval(() => {
      const container = document.getElementById('electronics-container')
      if (!container) return

      const screenWidth = window.innerWidth
      let scrollAmount
      
      if (screenWidth <= 480) {
        scrollAmount = 200 // 2 products * 100px each
      } else if (screenWidth <= 768) {
        scrollAmount = 204 // 3 products * 68px each
      } else if (screenWidth <= 1024) {
        scrollAmount = 304 // 4 products * 76px each
      } else {
        scrollAmount = 344 // 4 products * 86px each
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
  }, [isAutoPlaying, electronicsProducts])

  // Handle mouse drag/swipe functionality for new products
  useEffect(() => {
    // Wait for products to load and DOM to be ready
    const timer = setTimeout(() => {
      const container = document.getElementById('new-products-container')
      if (!container) {
        console.log('New products container not found - retrying...')
        return
      }

      console.log('New products container found:', container)
      console.log('New products container children:', container.children.length)

      let isDown = false
      let startX
      let scrollLeft

      const handleMouseDown = (e) => {
        console.log('New products mouse down triggered on:', e.target)
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
        console.log('New products mouse leave triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseUp = () => {
        console.log('New products mouse up triggered')
        isDown = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleMouseMove = (e) => {
        if (!isDown) return
        console.log('New products mouse move triggered')
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
        console.log('New products touch start triggered')
        isDown = true
        container.style.userSelect = 'none'
        container.style.webkitUserSelect = 'none'
        startX = e.touches[0].pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
        e.preventDefault()
      }

      const handleTouchEnd = () => {
        console.log('New products touch end triggered')
        isDown = false
        container.style.userSelect = 'auto'
        container.style.webkitUserSelect = 'auto'
      }

      const handleTouchMove = (e) => {
        if (!isDown) return
        console.log('New products touch move triggered')
        e.preventDefault()
        const x = e.touches[0].pageX - container.offsetLeft
        const walk = (x - startX) * 4 // Increase scroll speed significantly
        container.scrollLeft = scrollLeft - walk
      }

      container.addEventListener('touchstart', handleTouchStart, { passive: false })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })

      // Set initial styles
      container.style.cursor = 'grab'
      container.style.userSelect = 'auto'
      container.style.webkitUserSelect = 'auto'
      container.style.touchAction = 'pan-y'

      console.log('New products drag functionality fully initialized on container:', container)
      console.log('New products event listeners added successfully')

      // Cleanup function
      return () => {
        console.log('Cleaning up new products event listeners')
        container.removeEventListener('mousedown', handleMouseDown)
        container.removeEventListener('mouseleave', handleMouseLeave)
        container.removeEventListener('mouseup', handleMouseUp)
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchend', handleTouchEnd)
        container.removeEventListener('touchmove', handleTouchMove)
      }
    }, 1000) // Wait 1 second for DOM to be ready

    return () => clearTimeout(timer)
  }, [latestProducts]) // Re-run when products change

  // Resume auto-play after user interaction
  useEffect(() => {
    if (!isAutoPlaying) {
      const timeout = setTimeout(() => {
        setIsAutoPlaying(true)
      }, 5000) // Resume auto-play after 5 seconds of inactivity

      return () => clearTimeout(timeout)
    }
  }, [isAutoPlaying])

  // Handle window resize - reset scroll position if needed
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('featured-products-container')
      if (container) {
        // Reset to beginning if current scroll is out of bounds
        const maxScroll = container.scrollWidth - container.clientWidth
        if (container.scrollLeft > maxScroll) {
          container.scrollTo({ left: 0, behavior: 'smooth' })
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [featuredProducts])

  useEffect(() => {
    console.log('Home.jsx: Fetching featured products...')
    dispatch(fetchFeaturedProducts({ per_page: 8 }))
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchFeaturedProducts())
  }, [dispatch])

  // Fetch new products
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setIsLoadingLatest(true)
        console.log('Fetching new products...')
        
        // Get all products sorted by created_at time only - backend now supports this correctly
        try {
          // Add timestamp to prevent caching
          const timestamp = new Date().getTime()
          const response = await fetch(`${import.meta.env.VITE_API_URL}/products?sortBy=created_at&sortOrder=desc&t=${timestamp}`)
          if (response.ok) {
            const data = await response.json()
            console.log('Response data:', data)
            
            // Handle different response formats
            let products = []
            if (data.data && Array.isArray(data.data)) {
              products = data.data
            } else if (Array.isArray(data)) {
              products = data
            } else if (data.products && Array.isArray(data.products)) {
              products = data.products
            }
            
            console.log('Products sorted by TIME ONLY (backend fixed):', products)
            console.log('Total products:', products.length)
            console.log('First 3 products:', products.slice(0, 3))
            setLatestProducts(products) // No limit - show all products
          } else {
            throw new Error('First endpoint failed')
          }
        } catch (error) {
          console.log('First endpoint failed, trying alternative...')
          
          // Second try: Get all products without any filters
          const timestamp = new Date().getTime()
          const response = await fetch(`${import.meta.env.VITE_API_URL}/products?t=${timestamp}`)
          if (response.ok) {
            const data = await response.json()
            console.log('Alternative response data:', data)
            
            let products = []
            if (data.data && Array.isArray(data.data)) {
              products = data.data
            } else if (Array.isArray(data)) {
              products = data
            } else if (data.products && Array.isArray(data.products)) {
              products = data.products
            }
            
            // Sort by created_at time only (newest first) - fallback sorting
            products.sort((a, b) => {
              const dateA = new Date(a.created_at)
              const dateB = new Date(b.created_at)
              return dateB - dateA // Newest first - TIME ONLY
            })
            
            console.log('Products sorted by TIME ONLY (alternative):', products)
            console.log('Total products (alternative):', products.length)
            console.log('First 3 products (alternative):', products.slice(0, 3))
            setLatestProducts(products) // No limit - show all products
          } else {
            throw new Error('All endpoints failed')
          }
        }
        
      } catch (error) {
        console.error('Error fetching new products:', error)
        setLatestProducts([])
      } finally {
        setIsLoadingLatest(false)
      }
    }

    fetchNewProducts()
    
    // Refresh every 30 seconds to get new products
    const interval = setInterval(fetchNewProducts, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Debug logging
  useEffect(() => {
    console.log('Home.jsx: Featured products updated:', featuredProducts)
    console.log('Home.jsx: Is loading:', isLoading)
  }, [featuredProducts, isLoading])

  return (
   <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Advertisement Banner */}
      <AdvertisementBanner />

      {/* Category Banner */}
      <CategoryBanner />

      {/* Featured Products */}
      <section className="py-8 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">المنتجات المميزة</h2>
            <Link 
              to="/products?featured=true" 
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors text-xs sm:text-sm md:text-base"
            >
              <span>عرض جميع المنتجات المميزة</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="relative">
              {/* Horizontal Scroll Container */}
              <div className="relative">
                {/* Scroll Buttons */}
                <button
                  onClick={goToPreviousClothing}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -ml-4 sm:-ml-6"
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
                
                <button
                  onClick={goToNextClothing}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -mr-4 sm:-mr-6"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>

                {/* Products Container */}
                <div 
                  id="featured-products-container"
                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {Array.isArray(featuredProducts) && featuredProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="flex-none w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {!isLoading && Array.isArray(featuredProducts) && featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-amber-600 text-lg mb-4">لا توجد منتجات مميزة حالياً.</div>
              <Link 
                to="/products" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                تصفح جميع المنتجات
              </Link>
            </div>
          )}
        </div>
      </section>


      {/* New Products */}
      <section className="py-8 bg-amber-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">المنتجات الجديدة</h2>
            <Link 
              to="/products?sort=newest" 
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors text-xs sm:text-sm md:text-base"
            >
              <span>عرض جميع المنتجات الجديدة</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />
            </Link>
          </div>

          {isLoadingLatest ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : Array.isArray(latestProducts) && latestProducts.length > 0 ? (
            <div className="relative">
              {/* Horizontal Scroll Container */}
              <div className="relative">
                {/* Scroll Buttons */}
                <button
                  onClick={goToPreviousNew}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -ml-4 sm:-ml-6"
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
                
                <button
                  onClick={goToNextNew}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -mr-4 sm:-mr-6"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>

                {/* Products Container */}
                <div 
                  id="new-products-container"
                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {Array.isArray(latestProducts) && latestProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="flex-none w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-amber-600">لا توجد منتجات جديدة حالياً.</p>
            </div>
          )}
        </div>
      </section>

      {/* Clothing Section */}
      <section className="py-8 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{clothingCategoryName}</h2>
            <Link 
              to="/products?category=clothing" 
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors text-xs sm:text-sm md:text-base"
            >
              <span>عرض جميع {clothingCategoryName}</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />
            </Link>
          </div>

          {Array.isArray(clothingProducts) && clothingProducts.length > 0 ? (
            <div className="relative">
              <div className="relative">
                <button
                  onClick={goToPreviousClothing}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -ml-4 sm:-ml-6"
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
                
                <button
                  onClick={goToNextClothing}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -mr-4 sm:-mr-6"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>

                <div 
                  id="clothing-container"
                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {Array.isArray(clothingProducts) && clothingProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="flex-none w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد ملابس متاحة حالياً.</p>
            </div>
          )}
        </div>
      </section>

      {/* Kids Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{kidsCategoryName}</h2>
            <Link 
              to="/products?category=kids" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm md:text-base"
            >
              <span>عرض جميع {kidsCategoryName}</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />
            </Link>
          </div>

          {Array.isArray(kidsProducts) && kidsProducts.length > 0 ? (
            <div className="relative">
              <div className="relative">
                <button
                  onClick={goToPreviousKids}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 -ml-4 sm:-ml-6"
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
                
                <button
                  onClick={goToNextKids}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 -mr-4 sm:-mr-6"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>

                <div 
                  id="kids-container"
                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {Array.isArray(kidsProducts) && kidsProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="flex-none w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-amber-600">لا توجد منتجات بناتي وأولاد متاحة حالياً.</p>
            </div>
          )}
        </div>
      </section>

      {/* Electronics Section */}
      <section className="py-8 bg-amber-50/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{electronicsCategoryName}</h2>
            <Link 
              to="/products?category=electronics" 
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors text-xs sm:text-sm md:text-base"
            >
              <span>عرض جميع {electronicsCategoryName}</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />
            </Link>
          </div>

          {Array.isArray(electronicsProducts) && electronicsProducts.length > 0 ? (
            <div className="relative">
              <div className="relative">
                <button
                  onClick={goToPreviousElectronics}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -ml-4 sm:-ml-6"
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
                
                <button
                  onClick={goToNextElectronics}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -mr-4 sm:-mr-6"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>

                <div 
                  id="electronics-container"
                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {Array.isArray(electronicsProducts) && electronicsProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="flex-none w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-amber-600">لا توجد إلكترونيات متاحة حالياً.</p>
            </div>
          )}
        </div>
      </section>

      {/* Security Features */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-amber-50 to-orange-50" dir="rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block sm:hidden">
            {/* Mobile: Horizontal scrolling layout */}
            <div 
              id="security-features-container"
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 scroll-smooth cursor-grab"
            >
              <div className="text-center flex-none w-56 sm:w-64">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <TruckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">الشحن المجاني</h3>
                <p className="text-xs sm:text-sm text-amber-700">الشحن المجاني على جميع الطلبات فوق 50 ريال</p>
              </div>
              <div className="text-center flex-none w-56 sm:w-64">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">الدفع الآمن</h3>
                <p className="text-xs sm:text-sm text-amber-700">عملية دفع آمنة بنسبة 100%</p>
              </div>
              <div className="text-center flex-none w-56 sm:w-64">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">إرجاع سهل</h3>
                <p className="text-xs sm:text-sm text-amber-700">سياسة إرجاع 30 يوم</p>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block">
            {/* Laptop & Desktop: Full display layout */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-8">
              <div className="text-center flex-1 sm:flex-none sm:w-64 md:w-80 lg:w-96">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <TruckIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-amber-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">الشحن المجاني</h3>
                <p className="text-sm sm:text-base text-amber-700">الشحن المجاني على جميع الطلبات فوق 50 ريال</p>
              </div>
              <div className="text-center flex-1 sm:flex-none sm:w-64 md:w-80 lg:w-96">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <ShieldCheckIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">الدفع الآمن</h3>
                <p className="text-sm sm:text-base text-amber-700">عملية دفع آمنة بنسبة 100%</p>
              </div>
              <div className="text-center flex-1 sm:flex-none sm:w-64 md:w-80 lg:w-96">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <ArrowPathIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">إرجاع سهل</h3>
                <p className="text-sm sm:text-base text-amber-700">سياسة إرجاع 30 يوم</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      </div>
  )
}

export default Home
