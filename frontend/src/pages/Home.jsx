import React, { useState, useEffect, useRef } from 'react'



import { Link } from 'react-router-dom'



import { useSelector, useDispatch } from 'react-redux'



import { ChevronLeftIcon, ChevronRightIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, CheckBadgeIcon, ClockIcon, TagIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'



import AdvertisementBanner from '../components/AdvertisementBanner'



import CategoryBanner from '../components/CategoryBanner'



import OffersBanner from '../components/OffersBanner'



import ProductCard from '../components/Product/ProductCard'



import LoadingSpinner from '../components/UI/LoadingSpinner'



import { fetchFeaturedProducts, selectFeaturedProducts, selectIsLoading } from '../store/slices/productsSlice'



// 1. مكوّن هيكلي رمادي متحرك للمنتجات لمنع القفز البصري (CLS)

const ProductSkeleton = () => (

  <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full animate-pulse w-full border border-gray-100">

    <div className="w-full h-40 sm:h-48 bg-gray-200"></div>

    <div className="p-4 flex flex-col gap-3 flex-grow">

      <div className="h-4 bg-gray-200 rounded w-3/4"></div>

      <div className="h-4 bg-gray-200 rounded w-1/2"></div>

      <div className="flex justify-between items-center mt-auto pt-4">

        <div className="h-5 bg-gray-200 rounded w-1/4"></div>

        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>

      </div>

    </div>

  </div>

)



// 2. مكوّن هيكلي رمادي متحرك لقسم أفضل البائعين

const SellerSkeleton = () => (

  <div className="bg-white rounded-xl shadow-lg animate-pulse overflow-hidden flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px] flex flex-col h-[360px] border border-gray-100">

    <div className="bg-gray-200 h-24 w-full"></div>

    <div className="p-6 flex flex-col flex-grow gap-4">

      <div className="flex items-center gap-4">

        <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0"></div>

        <div className="flex-1 space-y-2">

          <div className="h-4 bg-gray-200 rounded w-3/4"></div>

          <div className="h-3 bg-gray-200 rounded w-1/2"></div>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">

        <div className="h-12 bg-gray-100 rounded"></div>

        <div className="h-12 bg-gray-100 rounded"></div>

      </div>

    </div>

  </div>

)



const Home = () => {



  const dispatch = useDispatch()



  const featuredProducts = useSelector(selectFeaturedProducts)



  const isLoading = useSelector(selectIsLoading)



  const [currentIndex, setCurrentIndex] = useState(0)



  const [latestProducts, setLatestProducts] = useState([])



  const [isLoadingLatest, setIsLoadingLatest] = useState(true)



  // حالات تحميل جديدة للأقسام لمنع ظهور الهياكل فارغة

  const [isLoadingBestSellers, setIsLoadingBestSellers] = useState(true)

  const [isLoadingTopSellers, setIsLoadingTopSellers] = useState(true)



  const [bestSellers, setBestSellers] = useState([])



  const [topRated, setTopRated] = useState([])



  const [topSellers, setTopSellers] = useState([])



  // Dynamic homepage sections state

  const [homepageSections, setHomepageSections] = useState([])

  const [isLoadingSections, setIsLoadingSections] = useState(true)



  const [categories, setCategories] = useState([])



  const [isAutoPlayingSellers, setIsAutoPlayingSellers] = useState(true)



  const [isPausedSellers, setIsPausedSellers] = useState(false)



  const sliderRef = useRef(null)



  const newProductsIntervalRef = useRef(null)



  const featuredProductsIntervalRef = useRef(null)



  // Dynamic refs for homepage sections

  const sectionRefs = useRef({})

  const sectionIntervalRefs = useRef({})

  const sectionPausedStates = useRef({})

  const bestsellersPausedState = useRef(false)

  const featuredPausedState = useRef(false)

  const securityFeaturesPausedState = useRef(false)



  const [isAutoPlaying, setIsAutoPlaying] = useState(true)



const [isPausedNew, setIsPausedNew] = useState(false)



const [isPausedFeatured, setIsPausedFeatured] = useState(false)



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



      if (isAutoPlaying && !featuredPausedState.current) {



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







  // Fetch categories and category-specific products (Dynamic)

  useEffect(() => {

    const fetchCategories = async () => {

      try {

        const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`)

        if (response.ok) {

          const data = await response.json()

          setCategories(data)

        }

      } catch (error) {

        console.error('Error fetching categories:', error)

      }

    };



    const fetchHomepageSections = async () => {

      try {

        setIsLoadingSections(true)

        const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/homepage`)

        if (response.ok) {

          const data = await response.json()

          setHomepageSections(data.data || [])

        }

      } catch (error) {

        console.error('Error fetching homepage sections:', error)

        setHomepageSections([])

      } finally {

        setIsLoadingSections(false)

      }

    };



    // استدعاء متوازي

    fetchCategories();

    fetchHomepageSections();

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



      



      const maxScroll = container.scrollWidth - container.clientWidth



      



      // Check if we're at the beginning



      if (container.scrollLeft - scrollAmount <= 0) {



        // Go to end smoothly



        container.scrollTo({ left: maxScroll, behavior: 'smooth' })



      } else {



        // Scroll normally



        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })



      }



    }



  }







  // Dynamic navigation functions for homepage sections



  const goToNextSection = (sectionId) => {



    const container = document.getElementById(`section-container-${sectionId}`)



    if (container) {



      const screenWidth = window.innerWidth



      let scrollAmount



      if (screenWidth <= 480) {



        scrollAmount = 176 // 1 product * 176px each (w-44 + gap-2)



      } else if (screenWidth <= 768) {



        scrollAmount = 208 // 1 product * 208px each (w-52 + gap-4)



      } else if (screenWidth <= 1024) {



        scrollAmount = 256 // 1 product * 256px each (w-60 + gap-4)



      } else if (screenWidth <= 1280) {



        scrollAmount = 304 // 1 product * 304px each (w-72 + gap-5)



      } else {



        scrollAmount = 352 // 1 product * 352px each (w-80 + gap-6)



      }



      const maxScroll = container.scrollWidth - container.clientWidth



      if (container.scrollLeft + scrollAmount >= maxScroll) {

        container.scrollTo({ left: 0, behavior: 'smooth' })

      } else {

        container.scrollBy({ left: scrollAmount, behavior: 'smooth' })

      }

    }

  }



  const goToPreviousSection = (sectionId) => {

    const container = document.getElementById(`section-container-${sectionId}`)

    if (container) {

      const screenWidth = window.innerWidth

      let scrollAmount

      if (screenWidth <= 480) {

        scrollAmount = 176

      } else if (screenWidth <= 768) {

        scrollAmount = 208

      } else if (screenWidth <= 1024) {

        scrollAmount = 256

      } else if (screenWidth <= 1280) {

        scrollAmount = 304

      } else {

        scrollAmount = 352

      }

      const maxScroll = container.scrollWidth - container.clientWidth

      if (container.scrollLeft - scrollAmount <= 0) {

        container.scrollTo({ left: maxScroll, behavior: 'smooth' })

      } else {

        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })

      }

    }

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







  // Handle mouse drag/swipe functionality for dynamic homepage sections

  useEffect(() => {

    const timer = setTimeout(() => {

      homepageSections.forEach((section) => {

        const container = document.getElementById(`section-container-${section.id}`)

        if (!container) return



        let isDown = false

        let startX

        let scrollLeft



        const handleMouseEnter = () => {

          sectionPausedStates.current[section.id] = true

          setIsAutoPlaying(false)

        }



        const handleMouseLeave = () => {

          isDown = false

          container.style.cursor = 'grab'

          container.style.userSelect = 'auto'

          container.style.webkitUserSelect = 'auto'

          sectionPausedStates.current[section.id] = false

          setTimeout(() => {

            setIsAutoPlaying(true)

          }, 2000)

        }



        const handleMouseDown = (e) => {

          setIsAutoPlaying(false)

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

          const walk = (x - startX) * 4

          container.scrollLeft = scrollLeft - walk

        }



        const handleTouchStart = (e) => {

          setIsAutoPlaying(false)

          isDown = true

          container.style.userSelect = 'none'

          startX = e.touches[0].pageX - container.offsetLeft

          scrollLeft = container.scrollLeft

        }



        const handleTouchEnd = () => {

          isDown = false

          container.style.userSelect = 'auto'

        }



        const handleTouchMove = (e) => {

          if (!isDown) return

          e.preventDefault()

          const x = e.touches[0].pageX - container.offsetLeft

          const walk = (x - startX) * 4

          container.scrollLeft = scrollLeft - walk

        }



        container.addEventListener('mousedown', handleMouseDown, { passive: false })

        container.addEventListener('mouseleave', handleMouseLeave, { passive: true })

        container.addEventListener('mouseup', handleMouseUp, { passive: true })

        container.addEventListener('mousemove', handleMouseMove, { passive: false })

        container.addEventListener('touchstart', handleTouchStart, { passive: false })

        container.addEventListener('touchend', handleTouchEnd, { passive: true })

        container.addEventListener('touchmove', handleTouchMove, { passive: false })



        // Store cleanup function for this section

        sectionRefs.current[section.id] = () => {

          container.removeEventListener('mousedown', handleMouseDown)

          container.removeEventListener('mouseleave', handleMouseLeave)

          container.removeEventListener('mouseup', handleMouseUp)

          container.removeEventListener('mousemove', handleMouseMove)

          container.removeEventListener('touchstart', handleTouchStart)

          container.removeEventListener('touchend', handleTouchEnd)

          container.removeEventListener('touchmove', handleTouchMove)

        }

      })

    }, 100)



    return () => {

      if (timer) clearTimeout(timer)

      // Cleanup all section event listeners

      Object.values(sectionRefs.current).forEach(cleanup => {

        if (cleanup) cleanup()

      })

    }

  }, [homepageSections])







  // Dynamic auto-play for homepage sections

  useEffect(() => {

    homepageSections.forEach((section) => {

      const intervalId = setInterval(() => {

        if (isAutoPlaying && !sectionPausedStates.current[section.id]) {

          const container = document.getElementById(`section-container-${section.id}`)

          if (container) {

            const screenWidth = window.innerWidth

            let scrollAmount

            if (screenWidth <= 480) {

              scrollAmount = 176

            } else if (screenWidth <= 768) {

              scrollAmount = 208

            } else if (screenWidth <= 1024) {

              scrollAmount = 256

            } else if (screenWidth <= 1280) {

              scrollAmount = 304

            } else {

              scrollAmount = 352

            }

            const maxScroll = container.scrollWidth - container.clientWidth

            if (container.scrollLeft + scrollAmount >= maxScroll) {

              container.scrollTo({ left: 0, behavior: 'smooth' })

            } else {

              container.scrollBy({ left: scrollAmount, behavior: 'smooth' })

            }

          }

        }

      }, 3000)



      sectionIntervalRefs.current[section.id] = intervalId

    })



    return () => {

      homepageSections.forEach((section) => {

        if (sectionIntervalRefs.current[section.id]) {

          clearInterval(sectionIntervalRefs.current[section.id])

        }

      })

    }

  }, [homepageSections, isAutoPlaying])



  // Handle mouse drag/swipe functionality for security features
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mobile container
      const mobileContainer = document.getElementById('security-features-container')
      if (mobileContainer) {
        let isDown = false
        let startX
        let scrollLeft

        const handleMouseEnter = () => {
          securityFeaturesPausedState.current = true
          setIsAutoPlaying(false)
        }

        const handleMouseDown = (e) => {
          setIsAutoPlaying(false)
          isDown = true
          mobileContainer.style.cursor = 'grabbing'
          mobileContainer.style.userSelect = 'none'
          mobileContainer.style.webkitUserSelect = 'none'
          startX = e.pageX - mobileContainer.offsetLeft
          scrollLeft = mobileContainer.scrollLeft
        }

        const handleMouseLeave = () => {
          isDown = false
          mobileContainer.style.cursor = 'grab'
          mobileContainer.style.userSelect = 'auto'
          mobileContainer.style.webkitUserSelect = 'auto'
          securityFeaturesPausedState.current = false
          setTimeout(() => {
            setIsAutoPlaying(true)
          }, 2000)
        }

        const handleMouseUp = () => {
          isDown = false
          mobileContainer.style.cursor = 'grab'
          mobileContainer.style.userSelect = 'auto'
          mobileContainer.style.webkitUserSelect = 'auto'
        }

        const handleMouseMove = (e) => {
          if (!isDown) return
          e.preventDefault()
          e.stopPropagation()
          const x = e.pageX - mobileContainer.offsetLeft
          const walk = (x - startX) * 4
          mobileContainer.scrollLeft = scrollLeft - walk
        }

        mobileContainer.addEventListener('mouseenter', handleMouseEnter, { passive: true })
        mobileContainer.addEventListener('mousedown', handleMouseDown, { passive: false })
        mobileContainer.addEventListener('mouseleave', handleMouseLeave, { passive: true })
        mobileContainer.addEventListener('mouseup', handleMouseUp, { passive: true })
        mobileContainer.addEventListener('mousemove', handleMouseMove, { passive: false })

        const handleTouchStart = (e) => {
          setIsAutoPlaying(false)
          isDown = true
          mobileContainer.style.userSelect = 'none'
          startX = e.touches[0].pageX - mobileContainer.offsetLeft
          scrollLeft = mobileContainer.scrollLeft
        }

        const handleTouchEnd = () => {
          isDown = false
          mobileContainer.style.userSelect = 'auto'
        }

        const handleTouchMove = (e) => {
          if (!isDown) return
          e.preventDefault()
          const x = e.touches[0].pageX - mobileContainer.offsetLeft
          const walk = (x - startX) * 4
          mobileContainer.scrollLeft = scrollLeft - walk
        }

        mobileContainer.addEventListener('touchstart', handleTouchStart, { passive: false })
        mobileContainer.addEventListener('touchend', handleTouchEnd, { passive: true })
        mobileContainer.addEventListener('touchmove', handleTouchMove, { passive: false })

        return () => {
          mobileContainer.removeEventListener('mouseenter', handleMouseEnter)
          mobileContainer.removeEventListener('mousedown', handleMouseDown)
          mobileContainer.removeEventListener('mouseleave', handleMouseLeave)
          mobileContainer.removeEventListener('mouseup', handleMouseUp)
          mobileContainer.removeEventListener('mousemove', handleMouseMove)
          mobileContainer.removeEventListener('touchstart', handleTouchStart)
          mobileContainer.removeEventListener('touchend', handleTouchEnd)
          mobileContainer.removeEventListener('touchmove', handleTouchMove)
        }
      }

      // Desktop container
      const desktopContainer = document.getElementById('security-features-container-desktop')
      if (desktopContainer) {
        let isDown = false
        let startX
        let scrollLeft

        const handleMouseEnter = () => {
          securityFeaturesPausedState.current = true
          setIsAutoPlaying(false)
        }

        const handleMouseDown = (e) => {
          setIsAutoPlaying(false)
          isDown = true
          desktopContainer.style.cursor = 'grabbing'
          desktopContainer.style.userSelect = 'none'
          desktopContainer.style.webkitUserSelect = 'none'
          startX = e.pageX - desktopContainer.offsetLeft
          scrollLeft = desktopContainer.scrollLeft
        }

        const handleMouseLeave = () => {
          isDown = false
          desktopContainer.style.cursor = 'grab'
          desktopContainer.style.userSelect = 'auto'
          desktopContainer.style.webkitUserSelect = 'auto'
          securityFeaturesPausedState.current = false
          setTimeout(() => {
            setIsAutoPlaying(true)
          }, 2000)
        }

        const handleMouseUp = () => {
          isDown = false
          desktopContainer.style.cursor = 'grab'
          desktopContainer.style.userSelect = 'auto'
          desktopContainer.style.webkitUserSelect = 'auto'
        }

        const handleMouseMove = (e) => {
          if (!isDown) return
          e.preventDefault()
          e.stopPropagation()
          const x = e.pageX - desktopContainer.offsetLeft
          const walk = (x - startX) * 4
          desktopContainer.scrollLeft = scrollLeft - walk
        }

        desktopContainer.addEventListener('mouseenter', handleMouseEnter, { passive: true })
        desktopContainer.addEventListener('mousedown', handleMouseDown, { passive: false })
        desktopContainer.addEventListener('mouseleave', handleMouseLeave, { passive: true })
        desktopContainer.addEventListener('mouseup', handleMouseUp, { passive: true })
        desktopContainer.addEventListener('mousemove', handleMouseMove, { passive: false })

        const handleTouchStart = (e) => {
          setIsAutoPlaying(false)
          isDown = true
          desktopContainer.style.userSelect = 'none'
          startX = e.touches[0].pageX - desktopContainer.offsetLeft
          scrollLeft = desktopContainer.scrollLeft
        }

        const handleTouchEnd = () => {
          isDown = false
          desktopContainer.style.userSelect = 'auto'
        }

        const handleTouchMove = (e) => {
          if (!isDown) return
          e.preventDefault()
          const x = e.touches[0].pageX - desktopContainer.offsetLeft
          const walk = (x - startX) * 4
          desktopContainer.scrollLeft = scrollLeft - walk
        }

        desktopContainer.addEventListener('touchstart', handleTouchStart, { passive: false })
        desktopContainer.addEventListener('touchend', handleTouchEnd, { passive: true })
        desktopContainer.addEventListener('touchmove', handleTouchMove, { passive: false })

        return () => {
          desktopContainer.removeEventListener('mouseenter', handleMouseEnter)
          desktopContainer.removeEventListener('mousedown', handleMouseDown)
          desktopContainer.removeEventListener('mouseleave', handleMouseLeave)
          desktopContainer.removeEventListener('mouseup', handleMouseUp)
          desktopContainer.removeEventListener('mousemove', handleMouseMove)
          desktopContainer.removeEventListener('touchstart', handleTouchStart)
          desktopContainer.removeEventListener('touchend', handleTouchEnd)
          desktopContainer.removeEventListener('touchmove', handleTouchMove)
        }
      }
    }, 100)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])







  // Auto-play for bestsellers section

  useEffect(() => {

    const intervalId = setInterval(() => {

      if (isAutoPlaying && !bestsellersPausedState.current) {

        const container = document.getElementById('bestsellers-container')

        if (container) {

          const screenWidth = window.innerWidth

          let scrollAmount

          if (screenWidth <= 480) {

            scrollAmount = 176

          } else if (screenWidth <= 768) {

            scrollAmount = 208

          } else if (screenWidth <= 1024) {

            scrollAmount = 256

          } else if (screenWidth <= 1280) {

            scrollAmount = 304

          } else {

            scrollAmount = 352

          }

          const maxScroll = container.scrollWidth - container.clientWidth

          if (container.scrollLeft + scrollAmount >= maxScroll) {

            container.scrollTo({ left: 0, behavior: 'smooth' })

          } else {

            container.scrollBy({ left: scrollAmount, behavior: 'smooth' })

          }

        }

      }

    }, 3000)



    return () => clearInterval(intervalId)

  }, [isAutoPlaying])







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







  // Handle mouse drag/swipe functionality for featured products



  useEffect(() => {



    const timer = setTimeout(() => {



      const container = document.getElementById('featured-products-container')



      if (!container) return







      let isDown = false



      let startX



      let scrollLeft







      const handleMouseEnter = () => {

        featuredPausedState.current = true

        setIsAutoPlaying(false)

      }



      const handleMouseLeave = () => {

        isDown = false

        container.style.cursor = 'grab'

        container.style.userSelect = 'auto'

        featuredPausedState.current = false

        setTimeout(() => {

          setIsAutoPlaying(true)

        }, 2000)

      }



      const handleMouseDown = (e) => {

        setIsAutoPlaying(false)

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

      }



      const handleMouseMove = (e) => {

        if (!isDown) return

        e.preventDefault()

        e.stopPropagation()

        const x = e.pageX - container.offsetLeft

        const walk = (x - startX) * 4

        container.scrollLeft = scrollLeft - walk

      }



      const handleTouchStart = (e) => {

        setIsAutoPlaying(false)

        isDown = true

        container.style.userSelect = 'none'

        startX = e.touches[0].pageX - container.offsetLeft

        scrollLeft = container.scrollLeft

      }



      const handleTouchEnd = () => {

        isDown = false

        container.style.userSelect = 'auto'

      }



      const handleTouchMove = (e) => {

        if (!isDown) return

        e.preventDefault()

        const x = e.touches[0].pageX - container.offsetLeft

        const walk = (x - startX) * 4

        container.scrollLeft = scrollLeft - walk

      }



      container.addEventListener('mousedown', handleMouseDown, { passive: false })

      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })

      container.addEventListener('mouseup', handleMouseUp, { passive: true })

      container.addEventListener('mousemove', handleMouseMove, { passive: false })

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



  }, [featuredProducts])







  // Handle mouse drag/swipe functionality for bestsellers



  useEffect(() => {



    const timer = setTimeout(() => {



      const container = document.getElementById('bestsellers-container')



      if (!container) return







      let isDown = false



      let startX



      let scrollLeft







      const handleMouseEnter = () => {

        bestsellersPausedState.current = true

        setIsAutoPlaying(false)

      }



      const handleMouseLeave = () => {

        isDown = false

        container.style.cursor = 'grab'

        container.style.userSelect = 'auto'

        bestsellersPausedState.current = false

        setTimeout(() => {

          setIsAutoPlaying(true)

        }, 2000)

      }



      const handleMouseDown = (e) => {

        setIsAutoPlaying(false)

        isDown = true

        container.style.cursor = 'grabbing'

        container.style.userSelect = 'none'

        container.style.webkitUserSelect = 'none'

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

        const walk = (x - startX) * 4

        container.scrollLeft = scrollLeft - walk

      }



      const handleTouchStart = (e) => {

        setIsAutoPlaying(false)

        isDown = true

        container.style.userSelect = 'none'

        startX = e.touches[0].pageX - container.offsetLeft

        scrollLeft = container.scrollLeft

      }



      const handleTouchEnd = () => {

        isDown = false

        container.style.userSelect = 'auto'

      }



      const handleTouchMove = (e) => {

        if (!isDown) return

        e.preventDefault()

        const x = e.touches[0].pageX - container.offsetLeft

        const walk = (x - startX) * 4

        container.scrollLeft = scrollLeft - walk

      }



      container.addEventListener('mousedown', handleMouseDown, { passive: false })

      container.addEventListener('mouseleave', handleMouseLeave, { passive: true })

      container.addEventListener('mouseup', handleMouseUp, { passive: true })

      container.addEventListener('mousemove', handleMouseMove, { passive: false })

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







    return () => clearTimeout(timer)



  }, [bestSellers])







  // Handle mouse drag/swipe functionality for top sellers



  useEffect(() => {



    const timer = setTimeout(() => {



      const container = document.getElementById('top-sellers-container')



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



        setIsLoadingBestSellers(true)



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



      } finally {



        setIsLoadingBestSellers(false)



      }



    }







    fetchBestSellers()



  }, [])







  // Fetch top sellers



  useEffect(() => {



    const fetchTopSellers = async () => {



      try {



        setIsLoadingTopSellers(true)

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



      } finally {



        setIsLoadingTopSellers(false)



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

      {Array.isArray(featuredProducts) && featuredProducts.length > 0 && (

      <section className="py-6 sm:py-8 bg-white/80 backdrop-blur-sm border-y border-red-200/30">



        <div className="container mx-auto px-4">



          <div className="flex flex-row-reverse justify-between items-center mb-12">



            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">المنتجات المميزة</h2>



            <Link 



              to="/products?featured=true" 



              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold transition-colors text-xs sm:text-sm md:text-base"



            >



              <span className="font-bold">عرض الكل</span>



              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />



            </Link>



          </div>



          



          {isLoading ? (



            <div className="flex gap-2 sm:gap-4 overflow-x-hidden pb-4 px-2">

              {[1, 2, 3, 4, 5].map((n) => (

                <div key={n} className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80">

                  <ProductSkeleton />

                </div>

              ))}

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



              <div className="relative"

                onMouseEnter={() => {

                  featuredPausedState.current = true

                  setIsAutoPlaying(false)

                }}

                onMouseLeave={() => {

                  featuredPausedState.current = false

                  setTimeout(() => {

                    setIsAutoPlaying(true)

                  }, 2000)

                }}

              >

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

      )}







      {/* Top Sellers Section */}

      {Array.isArray(topSellers) && topSellers.length > 0 && (

      <section className="py-6 sm:py-8 bg-white/80 backdrop-blur-sm border-y border-red-200/30">



        <div className="container mx-auto px-3 sm:px-4">



          <div className="flex flex-row-reverse justify-between items-center mb-8 sm:mb-12 gap-4">



            <div className="flex flex-row-reverse items-center gap-1.5 sm:gap-2 w-full sm:w-auto text-right">



              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">



                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">



                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l4 4a1 1 0 001.414 0zm-1.414 8a1 1 0 00-1.414 0L8 10.586V13a1 1 0 002 0v-2.414l6.293 6.293a1 1 0 000-1.414z"/>



                  <path d="M3 15v1a1 1 0 001 1h7a1 1 0 001-1v-1H3z"/>



                </svg>



              </div>



              <div className="flex-1 sm:flex-none text-right">

                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">أفضل البائعين</h2>

              </div>



            </div>



            <Link 

              to="/sellers"

              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap"

            >

              <span className="font-bold">عرض جميع البائعين</span>

              <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1" />

            </Link>



          </div>







          {isLoadingTopSellers ? (



            <div className="flex gap-4 overflow-x-hidden pb-4 px-2">

              {[1, 2, 3].map((n) => <SellerSkeleton key={n} />)}

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

                {/* Sellers Container */}

                <div 

                  id="top-sellers-container"

                  className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

                  style={{

                    scrollbarWidth: 'none',

                    msOverflowStyle: 'none'

                  }}

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



                  {topSellers.map((seller, index) => (



                    <div



                      key={seller.id || `seller-${index}`}



                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] lg:w-[340px] flex flex-col h-full border border-gray-100"



                    >



                  {/* Seller Header */}



                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 sm:p-4 flex-shrink-0">



                    <div className="flex items-center justify-between">



                      {seller.is_verified && (



                        <div className="bg-white text-green-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0">



                          موثوق



                        </div>



                      )}



                      <div className="flex items-center space-x-1 sm:space-x-3 space-x-reverse">



                        <div className="text-white">



                          <h3 className="text-sm sm:text-lg font-bold line-clamp-1" dir="rtl">{seller.store_name || 'اسم المتجر'}</h3>



                          <p className="text-[10px] sm:text-sm opacity-90 line-clamp-1 max-w-[80px] sm:max-w-none" dir="rtl">{seller.description || 'وصف المتجر'}</p>



                        </div>



                      </div>



                    </div>



                  </div>







                  {/* Seller Content */}



                  <div className="p-3 sm:p-5 flex flex-col flex-grow">



                    <div className="flex flex-row items-center space-x-2 sm:space-x-4 space-x-reverse mb-3 sm:mb-4 flex-shrink-0">



                      <div className="relative flex-shrink-0">



                        {seller.avatar ? (



                          <img



                            src={seller.avatar.startsWith('http') ? seller.avatar : `${import.meta.env.VITE_API_URL.replace('/api', '')}${seller.avatar}`}



                            alt={seller.store_name}



                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-white shadow-lg"



                            onError={(e) => {



                              e.target.style.display = 'none'



                              e.target.nextSibling.style.display = 'flex'



                            }}



                          />



                        ) : null}



                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg" style={{display: seller.avatar ? 'none' : 'flex'}}>



                          {seller.store_name ? seller.store_name.charAt(0) : 'ب'}



                        </div>



                        {seller.is_verified && (



                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 sm:p-1 rounded-full">



                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">



                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414l4 4a1 1 0 001.414 0zm-1.414 8a1 1 0 00-1.414 0L8 10.586V13a1 1 0 002 0v-2.414l6.293 6.293a1 1 0 000-1.414z" clipRule="evenodd"/>



                            </svg>



                          </div>



                        )}



                      </div>



                      <div className="flex-1 min-w-0">



                        <div className="flex flex-row items-center gap-1 sm:gap-2 mb-1">



                          <div className="flex text-yellow-500 flex-shrink-0">



                            {[...Array(5)].map((_, i) => (



                              <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4" fill={i < Math.floor(seller.rating || 0) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">



                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>



                              </svg>



                            ))}



                          </div>



                          <span className="text-gray-600 text-xs sm:text-sm">({seller.rating || '0.0'})</span>



                        </div>



                        <div className="text-gray-500 text-xs sm:text-sm">



                          {seller.reviews_count || 0} تقييم



                        </div>



                      </div>



                    </div>







                    {/* Seller Stats */}



                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 flex-shrink-0">



                      <div className="bg-amber-50/80 p-2 border border-amber-100 rounded-lg text-center">



                        <div className="text-sm sm:text-xl font-bold text-amber-600">{seller.total_products || 0}</div>



                        <div className="text-[10px] sm:text-xs text-amber-800/80 font-medium tracking-wide">المنتجات</div>



                      </div>



                      <div className="bg-amber-50/80 p-2 border border-amber-100 rounded-lg text-center">



                        <div className="text-sm sm:text-xl font-bold text-amber-600">{seller.total_sales || 0}</div>



                        <div className="text-[10px] sm:text-xs text-amber-800/80 font-medium tracking-wide">المبيعات</div>



                      </div>



                    </div>







                    {/* Spacer to fill empty space */}



                    <div className="flex-grow"></div>







                    <div className="flex flex-row items-center justify-between flex-shrink-0 pt-3 border-t border-gray-100">



                      <div className="flex items-center gap-1.5 opacity-90">



                        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-sm ${seller.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>



                        <span className="text-[10px] sm:text-xs text-gray-700 font-medium">



                          {seller.status === 'active' ? 'نشط اليوم' : 'غير نشط'}



                        </span>



                      </div>



                      <Link



                        to={`/seller/${seller.id}`}



                        className="text-amber-500 hover:text-amber-700 font-bold text-[11px] sm:text-sm transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300"



                      >



                        التفاصيل



                        <svg className="w-3 h-3 sm:w-4 sm:h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">



                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />



                        </svg>



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

      )}







      {/* New Products */}

      {Array.isArray(latestProducts) && latestProducts.length > 0 && (

      <section className="py-6 sm:py-8 bg-white/80 backdrop-blur-sm border-y border-red-200/30">



        <div className="container mx-auto px-4">



          <div className="flex flex-row-reverse justify-between items-center mb-12">



            <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">المنتجات الجديدة</h2>



            <Link 



              to="/products?sort=newest" 



              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold transition-colors text-xs sm:text-sm md:text-base"



            >



              <span>عرض الكل</span>



              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />



            </Link>



          </div>







          {isLoadingLatest ? (



            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-5 lg:gap-6 px-2">

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <ProductSkeleton key={n} />)}

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



              {/* Products Grid Container */}



              <div className="relative">



                {/* Products Container */}



                <div



                  id="new-products-container"



                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-5 lg:gap-6 px-2"



                >



                  {Array.isArray(latestProducts) && latestProducts.map((product, index) => (



                    <div



                      key={product.id}



                      className="w-full"



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

      )}







      {/* Best Sellers Section */}



      {(isLoadingBestSellers || (Array.isArray(bestSellers) && bestSellers.length > 0)) && (



      <section className="py-6 sm:py-8 bg-white/70 backdrop-blur-sm">



        <div className="container mx-auto px-3 sm:px-4">



          <div className="flex flex-row-reverse justify-between items-center mb-8 sm:mb-12 gap-4">



            <div className="flex flex-row-reverse items-center gap-1.5 sm:gap-2 w-full sm:w-auto text-right">



              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">



                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">



                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>



                </svg>



              </div>



              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">المنتجات الأفضل مبيعاً</h2>



            </div>



            <Link



              to="/products?sort=bestsellers"



              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold transition-colors text-[10px] sm:text-xs md:text-sm whitespace-nowrap"



            >



              <span>عرض الكل</span>



              <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1" />



            </Link>



          </div>







          {isLoadingBestSellers ? (



            <div className="flex gap-2 sm:gap-4 overflow-x-hidden pb-4 px-2">

              {[1, 2, 3, 4, 5].map((n) => <div key={n} className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"><ProductSkeleton /></div>)}

            </div>



          ) : (



            <div className="relative"

              onMouseEnter={() => {

                bestsellersPausedState.current = true

                setIsAutoPlaying(false)

              }}

              onMouseLeave={() => {

                bestsellersPausedState.current = false

                setTimeout(() => {

                  setIsAutoPlaying(true)

                }, 2000)

              }}

            >

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



          )}



        </div>



      </section>



      )}











      {/* Top Rated Section */}







      {/* Dynamic Homepage Sections */}

      {isLoadingSections ? (

        <section className="py-6 sm:py-8 bg-white/80 backdrop-blur-sm border-y border-red-200/30">

          <div className="container mx-auto px-4">

            <div className="flex flex-row-reverse justify-between items-center mb-12">

              <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-black">جاري التحميل...</h2>

            </div>

            <div className="flex gap-2 sm:gap-4 overflow-x-hidden pb-4 px-2">

              {[1, 2, 3, 4, 5].map((n) => <div key={n} className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"><ProductSkeleton /></div>)}

            </div>

          </div>

        </section>

      ) : Array.isArray(homepageSections) && homepageSections.length > 0 ? (

        homepageSections.map((section) => (

          <section key={section.id} className="py-6 sm:py-8 bg-white/80 backdrop-blur-sm border-y border-red-200/30">

            <div className="container mx-auto px-4">

              <div className="flex flex-row-reverse justify-between items-center mb-12">

                <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-black">{section.name}</h2>

                <Link 

                  to={`/products?category=${section.slug}`}

                  className="inline-flex items-center text-amber-600 hover:text-amber-700 font-bold transition-colors text-xs sm:text-sm md:text-base"

                >

                  <span className="font-bold">عرض جميع {section.name}</span>

                  <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1" />

                </Link>

              </div>



              {Array.isArray(section.products) && section.products.length > 0 ? (

                <div className="relative"

                  onMouseEnter={() => {

                    sectionPausedStates.current[section.id] = true

                    setIsAutoPlaying(false)

                  }}

                  onMouseLeave={() => {

                    sectionPausedStates.current[section.id] = false

                    setTimeout(() => {

                      setIsAutoPlaying(true)

                    }, 2000)

                  }}

                >

                  <div 

                    id={`section-container-${section.id}`}

                    className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

                    style={{

                      scrollbarWidth: 'none',

                      msOverflowStyle: 'none'

                    }}

                    onMouseEnter={() => {

                      sectionPausedStates.current[section.id] = true

                    }}

                    onMouseLeave={() => {

                      sectionPausedStates.current[section.id] = false

                    }}

                  >

                      {section.products.map((product) => (

                        <div

                          key={product.id}

                          className="flex-none w-44 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80"

                        >

                          <ProductCard product={product} />

                        </div>

                      ))}

                    </div>

                </div>

              ) : (

                <div className="text-center py-12">

                  <p className="text-gray-500">لا توجد منتجات {section.name} متاحة حالياً.</p>

                </div>

              )}

            </div>

          </section>

        ))

      ) : null}







      {/* Security Features */}



      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-amber-50 to-orange-50" dir="rtl">



        <div className="container mx-auto px-4 sm:px-6 lg:px-8">



          <div className="block sm:hidden">



            {/* Mobile: Horizontal scrolling layout */}



            <div className="relative"
              onMouseEnter={() => {
                securityFeaturesPausedState.current = true
                setIsAutoPlaying(false)
              }}
              onMouseLeave={() => {
                securityFeaturesPausedState.current = false
                setTimeout(() => {
                  setIsAutoPlaying(true)
                }, 2000)
              }}
            >
              <div

                id="security-features-container"

                className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}

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



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">



                  <CheckBadgeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />



                </div>



                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">منتجات أصلية</h3>



                <p className="text-xs sm:text-sm text-amber-700">ضمان الجودة 100%</p>



              </div>



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">



                  <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />



                </div>



                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">خدمة 24 ساعة</h3>



                <p className="text-xs sm:text-sm text-amber-700">دعم متواصل على مدار الساعة</p>



              </div>



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">



                  <TagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />



                </div>



                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">أسعار منافسة</h3>



                <p className="text-xs sm:text-sm text-amber-700">أفضل الأسعار في السوق</p>



              </div>



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">



                  <RocketLaunchIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />



                </div>



                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">سرعة التوصيل</h3>



                <p className="text-xs sm:text-sm text-amber-700">توصيل سريع ومضمون</p>



              </div>



            </div>



            </div>



          </div>



          



          <div className="hidden sm:block">



            {/* Laptop & Desktop: Full display layout with scroll */}



            <div className="relative"
              onMouseEnter={() => {
                securityFeaturesPausedState.current = true
                setIsAutoPlaying(false)
              }}
              onMouseLeave={() => {
                securityFeaturesPausedState.current = false
                setTimeout(() => {
                  setIsAutoPlaying(true)
                }, 2000)
              }}
            >
            <div

              id="security-features-container-desktop"

              className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 cursor-grab active:cursor-grabbing"

              style={{

                scrollbarWidth: 'none',

                msOverflowStyle: 'none'

              }}

            >



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">



                  <TruckIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-amber-600" />



                </div>



                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">الشحن المجاني</h3>



                <p className="text-sm sm:text-base text-amber-700">الشحن المجاني على جميع الطلبات فوق 50 ريال</p>



              </div>



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">



                  <ShieldCheckIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-emerald-600" />



                </div>



                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">الدفع الآمن</h3>



                <p className="text-sm sm:text-base text-amber-700">عملية دفع آمنة بنسبة 100%</p>



              </div>



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">



                  <ArrowPathIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-600" />



                </div>



                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">إرجاع سهل</h3>



                <p className="text-sm sm:text-base text-amber-700">سياسة إرجاع 30 يوم</p>



              </div>



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">



                  <CheckBadgeIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600" />



                </div>



                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">منتجات أصلية</h3>



                <p className="text-sm sm:text-base text-amber-700">ضمان الجودة 100%</p>



              </div>



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">



                  <ClockIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-600" />



                </div>



                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">خدمة 24 ساعة</h3>



                <p className="text-sm sm:text-base text-amber-700">دعم متواصل على مدار الساعة</p>



              </div>



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">



                  <TagIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600" />



                </div>



                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">أسعار منافسة</h3>



                <p className="text-sm sm:text-base text-amber-700">أفضل الأسعار في السوق</p>



              </div>



              <div className="text-center flex-none w-56 sm:w-64">



                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">



                  <RocketLaunchIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-600" />



                </div>



                <h3 className="text-lg sm:text-xl md:text-xl font-semibold mb-2">سرعة التوصيل</h3>



                <p className="text-sm sm:text-base text-amber-700">توصيل سريع ومضمون</p>



              </div>



            </div>



          </div>



        </div>



        </div>



      </section>



    </div>



  )



}







export default Home



