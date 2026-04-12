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
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={handleClose}
      />

      {/* Menu */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-white to-gray-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden" dir="rtl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
            <h2 className="text-xl font-bold flex items-center space-x-reverse space-x-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>القائمة</span>
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          {isAuthenticated && (
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center space-x-reverse space-x-4">
                <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user?.first_name?.charAt(0) || 'م'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">{user?.full_name || user?.first_name + ' ' + user?.last_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6">
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleLinkClick('/')}
                  className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="font-medium">الرئيسية</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                </button>
              </li>
              
              <li>
                <button
                  onClick={() => handleLinkClick('/products')}
                  className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="font-medium">جميع المنتجات</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick('/categories')}
                  className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <span className="font-medium">الفئات</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick('/products?featured=true')}
                  className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <span className="font-medium">المنتجات المميزة</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleLinkClick('/deals')}
                  className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-reverse space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                      <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">العروض والخصومات</span>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                </button>
              </li>
            </ul>

            {/* Account Section */}
            {isAuthenticated ? (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-reverse space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>حسابي</span>
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleLinkClick('/account')}
                      className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                          <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <span className="font-medium">ملفي الشخصي</span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLinkClick('/orders')}
                      className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <span className="font-medium">طلباتي</span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLinkClick('/wishlist')}
                      className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">قائمة الرغبات</span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLinkClick('/cart')}
                      className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                          <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">سلة التسوق</span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </button>
                  </li>
                  
                  {/* Admin Dashboard Link - Only for Admins */}
                  {user?.role === 'admin' && (
                    <li>
                      <button
                        onClick={() => handleLinkClick('/admin/dashboard')}
                        className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center space-x-reverse space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <span className="font-medium">لوحة التحكم</span>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </button>
                    </li>
                  )}
                  
                  {/* Coupons Link - For All Users */}
                  <li>
                    <button
                      onClick={() => handleLinkClick('/coupons')}
                      className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                        </div>
                        <span className="font-medium">الكوبونات</span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-4 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span className="font-medium">تسجيل الخروج</span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-red-700 transition-colors" />
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-reverse space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>الحساب</span>
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleLinkClick('/login')}
                      className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                          <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span className="font-medium">تسجيل الدخول</span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleLinkClick('/register')}
                      className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-reverse space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </div>
                        <span className="font-medium">إنشاء حساب</span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-reverse space-x-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>المساعدة</span>
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleLinkClick('/contact')}
                    className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                        <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">اتصل بنا</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLinkClick('/faq')}
                    className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">الأسئلة الشائعة</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleLinkClick('/about')}
                    className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center space-x-reverse space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                        <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">من نحن</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
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
