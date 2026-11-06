import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  ShoppingBagIcon,
  CubeIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import {
  selectIsMobileMenuOpen,
  selectIsSearchOpen,
  openMobileMenu,
  closeMobileMenu,
  toggleSearch,
  openCart,
  showSuccessNotification,
  showErrorNotification,
} from '../../store/slices/uiSlice'
import { fetchNotifications, markNotificationAsRead as markNotificationAsReadAPI, markAllNotificationsAsRead as markAllNotificationsAsReadAPI, selectNotifications } from '../../store/slices/notificationsSlice'
import { selectIsAuthenticated, selectUser, logoutUser } from '../../store/slices/authSlice'
import { selectWishlistCount, fetchWishlist } from '../../store/slices/wishlistSlice'
import { selectCartTotalItems as selectCartItemsCount, fetchCart } from '../../store/slices/cartSlice'
import activityService from '../../services/activityService'
import { useSettings } from '../../contexts/SettingsContext'

const Header = () => {
  const { storeLogo, storeName } = useSettings()

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

  // Local state
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false)
  const [activitiesOpen, setActivitiesOpen] = useState(false)
  const [activitiesList, setActivitiesList] = useState([])
  const [currentActivityMode, setCurrentActivityMode] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab) return tab === 'store' ? 'stores' : tab
    return localStorage.getItem('preferred_activity_mode') || 'stores'
  })

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch activities on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await activityService.getActivities()
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setActivitiesList(res.data)
        } else {
          setActivitiesList([
            { id: 1, name: 'المطاعم والوجبات', slug: 'restaurant', icon: '🍔' },
            { id: 2, name: 'الكافيهات والحلويات', slug: 'cafe', icon: '☕' },
            { id: 3, name: 'المخابز والمعجنات', slug: 'bakery', icon: '🥖' }
          ])
        }
      } catch (error) {
        console.error('Error fetching activities in Header:', error)
        setActivitiesList([
          { id: 1, name: 'المطاعم والوجبات', slug: 'restaurant', icon: '🍔' }
        ])
      }
    }
    fetchActivities()
  }, [])

  // Sync currentActivityMode with URL search params and custom event
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab) {
      setCurrentActivityMode(tab === 'store' ? 'stores' : tab)
    }
  }, [location.search])

  useEffect(() => {
    const handleModeChangeEvent = (e) => {
      if (e.detail) {
        setCurrentActivityMode(e.detail === 'store' ? 'stores' : e.detail)
      }
    }
    window.addEventListener('activityModeChanged', handleModeChangeEvent)
    return () => window.removeEventListener('activityModeChanged', handleModeChangeEvent)
  }, [])

  useEffect(() => {
    // Initialize cart and wishlist on component mount
    if (isAuthenticated) {
      dispatch(fetchWishlist())
      dispatch(fetchCart())
    }
  }, [isAuthenticated, dispatch])

  // Fetch notifications on component mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications())
    }
  }, [isAuthenticated, dispatch])

  // Sync cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
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
      await new Promise(resolve => setTimeout(resolve, 50))

      let savedCart = null
      let source = ''

      const userCart = localStorage.getItem(cartKey)

      if (userCart) {
        savedCart = userCart
        source = `user cart (${cartKey})`
      }

      if (!savedCart) {
        const guestCart = localStorage.getItem('guest_cart')
        if (guestCart) {
          savedCart = guestCart
          source = 'guest_cart'
        }
      }

      if (!savedCart) {
        const backupCart = localStorage.getItem('last_cart_backup')
        if (backupCart) {
          savedCart = backupCart
          source = 'last_cart_backup'
        }
      }

      if (savedCart) {
        const cartData = JSON.parse(savedCart)

        localStorage.setItem('cart', savedCart)

        setTimeout(async () => {
          await dispatch(fetchCart())
        }, 100)

        dispatch(showSuccessNotification(`مرحباً بعودتك! تم استعادة سلتك من ${source} (${cartData.length} عناصر)`))

        localStorage.setItem(cartKey, savedCart)
        localStorage.setItem('guest_cart', savedCart)
        localStorage.setItem('last_cart_backup', savedCart)
      } else {
        dispatch(showSuccessNotification('مرحباً بعودتك! البدء بسلة فارغة'))
        await dispatch(fetchCart())
      }
    } catch (error) {
      console.error('❌ Error restoring cart:', error)
      dispatch(showErrorNotification('فشل في استعادة سلتك'))
      await dispatch(fetchCart())
    }
  }

  // Close mobile menu and dropdown when route changes
  useEffect(() => {
    if (isMobileMenuOpen) {
      dispatch(closeMobileMenu())
    }
    setActivitiesOpen(false)
  }, [location.pathname, location.search, dispatch])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNotificationDropdownOpen && !event.target.closest('.notification-dropdown')) {
        setIsNotificationDropdownOpen(false)
      }
      if (activitiesOpen && !event.target.closest('.activities-dropdown')) {
        setActivitiesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isNotificationDropdownOpen, activitiesOpen])

  const handleSelectActivity = (mode) => {
    const normalized = mode === 'store' ? 'stores' : mode
    setCurrentActivityMode(normalized)
    localStorage.setItem('preferred_activity_mode', normalized)
    window.dispatchEvent(new CustomEvent('activityModeChanged', { detail: normalized }))
    setActivitiesOpen(false)

    if (normalized === 'stores') {
      navigate('/?tab=stores')
    } else {
      navigate(`/?tab=${normalized}`)
    }
  }

  const handleCartClick = () => {
    dispatch(openCart())
  }

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/wishlist')
  }

  const handleLogout = async () => {
    const reduxCart = JSON.parse(localStorage.getItem('cart') || '[]')

    const userEmail = user?.email || 'anonymous'
    const cartKey = `cart_${userEmail}`

    localStorage.setItem(cartKey, JSON.stringify(reduxCart))
    localStorage.setItem('guest_cart', JSON.stringify(reduxCart))
    localStorage.setItem('last_cart_backup', JSON.stringify(reduxCart))

    dispatch(showSuccessNotification(`تم تسجيل الخروج! سلتك (${reduxCart.length} عناصر) محفوظة!`))

    await dispatch(logoutUser())

    navigate('/login')
  }

  const handleMobileMenuClick = () => {
    if (isMobileMenuOpen) {
      dispatch(closeMobileMenu())
    } else {
      dispatch(openMobileMenu())
    }
  }

  const handleNotificationClick = () => {
    if (!isNotificationDropdownOpen && notifications && notifications.filter(n => !n.read).length > 0) {
      dispatch(markAllNotificationsAsReadAPI())
    }
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
  }

  const markNotificationsAsRead = () => {
    dispatch(markAllNotificationsAsReadAPI())
    setIsNotificationDropdownOpen(false)
  }

  const markNotificationAsRead = (notification) => {
    dispatch(markNotificationAsReadAPI(notification.id))
  }

  return (
    <>
      {/* Main Header */}
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-lg border-b border-amber-200/20'
            : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700/95 backdrop-blur-md border-b border-amber-200/10'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-[60px] sm:h-16 md:h-20" dir="rtl">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 text-2xl font-bold text-white hover:text-amber-200 transition-all duration-300 transform hover:scale-105 drop-shadow-lg shrink-0 max-w-[60%] sm:max-w-none"
            >
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[120px] sm:max-w-[160px] md:max-w-[200px] object-contain filter drop-shadow-md shrink-0 -ml-1"
                />
              ) : (
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <ShoppingBagIcon className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide truncate whitespace-nowrap">{storeName}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-reverse space-x-8">
              <Link
                to="/"
                className="text-white/90 hover:text-amber-200 font-semibold transition-all duration-300 hover:scale-105 drop-shadow-sm"
              >
                الرئيسية
              </Link>

              {/* Activities Dropdown (الأنشطة بدلاً من الفئات) */}
              <div
                className="relative activities-dropdown"
                onMouseEnter={() => setActivitiesOpen(true)}
                onMouseLeave={() => setActivitiesOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setActivitiesOpen((prev) => !prev)}
                  className="text-white/90 hover:text-amber-200 font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-1.5 drop-shadow-sm py-2"
                >
                  <span>الأنشطة</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${activitiesOpen ? 'rotate-180' : ''}`}
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

                {/* Activities Dropdown Menu */}
                {activitiesOpen && (
                  <div className="absolute top-full right-0 pt-1 w-64 z-50">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-200/40 py-2 max-h-96 overflow-y-auto">
                      {/* 1. المتاجر الإلكترونية */}
                      <button
                        type="button"
                        onClick={() => handleSelectActivity('stores')}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-right transition-all duration-200 font-bold text-sm ${
                          currentActivityMode === 'stores'
                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-r-4 border-amber-500'
                            : 'text-gray-700 hover:bg-amber-50/70 hover:text-amber-700'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-lg">🛍️</span>
                          <span>المتاجر الإلكترونية</span>
                        </span>
                        {currentActivityMode === 'stores' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        )}
                      </button>

                      {/* 2. الأنشطة التجارية المضافة */}
                      {activitiesList.map((act) => {
                        const isActive =
                          currentActivityMode === act.slug ||
                          (currentActivityMode === 'restaurants' && act.slug === 'restaurant')
                        return (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => handleSelectActivity(act.slug)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-right transition-all duration-200 font-bold text-sm ${
                              isActive
                                ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700 border-r-4 border-orange-500'
                                : 'text-gray-700 hover:bg-amber-50/70 hover:text-orange-700'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="text-lg">{act.icon || '✨'}</span>
                              <span>{act.name}</span>
                            </span>
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            )}
                          </button>
                        )
                      })}
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

              <Link
                to="/sellers"
                className="text-white/90 hover:text-yellow-300 font-semibold transition-all duration-300 hover:scale-105 drop-shadow-sm"
              >
                جميع المتاجر
              </Link>

              <Link
                to="/offers"
                className="text-white/90 hover:text-yellow-300 font-semibold transition-all duration-300 hover:scale-105 drop-shadow-sm"
              >
                العروض والخصومات
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Search */}
              <button
                onClick={() => dispatch(toggleSearch())}
                className="p-1.5 sm:p-2 text-white/80 hover:text-yellow-300 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110"
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
                  <BellIcon className="h-5 w-5" />
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
                          .sort((a, b) => b.id - a.id)
                          .slice(0, 5)
                          .map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 sm:p-4 border-b border-purple-100/30 hover:bg-purple-50/50 transition-all duration-200 cursor-pointer ${
                                !notification.read ? 'bg-purple-50/80' : ''
                              }`}
                              onClick={() => {
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
                className="p-1.5 sm:p-2 text-white/80 hover:text-amber-200 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 relative"
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
                className="p-1.5 sm:p-2 text-white/80 hover:text-amber-200 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 relative"
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
                      {(user?.role === 'admin' || user?.role === 'administrator') && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 transition-all duration-200 font-bold rounded-lg"
                        >
                          <CubeIcon className="h-5 w-5 text-amber-600" />
                          <span>لوحة التحكم</span>
                        </Link>
                      )}
                      {user?.role === 'seller' && (
                        <Link
                          to="/seller/dashboard"
                          className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 transition-all duration-200 font-bold rounded-lg"
                        >
                          <ShoppingBagIcon className="h-5 w-5 text-amber-600" />
                          <span>لوحة البائع</span>
                        </Link>
                      )}
                      {user?.role === 'driver' && (
                        <Link
                          to="/driver/orders"
                          className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 transition-all duration-200 font-bold rounded-lg"
                        >
                          <ClipboardDocumentListIcon className="h-5 w-5 text-amber-600" />
                          <span>لوحة المندوب</span>
                        </Link>
                      )}
                      <Link
                        to="/account"
                        className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 rounded-lg"
                        onClick={() => {
                          if (isAuthenticated) {
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
                        to="/orders"
                        className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-200 rounded-lg"
                      >
                        <TruckIcon className="h-5 w-5 text-orange-600" />
                        <span>تتبع الطلب</span>
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
                className="lg:hidden p-1.5 sm:p-2 text-white/80 hover:text-yellow-300 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110"
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
