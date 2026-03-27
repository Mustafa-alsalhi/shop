import { createSlice } from '@reduxjs/toolkit'

// Initial state
const initialState = {
  // Mobile menu
  isMobileMenuOpen: false,
  
  // Search
  isSearchOpen: false,
  searchQuery: '',
  
  // Page loading
  isPageLoading: false,
  
  // Modals
  activeModal: null,
  
  // Notifications
  notifications: JSON.parse(localStorage.getItem('notifications')) || [],
  toastNotifications: [], // Separate array for toast notifications
  
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  
  // Sidebar
  sidebarOpen: false,
  
  // Cart
  isCartOpen: false,
  cartTotalItems: 0,
  
  // Breadcrumbs
  breadcrumbs: [],
  
  // Page title
  pageTitle: '',
  
  // Loading overlay
  loadingOverlay: false,
}

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Mobile menu
    openMobileMenu: (state) => {
      state.isMobileMenuOpen = true
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false
    },
    
    // Search
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen
    },
    openSearch: (state) => {
      state.isSearchOpen = true
    },
    closeSearch: (state) => {
      state.isSearchOpen = false
      state.searchQuery = ''
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    
    // Page loading
    setPageLoading: (state, action) => {
      state.isPageLoading = action.payload
    },
    
    // Modals
    openModal: (state, action) => {
      state.activeModal = action.payload
    },
    closeModal: (state) => {
      state.activeModal = null
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'info', // 'success', 'error', 'warning', 'info'
        autoClose: false, // Changed to false to keep notifications in dropdown
        duration: 5000,
        read: false, // Add read property
        timestamp: new Date().toLocaleString(), // Add timestamp
        ...action.payload,
      }
      state.notifications.push(notification)
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(state.notifications))
    },
    addToastNotification: (state, action) => {
      const toastNotification = {
        id: Date.now(),
        type: 'info', // 'success', 'error', 'warning', 'info'
        autoClose: true, // Toast notifications should auto-close
        duration: 5000,
        ...action.payload,
      }
      state.toastNotifications.push(toastNotification)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(state.notifications))
    },
    removeToastNotification: (state, action) => {
      state.toastNotifications = state.toastNotifications.filter(n => n.id !== action.payload)
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(state.notifications))
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(state.notifications))
    },
    clearNotifications: (state) => {
      state.notifications = []
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(state.notifications))
    },
    
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload
      // Save to localStorage
      localStorage.setItem('theme', action.payload)
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.theme)
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    openSidebar: (state) => {
      state.sidebarOpen = true
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false
    },
    
    // Breadcrumbs
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload)
    },
    
    // Page title
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload
      // Update document title
      document.title = `${action.payload} | E-Commerce Store`
    },
    
    // Loading overlays
    setLoadingOverlay: (state, action) => {
      const { key, loading } = action.payload
      state.loadingOverlays[key] = loading
    },
    clearLoadingOverlays: (state) => {
      state.loadingOverlays = {}
    },
    
    // Cart
    openCart: (state) => {
      state.cartIsOpen = true
    },
    closeCart: (state) => {
      state.cartIsOpen = false
    },
    toggleCart: (state) => {
      state.cartIsOpen = !state.cartIsOpen
    },
    setCartTotalItems: (state, action) => {
      state.cartTotalItems = action.payload
    },
  },
})

export const {
  openMobileMenu,
  closeMobileMenu,
  
  // Search
  toggleSearch,
  openSearch,
  closeSearch,
  setSearchQuery,
  
  // Page loading
  setPageLoading,
  
  // Modals
  openModal,
  closeModal,
  
  // Notifications
  addNotification,
  addToastNotification,
  removeNotification,
  removeToastNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  
  // Theme
  setTheme,
  toggleTheme,
  
  // Sidebar
  toggleSidebar,
  
  // Cart
  openCart,
  closeCart,
  toggleCart,
  setCartTotalItems,
} = uiSlice.actions

// Selectors
export const selectIsMobileMenuOpen = (state) => state.ui.isMobileMenuOpen
export const selectIsSearchOpen = (state) => state.ui.isSearchOpen
export const selectSearchQuery = (state) => state.ui.searchQuery
export const selectIsPageLoading = (state) => state.ui.isPageLoading
export const selectActiveModal = (state) => state.ui.activeModal
export const selectNotifications = (state) => state.ui.notifications
export const selectToastNotifications = (state) => state.ui.toastNotifications
export const selectTheme = (state) => state.ui.theme
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectCartTotalItems = (state) => state.ui.cartTotalItems
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs
export const selectPageTitle = (state) => state.ui.pageTitle
export const selectLoadingOverlay = (state) => state.ui.loadingOverlay
export const selectCartIsOpen = (state) => state.ui.cartIsOpen

// Thunks for side effects
export const showSuccessNotification = (message, options = {}) => {
  return (dispatch) => {
    // Add to toast notifications (for popup display)
    dispatch(addToastNotification({
      type: 'success',
      message,
      ...options,
    }))
    
    // Also add to dropdown notifications (for persistent storage)
    dispatch(addNotification({
      type: 'success',
      title: options.title || 'Success',
      message,
      ...options,
    }))
  }
}

export const showErrorNotification = (message, options = {}) => {
  return (dispatch) => {
    // Add to toast notifications (for popup display)
    dispatch(addToastNotification({
      type: 'error',
      message,
      ...options,
    }))
    
    // Also add to dropdown notifications (for persistent storage)
    dispatch(addNotification({
      type: 'error',
      title: options.title || 'Error',
      message,
      ...options,
    }))
  }
}

export const showInfoNotification = (message, options = {}) => {
  return (dispatch) => {
    // Add to toast notifications (for popup display)
    dispatch(addToastNotification({
      type: 'info',
      message,
      ...options,
    }))
    
    // Also add to dropdown notifications (for persistent storage)
    dispatch(addNotification({
      type: 'info',
      title: options.title || 'Info',
      message,
      ...options,
    }))
  }
}

export const showWarningNotification = (message, options = {}) => {
  return (dispatch) => {
    // Add to toast notifications (for popup display)
    dispatch(addToastNotification({
      type: 'warning',
      message,
      ...options,
    }))
    
    // Also add to dropdown notifications (for persistent storage)
    dispatch(addNotification({
      type: 'warning',
      title: options.title || 'Warning',
      message,
      ...options,
    }))
  }
}

export default uiSlice.reducer
