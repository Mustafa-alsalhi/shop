import React from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser } from '../../store/slices/authSlice'
import { logoutUser } from '../../store/slices/authSlice'
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  PhotoIcon,
  CogIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  GiftIcon,
  TruckIcon,
  CreditCardIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

import NotificationBell from '../Notifications/NotificationBell'

const AdminLayout = () => {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  const menuGroups = [
    {
      title: 'الرئيسية',
      items: [
        { name: 'لوحة التحكم', path: '/admin/dashboard', icon: ChartBarIcon },
      ]
    },
    {
      title: 'إدارة المتجر',
      items: [
        { name: 'الأنشطة التجارية', path: '/admin/activities', icon: SparklesIcon },
        { name: 'المنتجات', path: '/admin/products', icon: ShoppingBagIcon },
        { name: 'الطلبات', path: '/admin/orders', icon: ChartBarIcon },
        { name: 'الفئات', path: '/admin/categories', icon: TagIcon },
      ]
    },
    {
      title: 'التسويق والمبيعات',
      items: [
        { name: 'العروض والخصومات', path: '/admin/offers', icon: GiftIcon },
        { name: 'الكوبونات', path: '/admin/coupons', icon: GiftIcon },
        { name: 'الإعلانات', path: '/admin/banners', icon: PhotoIcon },
      ]
    },
    {
      title: 'المستخدمون والتواصل',
      items: [
        { name: 'المستخدمون', path: '/admin/users', icon: UsersIcon },
        { name: 'البائعون', path: '/admin/sellers', icon: UsersIcon },
        { name: 'الدردشة', path: '/admin/chat', icon: ChatBubbleLeftIcon },
        { name: 'اتصل بنا', path: '/admin/contact-us', icon: EnvelopeIcon },
      ]
    },
    {
      title: 'العمليات المالية والتوصيل',
      items: [
        { name: 'طرق الدفع', path: '/admin/payment-methods', icon: CreditCardIcon },
        { name: 'طلبات الدفع', path: '/admin/payment-requests', icon: CreditCardIcon },
        { name: 'شركات التوصيل', path: '/admin/shipping-companies', icon: TruckIcon },
        { name: 'مناديب التوصيل', path: '/admin/drivers', icon: TruckIcon },
        { name: 'الضرائب', path: '/admin/taxes', icon: TagIcon },
      ]
    },
    {
      title: 'النظام',
      items: [
        { name: 'السياسات', path: '/admin/policies', icon: DocumentTextIcon },
        { name: 'من نحن', path: '/admin/about-us', icon: InformationCircleIcon },
        { name: 'الإعدادات', path: '/admin/settings', icon: CogIcon },
        { name: 'العودة للرئيسية', path: '/', icon: HomeIcon },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-64 sm:w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:fixed lg:inset-y-0 lg:right-0 lg:z-40
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-teal-800 bg-teal-700" dir="rtl">
          <Link 
            to="/admin/dashboard" 
            className="text-lg sm:text-xl font-bold text-white hover:text-teal-100 transition-colors duration-200"
          >
            إدارة المنصة
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-white/20 transition-colors duration-200"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 sm:mt-6 px-2 sm:px-3 pb-24" dir="rtl">
          <div className="overflow-y-auto max-h-[calc(100vh-12rem)] space-y-4 pr-1 scrollbar-thin scrollbar-thumb-teal-200 scrollbar-track-transparent">
            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-2">
                <h3 className="px-3 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex items-center px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200
                          h-10 w-full
                          ${isActive 
                            ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-500 shadow-sm' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-teal-600'
                          }
                        `}
                      >
                        <item.icon 
                          className={`
                            ml-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-colors duration-200
                            ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-500'}
                          `} 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{item.name}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100" dir="rtl">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="mr-3">
              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-24">{user?.name || 'مدير'}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-24">{user?.email || 'admin@example.com'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4 sm:h-5 sm:w-5" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pr-64 sm:pr-72 min-h-screen">
        {/* Top Header */}
        <header className="bg-teal-700 shadow-md sticky top-0 z-30">
          <div className="px-2 sm:px-4 lg:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16" dir="rtl">
              <div className="flex items-center min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-teal-100 hover:text-white hover:bg-teal-600 transition-colors duration-200"
                >
                  <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <h1 className="mr-2 sm:mr-4 text-base sm:text-lg lg:text-xl font-semibold text-white truncate">
                  {menuGroups.flatMap(g => g.items).find(item => item.path === location.pathname)?.name || 'لوحة التحكم'}
                </h1>
              </div>
              <div className="flex items-center space-x-reverse space-x-2 sm:space-x-4">
                <NotificationBell />
                <span className="hidden sm:block text-xs sm:text-sm text-teal-50 truncate">
                  مرحباً، {user?.name || 'مدير'}
                </span>
                <div className="sm:hidden w-7 h-7 sm:w-8 sm:h-8 bg-teal-600 border border-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] sm:text-xs font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
