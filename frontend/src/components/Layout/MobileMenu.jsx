import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import {
  selectIsMobileMenuOpen,
  closeMobileMenu,
} from '../../store/slices/uiSlice'
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice'

const MobileMenu = ({ isOpen }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  const handleClose = () => {
    dispatch(closeMobileMenu())
  }

  const handleLinkClick = (path) => {
    navigate(path)
    handleClose()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
        onClick={handleClose}
      />

      {/* Menu */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          {isAuthenticated && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {user?.first_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user?.full_name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleLinkClick('/')}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>Home</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </li>
              
              <li>
                <button
                  onClick={() => handleLinkClick('/products')}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>All Products</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick('/categories')}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>Categories</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick('/products?featured=true')}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>Featured Products</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick('/deals')}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>Deals & Offers</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </li>
            </ul>

            {/* Account Section */}
            {isAuthenticated ? (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  My Account
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleLinkClick('/account')}
                      className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span>My Profile</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLinkClick('/orders')}
                      className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span>My Orders</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLinkClick('/wishlist')}
                      className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span>Wishlist</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLinkClick('/cart')}
                      className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span>Shopping Cart</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span>Logout</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Account
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleLinkClick('/login')}
                      className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span>Login</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLinkClick('/register')}
                      className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span>Register</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Help
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleLinkClick('/contact')}
                    className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span>Contact Us</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLinkClick('/faq')}
                    className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span>FAQ</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLinkClick('/about')}
                    className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span>About Us</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

export default MobileMenu
