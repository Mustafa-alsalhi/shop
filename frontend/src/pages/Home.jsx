import React, { useState, useEffect, useRef } from 'react'

import { Link } from 'react-router-dom'

import { useSelector, useDispatch } from 'react-redux'

import { ChevronLeftIcon, ChevronRightIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

import AdvertisementBanner from '../components/AdvertisementBanner'

import CategoryBanner from '../components/CategoryBanner'

import OffersBanner from '../components/OffersBanner'

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

  const [topRated, setTopRated] = useState([])

  const [topSellers, setTopSellers] = useState([])

  const [clothingProducts, setClothingProducts] = useState([])

  const [kidsProducts, setKidsProducts] = useState([])

  const [electronicsProducts, setElectronicsProducts] = useState([])

  const [categories, setCategories] = useState([])

  const [clothingCategoryName, setClothingCategoryName] = useState('الملابس')

  const [kidsCategoryName, setKidsCategoryName] = useState('بناتي وأولاد')

  const [electronicsCategoryName, setElectronicsCategoryName] = useState('الإلكترونيات')

  const [isAutoPlayingSellers, setIsAutoPlayingSellers] = useState(true)

  const [isPausedSellers, setIsPausedSellers] = useState(false)

  const sliderRef = useRef(null)

  const newProductsIntervalRef = useRef(null)

  const featuredProductsIntervalRef = useRef(null)

  const clothingIntervalRef = useRef(null)

  const kidsIntervalRef = useRef(null)

  const electronicsIntervalRef = useRef(null)

  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

const [isPausedNew, setIsPausedNew] = useState(false)

const [isPausedFeatured, setIsPausedFeatured] = useState(false)

const [isPausedClothing, setIsPausedClothing] = useState(false)

const [isPausedKids, setIsPausedKids] = useState(false)

const [isPausedElectronics, setIsPausedElectronics] = useState(false)

const topSellersIntervalRef = useRef(null)



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



  // Auto-scroll functionality for new products - DISABLED to prevent auto-refresh

  useEffect(() => {

    return

    

    const intervalId = setInterval(() => {

      if (isAutoPlaying && !isPausedNew) {

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

      }

    }, 4000) // Auto-scroll every 4 seconds



    newProductsIntervalRef.current = intervalId



    return () => clearInterval(intervalId)

  }, [isAutoPlaying, isPausedNew])



  // Auto-scroll functionality for horizontal slider

  useEffect(() => {

    if (isLoading || !Array.isArray(featuredProducts) || featuredProducts.length === 0) return

    

    const intervalId = setInterval(() => {

      if (isAutoPlaying && !isPausedFeatured) {

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

      }

    }, 4000) // Auto-scroll every 4 seconds



    featuredProductsIntervalRef.current = intervalId



    return () => clearInterval(intervalId)

  }, [isAutoPlaying, isPausedFeatured])



  // Auto-scroll functionality for top sellers
  useEffect(() => {
    if (!Array.isArray(topSellers) || topSellers.length === 0) return

    const intervalId = setInterval(() => {
      if (isAutoPlaying && !isPausedSellers) {
        const container = document.getElementById('top-sellers-container')
        if (container) {
          // Calculate scroll amount based on screen size
          const screenWidth = window.innerWidth
          let scrollAmount

          if (screenWidth <= 480) {
            scrollAmount = 200 // 1 seller card
          } else if (screenWidth <= 768) {
            scrollAmount = 316 // 1 seller card
          } else if (screenWidth <= 1024) {
            scrollAmount = 352 // 1 seller card
          } else {
            scrollAmount = 424 // 1 seller card
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
    }, 4000) // Auto-scroll every 4 seconds

    topSellersIntervalRef.current = intervalId

    return () => clearInterval(intervalId)
  }, [topSellers, isAutoPlaying, isPausedSellers])



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

          }

          if (kidsCat) {

            setKidsCategoryName(kidsCat.name)

          }

          if (electronicsCat) {

            setElectronicsCategoryName(electronicsCat.name)

          }

          

          setCategories(data)

        }

      } catch (error) {

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



  // Manual navigation for top sellers
  const goToPreviousSellers = () => {
    const container = document.getElementById('top-sellers-container')
    if (container) {
      const screenWidth = window.innerWidth
      let scrollAmount

      if (screenWidth <= 480) {
        scrollAmount = 280
      } else if (screenWidth <= 768) {
        scrollAmount = 320
      } else if (screenWidth <= 1024) {
        scrollAmount = 340
      } else {
        scrollAmount = 360
      }

      if (container.scrollLeft - scrollAmount <= 0) {
        const maxScroll = container.scrollWidth - container.clientWidth
        container.scrollTo({ left: maxScroll, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      }
    }
  }

  const goToNextSellers = () => {
    const container = document.getElementById('top-sellers-container')
    if (container) {
      const screenWidth = window.innerWidth
      let scrollAmount

      if (screenWidth <= 480) {
        scrollAmount = 280
      } else if (screenWidth <= 768) {
        scrollAmount = 320
      } else if (screenWidth <= 1024) {
        scrollAmount = 340
      } else {
        scrollAmount = 360
      }

      const maxScroll = container.scrollWidth - container.clientWidth

      if (container.scrollLeft + scrollAmount >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }
  }

  // Auto-play functionality for top sellers
  useEffect(() => {
    if (!isAutoPlayingSellers || topSellers.length === 0) return
    if (isPausedSellers) return

    const interval = setInterval(() => {
      const container = document.getElementById('top-sellers-container')
      if (!container) return

      const screenWidth = window.innerWidth
      let scrollAmount

      if (screenWidth <= 480) {
        scrollAmount = 280
      } else if (screenWidth <= 768) {
        scrollAmount = 320
      } else if (screenWidth <= 1024) {
        scrollAmount = 340
      } else {
        scrollAmount = 360
      }

      const maxScroll = container.scrollWidth - container.clientWidth

      if (container.scrollLeft + scrollAmount >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlayingSellers, topSellers, isPausedSellers])

  // Handle mouse drag/swipe functionality for top sellers
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('top-sellers-container')
      if (!container) return

      let isDown = false
      let startX
      let scrollLeft

      const handleMouseDown = (e) => {
        setIsAutoPlayingSellers(false)
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
        setIsAutoPlayingSellers(false)
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



  // Handle mouse drag/swipe functionality for categories

  useEffect(() => {

    const timer = setTimeout(() => {

      const container = document.getElementById('categories-container')

      if (!container) {

        return

      }



      let isDown = false

      let startX

      let scrollLeft



      const handleMouseEnter = (e) => {

        setIsAutoPlaying(false) // Stop auto-play on hover

      }



      const handleMouseLeave = () => {

        isDown = false

        container.style.cursor = 'grab'

        container.style.userSelect = 'auto'

        container.style.webkitUserSelect = 'auto'

        // Resume auto-play after 2 seconds

        setTimeout(() => {

          setIsAutoPlaying(true)

        }, 2000)

      }



      const handleMouseDown = (e) => {

        setIsAutoPlaying(false) // Stop auto-play on user interaction

        isDown = true

        container.style.cursor = 'grabbing'

        container.style.userSelect = 'none'

        startX = e.pageX - container.offsetLeft

        scrollLeft = container.scrollLeft

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

        setIsAutoPlaying(false) // Stop auto-play on user interaction

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

        return

      }



      let isDown = false

      let startX

      let scrollLeft



      const handleMouseDown = (e) => {

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

        setIsAutoPlaying(false) // Stop auto-play on user interaction

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

        return

      }



      let isDown = false

      let startX

      let scrollLeft



      const handleMouseDown = (e) => {

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

        setIsAutoPlaying(false) // Stop auto-play on user interaction

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

        return

      }



      let isDown = false

      let startX

      let scrollLeft



      const handleMouseDown = (e) => {

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



  // Handle mouse drag/swipe functionality for top sellers
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.getElementById('top-sellers-container')
      if (!container) {
        return
      }

      let isDown = false
      let startX
      let scrollLeft

      const handleMouseDown = (e) => {
        setIsAutoPlaying(false) // Stop auto-play on user interaction
        setIsPausedSellers(true) // Pause sellers auto-scroll
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
        // Resume auto-play after 2 seconds
        setTimeout(() => {
          setIsAutoPlaying(true)
          setIsPausedSellers(false)
        }, 2000)
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
        setIsAutoPlaying(false) // Stop auto-play on user interaction
        setIsPausedSellers(true) // Pause sellers auto-scroll
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
        // Resume auto-play after 2 seconds
        setTimeout(() => {
          setIsAutoPlaying(true)
          setIsPausedSellers(false)
        }, 2000)
      }

      const handleTouchMove = (e) => {
        if (!isDown) return
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



  // Auto-play functionality for clothing products

  useEffect(() => {

    if (!isAutoPlaying || clothingProducts.length === 0) return

    if (isPausedClothing) return



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

  }, [isAutoPlaying, isPausedClothing])



  // Auto-play functionality for kids products

  useEffect(() => {

    if (!isAutoPlaying || kidsProducts.length === 0) return

    if (isPausedKids) return



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

  }, [isAutoPlaying, isPausedKids])



  // Auto-play functionality for electronics products

  useEffect(() => {

    if (!isAutoPlaying || electronicsProducts.length === 0) return

    if (isPausedElectronics) return



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

  }, [isAutoPlaying, isPausedElectronics])



  // Handle mouse drag/swipe functionality for featured products

  useEffect(() => {

    const timer = setTimeout(() => {

      const container = document.getElementById('featured-products-container')

      if (!container) return



      let isDown = false

      let startX

      let scrollLeft



      const handleMouseDown = (e) => {

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

        const walk = (x - startX) * 4

        container.scrollLeft = scrollLeft - walk

      }



      container.addEventListener('mousedown', handleMouseDown, { passive: false })

      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })

      container.addEventListener('mouseup', handleMouseUp, { passive: true })

      container.addEventListener('mousemove', handleMouseMove, { passive: false })



      const handleTouchStart = (e) => {

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

        const walk = (x - startX) * 4

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



    return () => clearTimeout(timer)

  }, [])



  // Handle mouse drag/swipe functionality for clothing products

  useEffect(() => {

    const timer = setTimeout(() => {

      const container = document.getElementById('clothing-container')

      if (!container) return



      let isDown = false

      let startX

      let scrollLeft



      const handleMouseDown = (e) => {

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

        const walk = (x - startX) * 4

        container.scrollLeft = scrollLeft - walk

      }



      container.addEventListener('mousedown', handleMouseDown, { passive: false })

      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })

      container.addEventListener('mouseup', handleMouseUp, { passive: true })

      container.addEventListener('mousemove', handleMouseMove, { passive: false })



      const handleTouchStart = (e) => {

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

        const walk = (x - startX) * 4

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



    return () => clearTimeout(timer)

  }, [])



  // Handle mouse drag/swipe functionality for kids products

  useEffect(() => {

    const timer = setTimeout(() => {

      const container = document.getElementById('kids-container')

      if (!container) return



      let isDown = false

      let startX

      let scrollLeft



      const handleMouseDown = (e) => {

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

        const walk = (x - startX) * 4

        container.scrollLeft = scrollLeft - walk

      }



      container.addEventListener('mousedown', handleMouseDown, { passive: false })

      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })

      container.addEventListener('mouseup', handleMouseUp, { passive: true })

      container.addEventListener('mousemove', handleMouseMove, { passive: false })



      const handleTouchStart = (e) => {

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

        const walk = (x - startX) * 4

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



    return () => clearTimeout(timer)

  }, [])



  // Handle mouse drag/swipe functionality for electronics products

  useEffect(() => {

    const timer = setTimeout(() => {

      const container = document.getElementById('electronics-container')

      if (!container) return



      let isDown = false

      let startX

      let scrollLeft



      const handleMouseDown = (e) => {

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

        const walk = (x - startX) * 4

        container.scrollLeft = scrollLeft - walk

      }



      container.addEventListener('mousedown', handleMouseDown, { passive: false })

      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })

      container.addEventListener('mouseup', handleMouseUp, { passive: true })

      container.addEventListener('mousemove', handleMouseMove, { passive: false })



      const handleTouchStart = (e) => {

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

        const walk = (x - startX) * 4

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



    return () => clearTimeout(timer)

  }, [])



  // Handle mouse drag/swipe functionality for new products

  useEffect(() => {

    // Wait for products to load and DOM to be ready

    const timer = setTimeout(() => {

      const container = document.getElementById('new-products-container')

      if (!container) {

        return

      }



      let isDown = false

      let startX

      let scrollLeft



      const handleMouseDown = (e) => {

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

  }, [])



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

  }, [])



  useEffect(() => {

    dispatch(fetchFeaturedProducts({ per_page: 8 }))

  }, [dispatch])



  // Fetch best sellers and top rated products

  useEffect(() => {

    const fetchBestSellers = async () => {

      try {

        

        // Get products sorted by sold count (best sellers)

        const timestamp = new Date().getTime()

        const response = await fetch(`${import.meta.env.VITE_API_URL}/products?sortBy=sold_count&sortOrder=desc&t=${timestamp}`)

        if (response.ok) {

          const data = await response.json()

          

          let products = []

          if (data.data && Array.isArray(data.data)) {

            products = data.data

          } else if (Array.isArray(data)) {

            products = data

          } else if (data.products && Array.isArray(data.products)) {

            products = data.products

          }

          

          // Filter products to show only those with actual sales (sold_count > 0)

          const productsWithSales = products.filter(product => product.sold_count > 0)

          setBestSellers(productsWithSales.slice(0, 8)) // Show top 8 best sellers with actual sales

          setTopRated(productsWithSales.slice(0, 8)) // Use same products for top rated

        } else {

          throw new Error('Failed to fetch best sellers products')

        }

      } catch (error) {

        setBestSellers([])

        setTopRated([])

      }

    }



    fetchBestSellers()

  }, [])



  // Fetch top sellers

  useEffect(() => {

    const fetchTopSellers = async () => {

      try {

        const response = await fetch(`${import.meta.env.VITE_API_URL}/sellers/top`)

        if (response.ok) {

          const data = await response.json()

          

          let sellers = []

          if (data.data && Array.isArray(data.data)) {

            sellers = data.data

          } else if (Array.isArray(data)) {

            sellers = data

          }

          

          setTopSellers(sellers)

        } else {

          throw new Error('Failed to fetch top sellers')

        }

      } catch (error) {

        setTopSellers([])

      }

    }



    fetchTopSellers()

  }, [])



  // Fetch new products

  useEffect(() => {

    const fetchNewProducts = async () => {

      try {

        setIsLoadingLatest(true)

        

        // Get all products sorted by created_at time only - backend now supports this correctly

        try {

          // Add timestamp to prevent caching

          const timestamp = new Date().getTime()

          const response = await fetch(`${import.meta.env.VITE_API_URL}/products?sortBy=created_at&sortOrder=desc&t=${timestamp}`)

          if (response.ok) {

            const data = await response.json()

            

            // Handle different response formats

            let products = []

            if (data.data && Array.isArray(data.data)) {

              products = data.data

            } else if (Array.isArray(data)) {

              products = data

            } else if (data.products && Array.isArray(data.products)) {

              products = data.products

            }

            

            setLatestProducts(products) // No limit - show all products

          } else {

            throw new Error('First endpoint failed')

          }

        } catch (error) {

          

          // Second try: Get all products without any filters

          const timestamp = new Date().getTime()

          const response = await fetch(`${import.meta.env.VITE_API_URL}/products?t=${timestamp}`)

          if (response.ok) {

            const data = await response.json()

            

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

  }, [])






  return (

    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 overflow-x-hidden">

      {/* Advertisement Banner */}

      <AdvertisementBanner />



      {/* Category Banner */}

      <CategoryBanner />



      {/* Offers Banner */}

      <OffersBanner />



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

            <div className="relative"

              onMouseEnter={() => {

                setIsPausedFeatured(true)

                setIsAutoPlaying(false)

                if (featuredProductsIntervalRef.current) {

                  clearInterval(featuredProductsIntervalRef.current)

                }

              }}

              onMouseLeave={() => {

                console.log('Featured products section mouse leave - RESUMING AUTOPLAY IN 2 SECONDS')

                setIsPausedFeatured(false)

                setTimeout(() => {

                  console.log('Timeout - RESUMING AUTOPLAY')

                  setIsAutoPlaying(true)

                }, 2000)

              }}

            >

              {/* Horizontal Scroll Container */}

              <div className="relative overflow-hidden">

                {/* Scroll Buttons */}

                <button

                  onClick={goToPrevious}

                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -ml-4 sm:-ml-6"

                  aria-label="Scroll left"

                >

                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />

                </button>

                

                <button

                  onClick={goToNext}

                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -mr-4 sm:-mr-6"

                  aria-label="Scroll right"

                >

                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />

                </button>



                {/* Products Container */}

                <div 

                  id="featured-products-container"

                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

                  style={{

                    scrollbarWidth: 'none',

                    msOverflowStyle: 'none'

                  }}

                >

                  {Array.isArray(featuredProducts) && featuredProducts.map((product, index) => (

                    <div 

                      key={product.id} 

                      className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"

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



      {/* Top Sellers Section */}

      <section className="py-6 sm:py-8 bg-gradient-to-br from-amber-50 to-orange-50">

        <div className="container mx-auto px-3 sm:px-4">

          <div className="flex justify-between items-center mb-8 sm:mb-12 gap-4">

            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">

              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">

                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">

                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l4 4a1 1 0 001.414 0zm-1.414 8a1 1 0 00-1.414 0L8 10.586V13a1 1 0 002 0v-2.414l6.293 6.293a1 1 0 000-1.414z"/>

                  <path d="M3 15v1a1 1 0 001 1h7a1 1 0 001-1v-1H3z"/>

                </svg>

              </div>

              <div className="flex-1 sm:flex-none">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">أفضل البائعين</h2>
              </div>

            </div>

            <Link 
              to="/sellers"
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
            >
              <span>عرض جميع البائعين</span>
              <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1" />
            </Link>

          </div>



          {isLoading ? (

            <div className="flex justify-center py-12">

              <LoadingSpinner />

            </div>

          ) : (

            <div 
              className="relative"
              onMouseEnter={() => {
                setIsPausedSellers(true)
                setIsAutoPlayingSellers(false)
              }}
              onMouseLeave={() => {
                setIsPausedSellers(false)
                setTimeout(() => {
                  setIsAutoPlayingSellers(true)
                }, 2000)
              }}
            >
              <div className="relative">
                {/* Scroll Buttons */}
                <button
                  onClick={goToPreviousSellers}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -ml-2 sm:-ml-4 md:-ml-6"
                  aria-label="Scroll left"
                >
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>
                
                <button
                  onClick={goToNextSellers}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -mr-2 sm:-mr-4 md:-mr-6"
                  aria-label="Scroll right"
                >
                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </button>

                {/* Sellers Container */}
                <div 
                  id="top-sellers-container"
                  className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >

                  {topSellers.map((seller, index) => (

                    <div 

                      key={seller.id || `seller-${index}`}

                      className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group flex-shrink-0 w-[280px] sm:w-[320px] md:w-[340px] lg:w-[360px]"

                    >

                  {/* Seller Header */}

                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center space-x-3 space-x-reverse">

                        <div className="text-white">

                          <h3 className="text-lg font-bold">{seller.store_name || 'اسم المتجر'}</h3>

                          <p className="text-sm opacity-90 text-right">{seller.description || 'وصف المتجر'}</p>

                        </div>

                      </div>

                      {seller.is_verified && (

                        <div className="bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">

                          موثوق

                        </div>

                      )}

                    </div>

                  </div>



                  {/* Seller Content */}

                  <div className="p-6">

                    <div className="flex items-center space-x-4 space-x-reverse mb-4">

                      <div className="relative">

                        {seller.avatar ? (

                          <img 

                            src={seller.avatar.startsWith('http') ? seller.avatar : `${import.meta.env.VITE_API_URL.replace('/api', '')}${seller.avatar}`}

                            alt={seller.store_name}

                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"

                            onError={(e) => {

                              console.log('Image failed to load:', seller.avatar);

                              e.target.style.display = 'none';

                              e.target.nextSibling.style.display = 'flex';

                            }}

                          />

                        ) : null}

                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{display: seller.avatar ? 'none' : 'flex'}}>

                          {seller.store_name ? seller.store_name.charAt(0) : 'ب'}

                        </div>

                        {seller.is_verified && (

                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">

                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">

                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l4 4a1 1 0 001.414 0zm-1.414 8a1 1 0 00-1.414 0L8 10.586V13a1 1 0 002 0v-2.414l6.293 6.293a1 1 0 000-1.414z" clipRule="evenodd"/>

                            </svg>

                          </div>

                        )}

                      </div>

                      <div className="flex-1">

                        <div className="flex items-center gap-2 mb-2">

                          <div className="flex text-yellow-400">

                            {[...Array(5)].map((_, i) => (

                              <svg key={i} className="w-4 h-4" fill={i < Math.floor(seller.rating || 0) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">

                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>

                              </svg>

                            ))}

                          </div>

                          <span className="text-gray-600 text-sm">({seller.rating || '0.0'})</span>

                        </div>

                        <div className="text-gray-500 text-sm">

                          {seller.reviews_count || 0} تقييم

                        </div>

                      </div>

                    </div>



                    {/* Seller Stats */}

                    <div className="grid grid-cols-2 gap-4 mb-4">

                      <div className="bg-amber-50 p-3 rounded-lg text-center">

                        <div className="text-2xl font-bold text-amber-600">{seller.total_products || 0}</div>

                        <div className="text-sm text-gray-600">المنتجات</div>

                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg text-center">

                        <div className="text-2xl font-bold text-purple-600">{seller.total_sales || 0}</div>

                        <div className="text-sm text-gray-600">المبيعات</div>

                      </div>

                    </div>



                    {/* Seller Status */}

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <div className={`w-3 h-3 rounded-full ${seller.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>

                        <span className="text-sm text-gray-600">

                          {seller.status === 'active' ? 'نشط' : 'غير نشط'}

                        </span>

                      </div>

                      <Link 

                        to={`/seller/${seller.id}`}

                        className="text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors"

                      >

                        عرض التفاصيل

                      </Link>

                    </div>

                  </div>

                </div>

              ))}

              </div>

              </div>

            </div>

          )}



          {!isLoading && topSellers.length === 0 && (

            <div className="text-center py-12">

              <div className="text-amber-600 text-lg mb-4">لا يوجد بائعون حالياً.</div>

              <Link 

                to="/sellers" 

                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"

              >

                عرض جميع البائعين

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

              <span>عرض الكل</span>

              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />

            </Link>

          </div>



          {isLoadingLatest ? (

            <div className="flex justify-center py-12">

              <LoadingSpinner />

            </div>

          ) : Array.isArray(latestProducts) && latestProducts.length > 0 ? (

            <div className="relative"

              onMouseEnter={() => {

                console.log('New products section mouse enter - STOPPING AUTOPLAY')

                setIsPausedNew(true)

                setIsAutoPlaying(false)

                if (newProductsIntervalRef.current) {

                  clearInterval(newProductsIntervalRef.current)

                  console.log('New products interval cleared directly')

                }

              }}

              onMouseLeave={() => {

                console.log('New products section mouse leave - RESUMING AUTOPLAY IN 2 SECONDS')

                setIsPausedNew(false)

                setTimeout(() => {

                  console.log('Timeout - RESUMING AUTOPLAY')

                  setIsAutoPlaying(true)

                }, 2000)

              }}

            >

              {/* Horizontal Scroll Container */}

              <div className="relative overflow-hidden">

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

                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

                  style={{

                    scrollbarWidth: 'none',

                    msOverflowStyle: 'none'

                  }}

                >

                  {Array.isArray(latestProducts) && latestProducts.map((product, index) => (

                    <div 

                      key={product.id} 

                      className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"

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



      {/* Best Sellers Section */}

      <section className="py-6 sm:py-8 bg-white/70 backdrop-blur-sm">

        <div className="container mx-auto px-3 sm:px-4">

          <div className="flex justify-between items-center mb-8 sm:mb-12 gap-4">

            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">

              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">

                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">

                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>

                </svg>

              </div>

              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">المنتجات الأفضل مبيعاً</h2>

            </div>

            <Link 

              to="/products?sort=bestsellers" 

              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap"

            >

              <span>عرض الكل</span>

              <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1" />

            </Link>

          </div>



          {Array.isArray(bestSellers) && bestSellers.length > 0 ? (

            <div className="relative">

              <div className="relative">

                <button

                  onClick={() => {

                    const container = document.getElementById('bestsellers-container')

                    if (container) {

                      const screenWidth = window.innerWidth

                      let scrollAmount = screenWidth <= 480 ? 200 : screenWidth <= 768 ? 204 : screenWidth <= 1024 ? 304 : 344

                      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })

                    }

                  }}

                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -ml-4 sm:-ml-6"

                  aria-label="Scroll left"

                >

                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />

                </button>

                

                <button

                  onClick={() => {

                    const container = document.getElementById('bestsellers-container')

                    if (container) {

                      const screenWidth = window.innerWidth

                      let scrollAmount = screenWidth <= 480 ? 200 : screenWidth <= 768 ? 204 : screenWidth <= 1024 ? 304 : 344

                      const maxScroll = container.scrollWidth - container.clientWidth

                      if (container.scrollLeft + scrollAmount >= maxScroll) {

                        container.scrollTo({ left: 0, behavior: 'smooth' })

                      } else {

                        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })

                      }

                    }

                  }}

                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 -mr-4 sm:-mr-6"

                  aria-label="Scroll right"

                >

                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />

                </button>



                <div 

                  id="bestsellers-container"

                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

                  style={{

                    scrollbarWidth: 'none',

                    msOverflowStyle: 'none'

                  }}

                >

                  {Array.isArray(bestSellers) && bestSellers.map((product, index) => (

                    <div 

                      key={product.id} 

                      className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"

                    >

                      <ProductCard product={product} />

                    </div>

                  ))}

                </div>

              </div>

            </div>

          ) : (

            <div className="text-center py-12">

              <p className="text-amber-600">لا توجد منتجات الأفضل مبيعاً حالياً.</p>

            </div>

          )}

        </div>

      </section>



      {/* Top Rated Section */}


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

            <div className="relative"

              onMouseEnter={() => {

                console.log('Clothing products section mouse enter - STOPPING AUTOPLAY')

                setIsPausedClothing(true)

                setIsAutoPlaying(false)

              }}

              onMouseLeave={() => {

                console.log('Clothing products section mouse leave - RESUMING AUTOPLAY IN 2 SECONDS')

                setIsPausedClothing(false)

                setTimeout(() => {

                  console.log('Timeout - RESUMING AUTOPLAY')

                  setIsAutoPlaying(true)

                }, 2000)

              }}

            >

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

                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

                  style={{

                    scrollbarWidth: 'none',

                    msOverflowStyle: 'none'

                  }}

                >

                  {Array.isArray(clothingProducts) && clothingProducts.map((product, index) => (

                    <div 

                      key={product.id} 

                      className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"

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

            <div className="relative"

              onMouseEnter={() => {

                console.log('Kids products section mouse enter - STOPPING AUTOPLAY')

                setIsPausedKids(true)

                setIsAutoPlaying(false)

              }}

              onMouseLeave={() => {

                console.log('Kids products section mouse leave - RESUMING AUTOPLAY IN 2 SECONDS')

                setIsPausedKids(false)

                setTimeout(() => {

                  console.log('Timeout - RESUMING AUTOPLAY')

                  setIsAutoPlaying(true)

                }, 2000)

              }}

            >

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

                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

                  style={{

                    scrollbarWidth: 'none',

                    msOverflowStyle: 'none'

                  }}

                >

                  {Array.isArray(kidsProducts) && kidsProducts.map((product, index) => (

                    <div 

                      key={product.id} 

                      className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"

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

            <div className="relative"

              onMouseEnter={() => {

                console.log('Electronics products section mouse enter - STOPPING AUTOPLAY')

                setIsPausedElectronics(true)

                setIsAutoPlaying(false)

              }}

              onMouseLeave={() => {

                console.log('Electronics products section mouse leave - RESUMING AUTOPLAY IN 2 SECONDS')

                setIsPausedElectronics(false)

                setTimeout(() => {

                  console.log('Timeout - RESUMING AUTOPLAY')

                  setIsAutoPlaying(true)

                }, 2000)

              }}

            >

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

                  className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

                  style={{

                    scrollbarWidth: 'none',

                    msOverflowStyle: 'none'

                  }}

                >

                  {Array.isArray(electronicsProducts) && electronicsProducts.map((product, index) => (

                    <div 

                      key={product.id} 

                      className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"

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

