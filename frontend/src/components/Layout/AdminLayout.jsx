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
  PhotoIcon,
  CogIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  GiftIcon
} from '@heroicons/react/24/outline'

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

  const menuItems = [
    {
      name: 'لوحة التحكم',
      path: '/admin/dashboard',
      icon: HomeIcon,
      description: 'نظرة عامة وإحصائيات'
    },
    {
      name: 'المنتجات',
      path: '/admin/products',
      icon: ShoppingBagIcon,
      description: 'إدارة المنتجات'
    },
    {
      name: 'الطلبات',
      path: '/admin/orders',
      icon: ChartBarIcon,
      description: 'إدارة الطلبات'
    },
    {
      name: 'المستخدمون',
      path: '/admin/users',
      icon: UsersIcon,
      description: 'إدارة المستخدمين'
    },
    {
      name: 'الإعلانات',
      path: '/admin/banners',
      icon: PhotoIcon,
      description: 'إدارة الإعلانات'
    },
    {
      name: 'الكوبونات',
      path: '/admin/coupons',
      icon: GiftIcon,
      description: 'إدارة كوبونات الخصم'
    },
    {
      name: 'الفئات',
      path: '/admin/categories',
      icon: TagIcon,
      description: 'إدارة الفئات'
    },
    {
      name: 'الإعدادات',
      path: '/admin/settings',
      icon: CogIcon,
      description: 'إعدادات النظام'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:fixed lg:inset-y-0 lg:right-0 lg:z-40
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b" dir="rtl">
          <Link to="/admin/dashboard" className="text-xl font-bold text-gray-900">
            لوحة التحكم
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3" dir="rtl">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon 
                    className={`
                      ml-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                    `} 
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-0.5 h-6 bg-blue-700 rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" dir="rtl">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="mr-3">
              <div className="text-sm font-medium text-gray-900">{user?.name || 'مدير'}</div>
              <div className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pr-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b lg:border-r sticky top-0 z-30">
          <div className="px-2 sm:px-4 lg:px-6">
            <div className="flex justify-between items-center h-16" dir="rtl">
              <div className="flex items-center min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="mr-2 sm:mr-4 text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {menuItems.find(item => item.path === location.pathname)?.name || 'لوحة التحكم'}
                </h1>
              </div>
              <div className="flex items-center space-x-reverse space-x-2 sm:space-x-reverse space-x-4">
                <span className="hidden sm:block text-sm text-gray-600 truncate">
                  مرحباً، {user?.name || 'مدير'}
                </span>
                <div className="sm:hidden w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
