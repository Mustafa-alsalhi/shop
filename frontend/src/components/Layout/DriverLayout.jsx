import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  ChartBarIcon, 
  ShoppingCartIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'

const DriverLayout = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const menuItems = [
    { path: '/driver/dashboard', icon: ChartBarIcon, label: 'لوحة التحكم', description: 'نظرة عامة' },
    { path: '/driver/orders', icon: TruckIcon, label: 'الطلبات (توصيلاتي)', description: 'الطلبات المسندة إليك' },
    { path: '/driver/settings', icon: Cog6ToothIcon, label: 'إعدادات الحساب والمحفظة', description: 'بياناتك الشخصية والمالية' },
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
          fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-blue-700 to-blue-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-shrink-0
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-500/30">
              <div>
                <h1 className="text-xl font-bold text-white">لوحة المندوب</h1>
                <p className="text-blue-200 text-sm mt-1">{user?.name || 'مندوب التوصيل'}</p>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-blue-600/50 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600/30 transition-all duration-200 mb-4"
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
                      ? 'bg-white text-blue-800 shadow-lg' 
                      : 'text-blue-100 hover:bg-blue-600/30'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-700' : ''}`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    <p className={`text-xs mt-0.5 ${isActive(item.path) ? 'text-blue-600' : 'text-blue-300'}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-blue-500/30">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-blue-100 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all duration-200 group"
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
              <h1 className="text-lg font-bold text-gray-800">لوحة المندوب</h1>
              <div className="w-10" />
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

export default DriverLayout
