import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CubeIcon,
  TruckIcon,
  ClockIcon,
  CogIcon,
} from '@heroicons/react/24/outline'
import { selectUser, selectToken } from '../../store/slices/authSlice'
import api from '../../services/api'

// Utility function for safe number formatting
const formatCurrency = (value) => {
  const num = parseFloat(value || 0)
  return num.toFixed(2)
}

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const token = useSelector(selectToken)
  
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_users: 0,
    total_categories: 0,
    total_revenue: 0,
    today_orders: 0,
    today_revenue: 0,
    this_month_orders: 0,
    this_month_revenue: 0,
    this_year_orders: 0,
    this_year_revenue: 0,
    top_selling_products: [],
    recent_orders: [],
    sales_chart: [],
    orders_chart: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!token || !user || user.role !== 'admin') {
      console.log('Access denied: User is not admin or not authenticated')
      navigate('/login')
      return
    }

    const fetchDashboardData = async () => {
      try {
        console.log('Fetching admin dashboard data...')
        const response = await api.get('/admin/dashboard')
        console.log('Dashboard response:', response.data)
        setStats(response.data.stats)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        console.error('Error response:', error.response?.data)
        setLoading(false)
        
        // If unauthorized, redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Unauthorized access, redirecting to login...')
          navigate('/login')
        }
      }
    }

    fetchDashboardData()
  }, [token, user, navigate, dispatch])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16" dir="rtl">
            <div className="flex items-center mb-2 sm:mb-0">
              <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  لوحة تحكم الإدارة
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  مرحباً، {user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8" dir="rtl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6" dir="rtl">
          <div className="bg-white overflow-hidden shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                  <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="mr-3 sm:mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      إجمالي المنتجات
                    </dt>
                    <dd className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {stats.total_products}
                    </dd>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-1" />
                      <span className="text-xs text-green-600 font-medium">+12%</span>
                      <span className="text-xs text-gray-500 mr-2 hidden sm:inline">من الشهر الماضي</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                  <TagIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="mr-3 sm:mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      إجمالي الفئات
                    </dt>
                    <dd className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {stats.total_categories}
                    </dd>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-1" />
                      <span className="text-xs text-green-600 font-medium">+5%</span>
                      <span className="text-xs text-gray-500 mr-2 hidden sm:inline">من الشهر الماضي</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                  <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="mr-3 sm:mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      إجمالي المستخدمين
                    </dt>
                    <dd className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {stats.total_users}
                    </dd>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-1" />
                      <span className="text-xs text-green-600 font-medium">+18%</span>
                      <span className="text-xs text-gray-500 mr-2 hidden sm:inline">من الشهر الماضي</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="mr-3 sm:mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      إجمالي الطلبات
                    </dt>
                    <dd className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {stats.total_orders}
                    </dd>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-1" />
                      <span className="text-xs text-green-600 font-medium">+25%</span>
                      <span className="text-xs text-gray-500 mr-2 hidden sm:inline">من الشهر الماضي</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue & Sales Stats */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="bg-white overflow-hidden shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                  <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="mr-3 sm:mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      إيرادات اليوم
                    </dt>
                    <dd className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      ${formatCurrency(stats.today_revenue)}
                    </dd>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-1" />
                      <span className="text-xs text-green-600 font-medium">+8%</span>
                      <span className="text-xs text-gray-500 mr-2 hidden sm:inline">من أمس</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="mr-3 sm:mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      طلبات اليوم
                    </dt>
                    <dd className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {stats.today_orders}
                    </dd>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-1" />
                      <span className="text-xs text-green-600 font-medium">+15%</span>
                      <span className="text-xs text-gray-500 mr-2 hidden sm:inline">من أمس</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                  <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="mr-3 sm:mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      إيرادات هذا الشهر
                    </dt>
                    <dd className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      ${formatCurrency(stats.this_month_revenue)}
                    </dd>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-1" />
                      <span className="text-xs text-green-600 font-medium">+22%</span>
                      <span className="text-xs text-gray-500 mr-2 hidden sm:inline">من الشهر الماضي</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Stats */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 mb-6">
          <div className="bg-white overflow-hidden shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="mr-3 sm:mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      طلبات هذا العام
                    </dt>
                    <dd className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {stats.this_year_orders}
                    </dd>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-1" />
                      <span className="text-xs text-green-600 font-medium">+35%</span>
                      <span className="text-xs text-gray-500 mr-2 hidden sm:inline">من العام الماضي</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-lg">
                  <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="mr-3 sm:mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      إيرادات هذا العام
                    </dt>
                    <dd className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      ${formatCurrency(stats.this_year_revenue)}
                    </dd>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 ml-1" />
                      <span className="text-xs text-green-600 font-medium">+42%</span>
                      <span className="text-xs text-gray-500 mr-2 hidden sm:inline">من العام الماضي</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 mb-6" dir="rtl">
          <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                🏆 أفضل المنتجات مبيعاً
              </h3>
            </div>
          </div>
          <div className="p-3 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم المنتج
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبيعات
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإيرادات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.top_selling_products?.slice(0, 5).map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 text-right">
                        <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-xs">
                            {index + 1}
                          </div>
                          <span className="truncate max-w-24 sm:max-w-none">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-right">
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.sales}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 text-right">
                        ${formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!stats.top_selling_products || stats.top_selling_products.length === 0) && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                    <ShoppingBagIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                    <span className="text-xs sm:text-sm">لا توجد منتجات متميزة متاحة</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 mb-6" dir="rtl">
          <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <TruckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                📋 الطلبات الأخيرة
              </h3>
            </div>
          </div>
          <div className="p-3 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الطلب
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العميل
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجمالي
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recent_orders?.slice(0, 5).map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs">
                            {index + 1}
                          </div>
                          #{order.id}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-xs">
                            {order.customer_name?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <span className="truncate max-w-20 sm:max-w-none">{order.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                        ${formatCurrency(order.total)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'completed' ? '✓ مكتمل' :
                           order.status === 'pending' ? '⏳ قيد الانتظار' :
                           order.status === 'cancelled' ? '✕ ملغي' :
                           order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!stats.recent_orders || stats.recent_orders.length === 0) && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                    <TruckIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300" />
                    <span className="text-xs sm:text-sm">لا توجد طلبات حديثة متاحة</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 shadow-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              ⚡ إجراءات سريعة
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 hover:scale-105">
                <CubeIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm font-medium">منتج جديد</span>
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 hover:scale-105">
                <TagIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm font-medium">فئة جديدة</span>
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 hover:scale-105">
                <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm font-medium">مستخدم جديد</span>
              </button>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 hover:scale-105">
                <CogIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm font-medium">الإعدادات</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
