import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import InfoCards from './InfoCards'
import SearchOverlay from './SearchOverlay'
import CartSidebar from './CartSidebar'
import Notifications from '../UI/Notifications'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectIsSearchOpen,
  selectCartIsOpen,
  closeSearch,
} from '../../store/slices/uiSlice'

const Layout = () => {
  const dispatch = useDispatch()
  const isSearchOpen = useSelector(selectIsSearchOpen)
  const isCartOpen = useSelector(selectCartIsOpen)

  // Close overlays when clicking outside
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        dispatch(closeSearch())
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [dispatch])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} />

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Info Cards */}
      <InfoCards />

      {/* Footer */}
      <Footer />

      {/* Notifications */}
      <Notifications />
    </div>
  )
}

export default Layout
