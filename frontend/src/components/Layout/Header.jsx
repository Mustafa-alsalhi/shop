import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingCartIcon,
  HomeIcon,
  UserIcon,
  ShoppingBagIcon,
  TagIcon,
  CubeIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  GiftIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  BellIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid'
import { useSelector as useReduxSelector } from 'react-redux'
import {
  selectIsMobileMenuOpen,
  selectIsSearchOpen,
  selectCartTotalItems,
  selectNotifications,
  openMobileMenu,
  closeMobileMenu,
  toggleSearch,
  openCart,
  showSuccessNotification,
  showErrorNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../store/slices/uiSlice'
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice'
import { selectWishlistCount, fetchWishlist } from '../../store/slices/wishlistSlice'
import { selectCartTotalItems as selectCartItemsCount } from '../../store/slices/cartSlice'
import { selectCategories, fetchCategories } from '../../store/slices/productsSlice'
import cartService from '../../services/cartService'
import { fetchCart } from '../../store/slices/cartSlice'
import { LOGO_URL, LOGO_SIZE, STORE_NAME } from '../../config/logo'

const Header = () => {
  // Logo URL - يمكنك تغيير هذا الرابط في ملف src/config/logo.js
  const logoUrl = LOGO_URL;
  const logoSize = LOGO_SIZE;
  const storeName = STORE_NAME;
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Redux state
  const isMobileMenuOpen = useSelector(selectIsMobileMenuOpen)
  const isSearchOpen = useSelector(selectIsSearchOpen)
  const cartTotalItems = useSelector(selectCartItemsCount)
  const notifications = useSelector(selectNotifications)
  const wishlistCount = useSelector(selectWishlistCount)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const categories = useSelector(selectCategories)
  
  // Local state
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false)

  // Local state
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Initialize cart and wishlist on component mount
    if (isAuthenticated) {
      dispatch(fetchWishlist())
      dispatch(fetchCart())
    }
  }, [isAuthenticated, dispatch])

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Sync cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Small delay to ensure user data is loaded
      setTimeout(() => {
        restoreCartForUser()
      }, 100)
    }
  }, [isAuthenticated, user, dispatch])

  // Auto-save cart to user-specific storage when cart changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const userEmail = user?.email || 'anonymous'
      const cartKey = `cart_${userEmail}`
      
      // Save to all user-specific locations
      localStorage.setItem(cartKey, JSON.stringify(currentCart))
      localStorage.setItem('guest_cart', JSON.stringify(currentCart))
      localStorage.setItem('last_cart_backup', JSON.stringify(currentCart))
    }
  }, [cartTotalItems, isAuthenticated, user, dispatch])

  // Restore cart for specific user
  const restoreCartForUser = async () => {
    const userEmail = user?.email || 'anonymous'
    const cartKey = `cart_${userEmail}`
    
    try {
      // Wait a bit to ensure everything is loaded
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Try multiple sources in order of preference
      let savedCart = null
      let source = ''
      
      // 1. Try user-specific cart first
      const userCart = localStorage.getItem(cartKey)
      
      if (userCart) {
        savedCart = userCart
        source = `user cart (${cartKey})`
      }
      
      // 2. Try guest cart
      if (!savedCart) {
        const guestCart = localStorage.getItem('guest_cart')
        if (guestCart) {
          savedCart = guestCart
          source = 'guest_cart'
        }
      }
      
      // 3. Try backup cart
      if (!savedCart) {
        const backupCart = localStorage.getItem('last_cart_backup')
        if (backupCart) {
          savedCart = backupCart
          source = 'last_cart_backup'
        }
      }
      
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        
        // Restore cart to localStorage FIRST
        localStorage.setItem('cart', savedCart)
        
        // Wait a bit then fetch cart to update Redux state
        setTimeout(async () => {
          await dispatch(fetchCart())
        }, 100)
        
        // Show notification with source info
        dispatch(showSuccessNotification(`مرحباً بعودتك! تم استعادة سلتك من ${source} (${cartData.length} عناصر)`))
        
        // Update all cart keys to maintain consistency
        localStorage.setItem(cartKey, savedCart)
        localStorage.setItem('guest_cart', savedCart)
        localStorage.setItem('last_cart_backup', savedCart)
        
      } else {
        dispatch(showSuccessNotification('مرحباً بعودتك! البدء بسلة فارغة'))
        // Load empty cart from database
        await dispatch(fetchCart())
      }
    } catch (error) {
      console.error('❌ Error restoring cart:', error)
      dispatch(showErrorNotification('فشل في استعادة سلتك'))
      await dispatch(fetchCart())
    }
  }

  
  // Debug mobile menu state changes
  useEffect(() => {
    console.log('isMobileMenuOpen changed to:', isMobileMenuOpen)
  }, [isMobileMenuOpen])

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobileMenuOpen) {
      dispatch(closeMobileMenu())
    }
  }, [location.pathname, dispatch])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNotificationDropdownOpen && !event.target.closest('.notification-dropdown')) {
        setIsNotificationDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isNotificationDropdownOpen])

  const handleCartClick = () => {
    // Always open cart regardless of authentication status
    dispatch(openCart())
  }

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/wishlist')
  }

  const handleSearchClick = () => {
    dispatch(toggleSearch())
  }

  const handleLogout = () => {
    // Get current cart from Redux state first (more reliable)
    const reduxCart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Save cart with user identifier for later restoration
    const userEmail = user?.email || 'anonymous'
    const cartKey = `cart_${userEmail}`
    
    // Save to multiple places for redundancy
    localStorage.setItem(cartKey, JSON.stringify(reduxCart))
    localStorage.setItem('guest_cart', JSON.stringify(reduxCart))
    localStorage.setItem('last_cart_backup', JSON.stringify(reduxCart))
    
    // Clear auth token
    localStorage.removeItem('token')
    
    // Show notification with item count
    dispatch(showSuccessNotification(`تم تسجيل الخروج! سلتك (${reduxCart.length} عناصر) محفوظة!`))
    
    // Redirect to login
    navigate('/login')
  }

  const handleMobileMenuClick = () => {
    console.log('Mobile menu clicked, current state:', isMobileMenuOpen)
    console.log('Before dispatch - isMobileMenuOpen:', isMobileMenuOpen)
    
    if (isMobileMenuOpen) {
      dispatch(closeMobileMenu())
    } else {
      dispatch(openMobileMenu())
    }
    
    console.log('After dispatch - mobile menu action called')
  }

  const handleNotificationClick = () => {
    if (!isNotificationDropdownOpen && notifications && notifications.filter(n => !n.read).length > 0) {
      // Mark all notifications as read when opening the dropdown
      dispatch(markAllNotificationsAsRead())
    }
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
  }

  const markNotificationsAsRead = () => {
    // Mark all notifications as read
    dispatch(markAllNotificationsAsRead())
    setIsNotificationDropdownOpen(false)
  }

  const markNotificationAsRead = (notification) => {
    // Use Redux action to mark as read
    dispatch(markNotificationAsRead(notification.id))
    // Don't close the dropdown - keep notifications visible
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white py-1 sm:py-2 px-2 sm:px-4" dir="rtl">
        <div className="container-custom">
          <div className="flex justify-between items-center">
            {/* Store Name */}
            <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2">
              <ShoppingBagIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" />
              <span className="text-xs sm:text-sm font-semibold text-yellow-300 hidden xs:block">متجر أصالة</span>
            </div>
            
            {/* Welcome Message */}
            <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2">
              <svg className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-yellow-300">مرحباً بكم في متجر أصالة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-lg border-b border-amber-200/20'
            : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700/95 backdrop-blur-md border-b border-amber-200/10'
        }`}
      >
      <div className="container-custom">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16" dir="rtl">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-amber-200 transition-all duration-300 transform hover:scale-105 drop-shadow-lg"
          >
            <img 
              src={logoUrl} 
              alt={storeName} 
              className="filter drop-shadow-md rounded-lg"
              style={{ width: `${logoSize.width}px`, height: `${logoSize.height}px` }}
            />
            <span className="hidden sm:inline font-bold tracking-wide">{storeName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-reverse space-x-8">
            <Link
              to="/"
              className="text-white/90 hover:text-amber-200 font-semibold transition-all duration-300 hover:scale-105 drop-shadow-sm"
            >
              الرئيسية
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
                className="text-white/90 hover:text-amber-200 font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-1 drop-shadow-sm"
              >
                <span>الفئات</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {/* Categories Dropdown Menu */}
              {categoriesOpen && (
                <div
                  onMouseEnter={() => setCategoriesOpen(true)}
                  onMouseLeave={() => setCategoriesOpen(false)}
                  className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-purple-200/30 py-2 max-h-96 overflow-y-auto"
                >
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.slug}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 font-medium"
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      لا توجد فئات متاحة
                    </div>
                  )}
                  <div className="border-t border-purple-200/30 mt-2 pt-2">
                    <button
                      onClick={() => {
                        console.log('View All Categories clicked!')
                        window.location.href = '/categories'
                      }}
                      className="block w-full text-left px-4 py-2 text-purple-700 hover:bg-purple-100 transition-all duration-200 font-semibold"
                    >
                      عرض جميع الفئات
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/products?featured=true"
              className="text-white/90 hover:text-yellow-300 font-semibold transition-all duration-300 hover:scale-105 drop-shadow-sm"
            >
              المميزة
            </Link>
            
            <Link
              to="/products"
              className="text-white/90 hover:text-yellow-300 font-semibold transition-all duration-300 hover:scale-105 drop-shadow-sm"
            >
              جميع المنتجات
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-reverse space-x-4">
            {/* Search */}
            <button
              onClick={() => dispatch(toggleSearch())}
              className="p-2 text-white/80 hover:text-yellow-300 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative notification-dropdown">
              <button
                onClick={handleNotificationClick}
                className="p-1.5 sm:p-2 text-white/80 hover:text-yellow-300 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 relative"
                aria-label="Notifications"
              >
                <BellIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                {notifications && notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 sm:h-4 sm:w-4 flex items-center justify-center animate-pulse">
                    {notifications.filter(n => !n.read).length > 99 ? '99+' : notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationDropdownOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 sm:right-0 sm:left-auto sm:transform-none mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-purple-200/30 z-50 notification-dropdown">
                  <div className="p-3 sm:p-4 border-b border-purple-200/30">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">الإشعارات</h3>
                      {notifications && notifications.filter(n => !n.read).length > 0 && (
                        <button
                          onClick={markNotificationsAsRead}
                          className="text-xs text-purple-600 hover:text-purple-700 font-bold"
                        >
                          تحديد الكل كمقروء
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                      [...notifications]
                        .sort((a, b) => b.id - a.id) // Sort by ID (newer notifications have larger IDs)
                        .slice(0, 5)
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 sm:p-4 border-b border-purple-100/30 hover:bg-purple-50/50 transition-all duration-200 cursor-pointer ${
                              !notification.read ? 'bg-purple-50/80' : ''
                            }`}
                            onClick={() => {
                              // Mark as read when clicked
                              markNotificationAsRead(notification)
                            }}
                          >
                            <div className="flex items-start space-x-2 sm:space-x-3">
                              <div className="flex-shrink-0">
                                {notification.type === 'success' && (
                                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 text-xs sm:text-sm">✓</span>
                                  </div>
                                )}
                                {notification.type === 'error' && (
                                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 text-xs sm:text-sm">!</span>
                                  </div>
                                )}
                                {notification.type === 'warning' && (
                                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-600 text-xs sm:text-sm">⚠</span>
                                  </div>
                                )}
                                {notification.type === 'info' && (
                                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 text-xs sm:text-sm">i</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-900 font-bold">
                                  {notification.title || 'Notification'}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                                  {notification.timestamp}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0">
                                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-purple-500 rounded-full animate-pulse"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-6 sm:p-8 text-center">
                        <BellIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-600">لا توجد إشعارات بعد</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications && notifications.length > 0 && (
                    <div className="p-3 sm:p-4 border-t border-purple-200/30">
                      <button
                        onClick={() => navigate('/notifications')}
                        className="w-full text-center text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-bold py-2 sm:py-0"
                      >
                        عرض جميع الإشعارات
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlistClick}
              className="p-2 text-white/80 hover:text-amber-200 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 relative"
              aria-label="Wishlist"
            >
              <HeartIcon className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="p-2 text-white/80 hover:text-amber-200 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 relative"
              aria-label="Shopping cart"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                {cartTotalItems > 0 ? (cartTotalItems > 99 ? '99+' : cartTotalItems) : '0'}
              </span>
            </button>

            {/* User Account */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-white/80 hover:text-amber-200 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105">
                    <UserIcon className="h-5 w-5" />
                    <span className="text-sm font-bold">{user?.first_name || user?.name || 'مستخدم'}</span>
                  </button>
                  
                  {/* User Dropdown */}
                  <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-amber-200/30 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 transition-all duration-200 font-bold rounded-lg"
                      >
                        <CubeIcon className="h-5 w-5 text-amber-600" />
                        <span>لوحة التحكم</span>
                      </Link>
                    )}
                    <Link
                      to="/account"
                      className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 rounded-lg"
                      onClick={(e) => {
                        // Force navigation if needed
                        if (isAuthenticated) {
                          // Use navigate as fallback
                          navigate('/account')
                        }
                      }}
                    >
                      <UserCircleIcon className="h-5 w-5 text-blue-600" />
                      <span>حسابي</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200 rounded-lg"
                    >
                      <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
                      <span>طلباتي</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 rounded-lg"
                    >
                      <HeartIcon className="h-5 w-5 text-red-600" />
                      <span>قائمة الرغبات</span>
                    </Link>
                    <div className="border-t border-gray-200/30 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-reverse space-x-3 w-full text-right px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 rounded-lg"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-600" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 p-2 text-white/80 hover:text-yellow-300 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm font-bold">تسجيل الدخول</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={handleMobileMenuClick}
              className="lg:hidden p-2 text-white/80 hover:text-yellow-300 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      </header>
    </>
  )
}

export default Header
