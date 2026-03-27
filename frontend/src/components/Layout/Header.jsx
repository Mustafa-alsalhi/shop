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

const Header = () => {
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
        dispatch(showSuccessNotification(`Welcome back! Your cart has been restored from ${source} (${cartData.length} items)`))
        
        // Update all cart keys to maintain consistency
        localStorage.setItem(cartKey, savedCart)
        localStorage.setItem('guest_cart', savedCart)
        localStorage.setItem('last_cart_backup', savedCart)
        
      } else {
        dispatch(showSuccessNotification('Welcome back! Starting with an empty cart'))
        // Load empty cart from database
        await dispatch(fetchCart())
      }
    } catch (error) {
      console.error('❌ Error restoring cart:', error)
      dispatch(showErrorNotification('Failed to restore your cart'))
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
    dispatch(showSuccessNotification(`Logged out! Your cart (${reduxCart.length} items) is saved!`))
    
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
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md border-b border-gray-200'
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            <span className="hidden sm:inline">ShopHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Home
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center space-x-1"
              >
                <span>Categories</span>
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
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto"
                >
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.slug}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No categories available
                    </div>
                  )}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={() => {
                        console.log('View All Categories clicked!')
                        window.location.href = '/categories'
                      }}
                      className="block w-full text-left px-4 py-2 text-primary-600 hover:bg-primary-50 transition-colors font-medium"
                    >
                      View All Categories
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/products?featured=true"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Featured
            </Link>
            
            <Link
              to="/products"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              All Products
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => dispatch(toggleSearch())}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative notification-dropdown">
              <button
                onClick={handleNotificationClick}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                {notifications && notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length > 99 ? '99+' : notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 notification-dropdown">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {notifications && notifications.filter(n => !n.read).length > 0 && (
                        <button
                          onClick={markNotificationsAsRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications && notifications.length > 0 ? (
                      [...notifications]
                        .sort((a, b) => b.id - a.id) // Sort by ID (newer notifications have larger IDs)
                        .slice(0, 5)
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              // Mark as read when clicked
                              markNotificationAsRead(notification)
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {notification.type === 'success' && (
                                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 text-sm">✓</span>
                                  </div>
                                )}
                                {notification.type === 'error' && (
                                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 text-sm">!</span>
                                  </div>
                                )}
                                {notification.type === 'warning' && (
                                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-yellow-600 text-sm">⚠</span>
                                  </div>
                                )}
                                {notification.type === 'info' && (
                                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-sm">i</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 font-medium">
                                  {notification.title || 'Notification'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {notification.timestamp}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0">
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-8 text-center">
                        <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications && notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate('/notifications')}
                        className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlistClick}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
              aria-label="Wishlist"
            >
              <HeartIcon className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
              aria-label="Shopping cart"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartTotalItems > 0 ? (cartTotalItems > 99 ? '99+' : cartTotalItems) : '0'}
              </span>
            </button>

            {/* User Account */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 transition-colors">
                    <UserIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">{user?.first_name}</span>
                  </button>
                  
                  {/* User Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-purple-700 hover:bg-purple-50 transition-colors font-medium"
                      >
                        🛡️ Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={(e) => {
                        // Force navigation if needed
                        if (isAuthenticated) {
                          // Use navigate as fallback
                          navigate('/account')
                        }
                      }}
                    >
                      My Account
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Wishlist
                    </Link>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={handleMobileMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-[9999] shadow-xl">
          <div className="h-full overflow-y-auto py-4">
            <div className="container-custom px-4">
              {/* Close button at top */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => dispatch(closeMobileMenu())}
                  className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                  aria-label="Close mobile menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Navigation Links */}
              <nav className="space-y-3">
                <Link
                  to="/"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors font-medium"
                  onClick={() => dispatch(closeMobileMenu())}
                >
                  <HomeIcon className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                
                {/* Categories */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-2 text-gray-700 font-semibold">
                    <TagIcon className="h-5 w-5" />
                    <span>Categories</span>
                  </div>
                  <div className="pl-4 space-y-2">
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products?category=${category.slug}`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors"
                          onClick={() => dispatch(closeMobileMenu())}
                        >
                          <CubeIcon className="h-5 w-5" />
                          <span>{category.name}</span>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        No categories available
                      </div>
                    )}
                    <button
                      onClick={() => {
                        console.log('Mobile View All Categories clicked!')
                        window.location.href = '/categories'
                        dispatch(closeMobileMenu())
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                    >
                      <TagIcon className="h-5 w-5" />
                      <span>View All Categories</span>
                    </button>
                  </div>
                </div>

                <Link
                  to="/products?featured=true"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors font-medium"
                  onClick={() => dispatch(closeMobileMenu())}
                >
                  <GiftIcon className="h-5 w-5" />
                  <span>Featured</span>
                </Link>
                
                <Link
                  to="/products"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors font-medium"
                  onClick={() => dispatch(closeMobileMenu())}
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span>All Products</span>
                </Link>
              </nav>

              {/* User Actions */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-2 text-gray-700 font-semibold">
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Welcome, {user?.first_name || user?.name || 'User'}!</span>
                    </div>
                    
                    <Link
                      to="/account"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors"
                      onClick={() => dispatch(closeMobileMenu())}
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      <span>My Account</span>
                    </Link>
                    
                    <Link
                      to="/orders"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors"
                      onClick={() => dispatch(closeMobileMenu())}
                    >
                      <ClipboardDocumentListIcon className="h-5 w-5" />
                      <span>My Orders</span>
                    </Link>
                    
                    <Link
                      to="/wishlist"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-lg transition-colors"
                      onClick={() => dispatch(closeMobileMenu())}
                    >
                      <HeartIcon className="h-5 w-5" />
                      <span>Wishlist ({wishlistCount > 0 ? wishlistCount : 0})</span>
                    </Link>
                    
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                        onClick={() => dispatch(closeMobileMenu())}
                      >
                        <CogIcon className="h-5 w-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-2 text-gray-700 font-semibold">
                      <UserIcon className="h-5 w-5" />
                      <span>Guest User</span>
                    </div>
                    
                    <Link
                      to="/login"
                      className="flex items-center justify-center space-x-3 px-4 py-3 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors font-medium"
                      onClick={() => dispatch(closeMobileMenu())}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Login</span>
                    </Link>
                    
                    <Link
                      to="/register"
                      className="flex items-center justify-center space-x-3 px-4 py-3 border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                      onClick={() => dispatch(closeMobileMenu())}
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      dispatch(toggleSearch())
                      dispatch(closeMobileMenu())
                    }}
                    className="flex flex-col items-center p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Search</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleWishlistClick()
                      dispatch(closeMobileMenu())
                    }}
                    className="flex flex-col items-center p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                  >
                    <HeartIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      handleCartClick()
                      dispatch(closeMobileMenu())
                    }}
                    className="flex flex-col items-center p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Cart</span>
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartTotalItems > 0 ? (cartTotalItems > 99 ? '99+' : cartTotalItems) : '0'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
