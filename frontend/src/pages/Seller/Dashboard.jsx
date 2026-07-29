import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ShoppingBagIcon, ShoppingCartIcon, ArrowTrendingUpIcon, 
  CurrencyDollarIcon, PlusIcon, ClockIcon, CheckCircleIcon, 
  XCircleIcon, BanknotesIcon, CubeTransparentIcon, DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import api from '../../services/api'

const SellerDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    pending_orders: 0,
    total_sales: 0,
    today_sales: 0,
    this_week_sales: 0,
    this_month_sales: 0,
    this_year_sales: 0,
    recent_orders: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/seller/statistics')
      if (response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'قيد الانتظار' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: ArrowTrendingUpIcon, label: 'قيد المعالجة' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: ShoppingCartIcon, label: 'تم الشحن' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'مكتمل' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'ملغي' },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.color} shadow-sm border border-transparent`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const exportDashboardReport = () => {
    const BOM = "\uFEFF";
    let csvContent = BOM + "تقرير أداء المتجر\n\n";

    // 1. General Stats
    csvContent += "--- الإحصائيات العامة ---\n";
    csvContent += `إجمالي المنتجات المعروضة,${stats.total_products}\n`;
    csvContent += `إجمالي الطلبات المباعة,${stats.total_orders}\n`;
    csvContent += `الطلبات قيد الانتظار لمعالجتها,${stats.pending_orders || 0}\n`;
    csvContent += `إجمالي أرباح المتجر (تاريخياً),${Number(stats.this_year_sales).toFixed(2)} ريال\n\n`;

    // 2. Time-based Sales
    csvContent += "--- المبيعات والأرباح الزمنية ---\n";
    csvContent += `الفترة,المبيعات (ريال)\n`;
    csvContent += `أرباح مبيعات اليوم,${Number(stats.today_sales).toFixed(2)}\n`;
    csvContent += `أرباح هذا الأسبوع,${Number(stats.this_week_sales).toFixed(2)}\n`;
    csvContent += `أرباح هذا الشهر,${Number(stats.this_month_sales).toFixed(2)}\n\n`;

    // 3. Recent Orders
    csvContent += "--- أحدث الطلبات (آخر النشاطات) ---\n";
    csvContent += "رقم الطلب,العميل,التاريخ,حالة الطلب,مجموع ربحك من الطلب (ريال)\n";
    if(stats.recent_orders && stats.recent_orders.length > 0) {
       stats.recent_orders.forEach(order => {
          const sellerSubtotal = order.items?.reduce((sum, current) => sum + (current.price * current.quantity), 0) || 0;
          const customerName = `${order.user?.first_name || ''} ${order.user?.last_name || ''}`;
          csvContent += `#${order.order_number},"${customerName}",${new Date(order.created_at).toLocaleDateString('ar-SA')},${order.status},${Number(sellerSubtotal).toFixed(2)}\n`;
       });
    } else {
       csvContent += "لا توجد طلبات حديثة\n";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_متجري_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">لوحة تحكم البائع</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">نظرة عامة على أداء متجرك ومبيعاتك</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
           <button 
             onClick={exportDashboardReport}
             className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md"
           >
             <DocumentArrowDownIcon className="w-5 h-5 font-bold" />
             <span className="font-semibold">تحميل أداء المتجر</span>
           </button>
           <button 
             onClick={() => navigate('/seller/products/new')}
             className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-2.5 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
           >
             <PlusIcon className="w-5 h-5 font-bold" />
             <span className="font-semibold">إضافة منتج جديد</span>
           </button>
        </div>
      </div>

      {/* Main Earnings Section (Dynamic Real-Time Data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden transform hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 opacity-20">
            <CurrencyDollarIcon className="w-32 h-32" />
          </div>
          <p className="text-amber-100 text-sm font-medium mb-1">مبيعات اليوم</p>
          <p className="text-4xl font-bold font-sans">
             {Number(stats.today_sales).toFixed(2)} <span className="text-lg text-amber-200">ريال</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-center hover:shadow-xl transition-shadow relative overflow-hidden">
           <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                 <BanknotesIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">مبيعات هذا الأسبوع</p>
                 <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-100 inline-block pb-1">
                    {Number(stats.this_week_sales).toFixed(2)} <span className="text-sm text-gray-400 font-normal">ريال</span>
                 </h3>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-center hover:shadow-xl transition-shadow relative overflow-hidden">
           <div className="absolute left-0 top-0 w-1 h-full bg-purple-500"></div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                 <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">مبيعات هذا الشهر</p>
                 <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-100 inline-block pb-1">
                    {Number(stats.this_month_sales).toFixed(2)} <span className="text-sm text-gray-400 font-normal">ريال</span>
                 </h3>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col justify-center hover:shadow-xl transition-shadow relative overflow-hidden">
           <div className="absolute left-0 top-0 w-1 h-full bg-green-500"></div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                 <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">أرباح السنة / الإجمالي</p>
                 <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-100 inline-block pb-1">
                    {Number(stats.this_year_sales).toFixed(2)} <span className="text-sm text-gray-400 font-normal">ريال</span>
                 </h3>
              </div>
           </div>
        </div>
      </div>

      {/* Secondary Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/seller/products" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:border-amber-400 transition-colors group">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">المنتجات المعروضة</p>
            <h3 className="text-3xl font-extrabold text-amber-600 group-hover:scale-105 transition-transform">{stats.total_products}</h3>
          </div>
          <div className="bg-amber-50 p-4 rounded-full">
             <CubeTransparentIcon className="w-8 h-8 text-amber-600" />
          </div>
        </Link>
        
        <Link to="/seller/orders" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:border-blue-400 transition-colors group">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">إجمالي طلبات المتجر</p>
            <h3 className="text-3xl font-extrabold text-blue-600 group-hover:scale-105 transition-transform">{stats.total_orders}</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-full">
             <ShoppingCartIcon className="w-8 h-8 text-blue-600" />
          </div>
        </Link>
        
        <Link to="/seller/orders" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between hover:border-red-400 transition-colors group">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">طلبات نشطة (قيد العمل)</p>
            <h3 className="text-3xl font-extrabold text-red-500 group-hover:scale-105 transition-transform">{stats.pending_orders || 0}</h3>
          </div>
          <div className="bg-red-50 p-4 rounded-full">
             <ShoppingBagIcon className="w-8 h-8 text-red-500" />
          </div>
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCartIcon className="w-6 h-6 text-amber-600" />
            أحدث الطلبات
          </h2>
          <Link to="/seller/orders" className="text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors">
            عرض جميع الطلبات ←
          </Link>
        </div>
        <div className="overflow-x-auto">
          {stats.recent_orders && stats.recent_orders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">العميل</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">المنتجات</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">اجمالي منتجاتك</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {stats.recent_orders.map((order) => {
                   // Calculate the subtotal specifically for this seller in this order
                   const sellerSubtotal = order.items?.reduce((sum, current) => sum + (current.price * current.quantity), 0) || 0;
                   return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/seller/orders/${order.id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-900">#{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{order.user?.first_name} {order.user?.last_name}</div>
                      <div className="text-xs text-gray-500">{order.shipping_city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {order.items?.length || 0} منتج مختص بك
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 flex items-center gap-1">
                      {Number(sellerSubtotal).toFixed(2)} <span className="text-xs text-gray-500 font-normal">ريال</span>
                    </td>
                  </tr>
                   );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-medium text-gray-900">لا توجد طلبات جديدة</p>
              <p className="text-sm">لم يتم تسجيل أي طلبات بعد في متجرك.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard
