import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  TagIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CurrencyDollarIcon,
  GiftIcon,
  SparklesIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import NotificationBell from '../Notifications/NotificationBell'

const SellerLayout = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const menuItems = [
    { path: '/seller/dashboard', icon: ChartBarIcon, label: 'لوحة التحكم', description: 'نظرة عامة' },
    { path: '/seller/products', icon: ShoppingBagIcon, label: 'منتجاتي', description: 'إدارة المنتجات' },
    { path: '/seller/orders', icon: ShoppingCartIcon, label: 'الطلبات', description: 'تتبع الطلبات' },
    { path: '/seller/chat', icon: ChatBubbleLeftIcon, label: 'الرسائل', description: 'الدردشة مع العملاء' },
    { path: '/seller/reports', icon: DocumentTextIcon, label: 'التقارير والإحصائيات', description: 'تحليل الأداء' },
    { path: '/seller/offers', icon: SparklesIcon, label: 'العروض والخصومات', description: 'إدارة العروض' },
    { path: '/seller/coupons', icon: GiftIcon, label: 'الكوبونات', description: 'إدارة الكوبونات' },
    { path: '/seller/payment-requests', icon: CurrencyDollarIcon, label: 'طلبات الدفع', description: 'إدارة الدفعات' },
    { path: '/seller/categories', icon: TagIcon, label: 'فئات المتجر', description: 'تنظيم الفئات' },
    { path: '/seller/settings', icon: Cog6ToothIcon, label: 'الإعدادات', description: 'إعدادات الحساب' },
  ]

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 rtl" dir="rtl">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-amber-600 to-amber-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-shrink-0
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-amber-500/30">
              <div>
                <h1 className="text-xl font-bold text-white">لوحة البائع</h1>
                <p className="text-amber-200 text-sm mt-1">{user?.name || 'البائع'}</p>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell userRole="seller" className="hidden lg:block text-white [&>button]:text-amber-100 hover:[&>button]:text-white hover:[&>button]:bg-amber-500/50" />
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-amber-500/50 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-amber-100 hover:bg-amber-500/30 transition-all duration-200 mb-4"
              >
                <HomeIcon className="w-5 h-5" />
                <span>العودة للمتجر</span>
              </Link>
              
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive(item.path) 
                      ? 'bg-white text-amber-700 shadow-lg' 
                      : 'text-amber-100 hover:bg-amber-500/30'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-amber-600' : ''}`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <p className={`text-xs mt-0.5 ${isActive(item.path) ? 'text-amber-600' : 'text-amber-200'}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-amber-500/30">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-amber-100 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all duration-200 group"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <header className="lg:hidden bg-white shadow-sm p-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bars3Icon className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-lg font-bold text-gray-800">لوحة البائع</h1>
              <div className="w-10 flex justify-end">
                <NotificationBell userRole="seller" />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 lg:p-8 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default SellerLayout
