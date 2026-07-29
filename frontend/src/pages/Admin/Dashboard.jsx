import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  ChartBarIcon, ShoppingBagIcon, UsersIcon, TagIcon,
  CurrencyDollarIcon, ArrowTrendingUpIcon, CubeIcon,
  TruckIcon, ClockIcon, BuildingStorefrontIcon, 
  MapPinIcon, BoltIcon, BanknotesIcon, DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { selectUser, selectToken } from '../../store/slices/authSlice'
import api from '../../services/api'

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
    total_sellers: 0,
    
    total_revenue: 0,
    today_orders: 0,
    today_revenue: 0,
    this_week_orders: 0,
    this_week_revenue: 0,
    this_month_orders: 0,
    this_month_revenue: 0,
    this_year_orders: 0,
    this_year_revenue: 0,
    
    pending_orders: 0,
  })

  const [topProducts, setTopProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [outOfStock, setOutOfStock] = useState([])
  const [sellersPerformance, setSellersPerformance] = useState([])
  const [loading, setLoading] = useState(true)

  // Seller orders modal state
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [selectedSellerOrders, setSelectedSellerOrders] = useState([])
  const [selectedSellerName, setSelectedSellerName] = useState('')

  const openSellerOrdersModal = (seller) => {
    setSelectedSellerName(seller.store_name)
    setSelectedSellerOrders(seller.completed_orders_details || [])
    setShowOrdersModal(true)
  }

  const exportDashboardReport = () => {
    const BOM = "\uFEFF";
    let csvContent = BOM + "تقرير لوحة تحكم الإدارة الشامل\n\n";
    
    csvContent += "--- الإحصائيات العامة ---\n";
    csvContent += `إجمالي العملاء,${stats.total_users}\n`;
    csvContent += `المتاجر / البائعين,${stats.total_sellers}\n`;
    csvContent += `المنتجات المعروضة,${stats.total_products}\n`;
    csvContent += `إجمالي الطلبات,${stats.total_orders}\n`;
    csvContent += `طلبات معلقة للتدخل,${stats.pending_orders}\n\n`;

    csvContent += "--- التدفقات النقدية ---\n";
    csvContent += `الفترة,الطلبات,المبيعات (ريال)\n`;
    csvContent += `اليوم,${stats.today_orders},${stats.today_revenue}\n`;
    csvContent += `هذا الأسبوع,${stats.this_week_orders},${stats.this_week_revenue}\n`;
    csvContent += `هذا الشهر,${stats.this_month_orders},${stats.this_month_revenue}\n`;
    csvContent += `هذا العام,${stats.this_year_orders},${stats.this_year_revenue}\n\n`;

    csvContent += "--- أداء البائعين ---\n";
    csvContent += "اسم المتجر,إجمالي الطلبات المباعة,الطلبات المسلمة بالنجاح,مبيعات اليوم,مبيعات الأسبوع,مبيعات الشهر,إجمالي المبيعات\n";
    sellersPerformance.forEach(s => {
       csvContent += `"${s.store_name}",${s.total_orders},${s.completed_orders},${s.today_sales},${s.week_sales},${s.month_sales},${s.total_sales}\n`;
    });
    csvContent += "\n";

    csvContent += "--- المنتجات الأكثر مبيعاً ---\n";
    csvContent += "اسم المنتج,التاجر,قطعة مباعة,المبيعات (ريال)\n";
    topProducts.forEach(p => {
       csvContent += `"${p.name}","${p.seller_name}",${p.sales},${p.revenue}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_الادارة_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      navigate('/login')
      return
    }

    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard')
        setStats(response.data.stats || {})
        setTopProducts(response.data.top_selling_products || [])
        setRecentOrders(response.data.recent_orders || [])
        setOutOfStock(response.data.out_of_stock_products || [])
        setSellersPerformance(response.data.sellers_performance || [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token, user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mb-4"></div>
        <p className="text-gray-500 font-medium">جاري تحميل لوحة التحكم...</p>
      </div>
    )
  }

  const getOrderStatusUI = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return { label: '✓ مكتمل', class: 'bg-green-100 text-green-800 border-green-200' }
      case 'pending': 
        return { label: '⏳ قيد الانتظار', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
      case 'processing':
        return { label: '🔄 قيد المعالجة', class: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'shipped':
        return { label: '🚚 تم الشحن', class: 'bg-purple-100 text-purple-800 border-purple-200' }
      case 'cancelled':
      case 'rejected':
        return { label: '✕ ملغي/مرفوض', class: 'bg-red-100 text-red-800 border-red-200' }
      default: return { label: status, class: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12" dir="rtl">
      
      {/* Dynamic Header */}
      <div className="bg-white px-8 py-6 mb-8 border-b border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-lg">
             <ChartBarIcon className="w-8 h-8" />
           </div>
           <div>
             <h1 className="text-2xl font-black text-gray-900">المركز الرئيسي للإدارة</h1>
             <p className="text-gray-500 text-sm mt-1 font-medium">نظرة استراتيجية ومؤشرات الأداء للمنصة وكافة البائعين.</p>
           </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
           <button 
             onClick={exportDashboardReport}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2"
           >
             <DocumentArrowDownIcon className="w-5 h-5" />
             <span className="hidden sm:inline">تحميل تقرير شامل</span>
           </button>
           <div className="text-left hidden md:block">
             <p className="text-sm font-bold text-gray-900">{user?.name}</p>
             <p className="text-xs text-green-500 font-medium tracking-wider">♦ مدير النظام النشط</p>
           </div>
           <div className="w-12 h-12 bg-gray-200 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-xl text-gray-600">
             {user?.name?.charAt(0)?.toUpperCase()}
           </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-8">
        
        {/* Core Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-blue-400 transition-colors flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><UsersIcon className="w-6 h-6" /></div>
               <span className="text-2xl font-black text-gray-800">{stats.total_users}</span>
             </div>
             <p className="text-sm text-gray-500 font-bold">إجمالي العملاء</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-amber-400 transition-colors flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><BuildingStorefrontIcon className="w-6 h-6" /></div>
               <span className="text-2xl font-black text-gray-800">{stats.total_sellers}</span>
             </div>
             <p className="text-sm text-gray-500 font-bold">المتاجر / البائعين</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-purple-400 transition-colors flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><CubeIcon className="w-6 h-6" /></div>
               <span className="text-2xl font-black text-gray-800">{stats.total_products}</span>
             </div>
             <p className="text-sm text-gray-500 font-bold">المنتجات المعروضة</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-green-400 transition-colors flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TruckIcon className="w-6 h-6" /></div>
               <span className="text-2xl font-black text-gray-800">{stats.total_orders}</span>
             </div>
             <p className="text-sm text-gray-500 font-bold">إجمالي الطلبات (تاريخياً)</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 border border-red-500 shadow-md text-white flex flex-col justify-between transform hover:-translate-y-1 transition-transform">
             <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-white/20 rounded-lg"><ClockIcon className="w-6 h-6" /></div>
               <span className="text-2xl font-black">{stats.pending_orders}</span>
             </div>
             <p className="text-sm font-bold text-red-50">طلبات معلقة للتدخل</p>
          </div>
        </div>

        {/* Revenue Flow Breakdown (Timeframes) */}
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pt-6">
          <BanknotesIcon className="w-6 h-6 text-green-600" />
          التدفقات النقدية والمبيعات الزمنية (المتجر كامل)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white rounded-xl shadow border-l-4 border-blue-500 overflow-hidden group">
             <div className="p-5 flex items-center gap-4">
               <div className="p-4 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform"><BoltIcon className="w-7 h-7 text-blue-600" /></div>
               <div>
                 <p className="text-xs text-gray-500 font-bold mb-1">اليوم</p>
                 <h4 className="text-2xl font-black text-gray-900">{formatCurrency(stats.today_revenue)} <span className="text-sm text-gray-400 font-normal">ريال</span></h4>
                 <p className="text-xs mt-1 text-blue-600 font-semibold">{stats.today_orders} عملية شراء</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl shadow border-l-4 border-indigo-500 overflow-hidden group">
             <div className="p-5 flex items-center gap-4">
               <div className="p-4 bg-indigo-50 rounded-xl group-hover:scale-110 transition-transform"><ArrowTrendingUpIcon className="w-7 h-7 text-indigo-600" /></div>
               <div>
                 <p className="text-xs text-gray-500 font-bold mb-1">هذا الأسبوع</p>
                 <h4 className="text-2xl font-black text-gray-900">{formatCurrency(stats.this_week_revenue)} <span className="text-sm text-gray-400 font-normal">ريال</span></h4>
                 <p className="text-xs mt-1 text-indigo-600 font-semibold">{stats.this_week_orders} عملية شراء</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-xl shadow border-l-4 border-purple-500 overflow-hidden group">
             <div className="p-5 flex items-center gap-4">
               <div className="p-4 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform"><ChartBarIcon className="w-7 h-7 text-purple-600" /></div>
               <div>
                 <p className="text-xs text-gray-500 font-bold mb-1">هذا الشهر</p>
                 <h4 className="text-2xl font-black text-gray-900">{formatCurrency(stats.this_month_revenue)} <span className="text-sm text-gray-400 font-normal">ريال</span></h4>
                 <p className="text-xs mt-1 text-purple-600 font-semibold">{stats.this_month_orders} عملية شراء</p>
               </div>
             </div>
           </div>

           <div className="bg-gray-900 text-white rounded-xl shadow border-l-4 border-amber-500 overflow-hidden group relative">
             <div className="absolute right-0 top-0 opacity-10 pointer-events-none"><CurrencyDollarIcon className="w-32 h-32" /></div>
             <div className="p-5 flex items-center gap-4 relative z-10">
               <div className="p-4 bg-gray-800 rounded-xl"><CurrencyDollarIcon className="w-7 h-7 text-amber-500" /></div>
               <div>
                 <p className="text-xs text-gray-400 font-bold mb-1">هذا العام</p>
                 <h4 className="text-2xl font-black text-white">{formatCurrency(stats.this_year_revenue)} <span className="text-sm text-gray-500 font-normal">ريال</span></h4>
                 <p className="text-xs mt-1 text-amber-400 font-semibold">{stats.this_year_orders} عملية شراء</p>
               </div>
             </div>
           </div>
        </div>

        {/* Sellers Performance (Crucial for Admin) */}
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pt-6">
          <BuildingStorefrontIcon className="w-6 h-6 text-indigo-600" />
          مقارنة أداء البائعين ومبيعات المتاجر
        </h2>
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50/50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">اسم المتجر / البائع</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-gray-600 uppercase tracking-wider">إجمالي الطلبات المُباعة</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-gray-600 uppercase tracking-wider">الطلبات المسلمة بنجاح</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-blue-600 uppercase tracking-wider">مبيعات اليوم</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-indigo-600 uppercase tracking-wider">مبيعات الأسبوع</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-purple-600 uppercase tracking-wider">مبيعات الشهر</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-green-600 uppercase tracking-wider">إجمالي المبيعات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sellersPerformance && sellersPerformance.length > 0 ? (
                  sellersPerformance.map((seller, idx) => (
                    <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${idx === 0 ? 'bg-amber-500 shadow-md transform scale-110' : 'bg-indigo-400'}`}>
                            {idx === 0 ? '🏆' : idx + 1}
                          </div>
                          <span className="font-bold text-gray-900">{seller.store_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-center">
                        {seller.total_orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                         <button 
                           onClick={() => openSellerOrdersModal(seller)}
                           className="bg-green-100 text-green-800 hover:bg-green-200 px-4 py-1.5 rounded-full font-bold cursor-pointer transition-colors shadow-sm"
                           title="اضغط لعرض تفاصيل الطلبات המסلمة"
                         >
                           {seller.completed_orders} <span className="text-xs">عرض 👁️</span>
                         </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-center">
                        {formatCurrency(seller.today_sales)} <span className="text-xs font-normal">ريال</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 text-center">
                        {formatCurrency(seller.week_sales)} <span className="text-xs font-normal">ريال</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600 text-center">
                        {formatCurrency(seller.month_sales)} <span className="text-xs font-normal">ريال</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-600 text-center bg-green-50/30">
                        {formatCurrency(seller.total_sales)} <span className="text-xs font-normal">ريال</span>
                      </td>
                    </tr>
                  ))
                ) : (
                   <tr><td colSpan="6" className="text-center py-6 text-gray-400">لا يوجد بائعون متصلون / نشطون حالياً</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          
          {/* Top Selling Products */}
          <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
               <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg"><CubeIcon className="w-5 h-5 text-white" /></div>
               <h3 className="text-lg font-bold text-gray-900">أكثر المنتجات مبيعاً</h3>
            </div>
            <div className="p-2">
              <table className="min-w-full">
                <tbody>
                  {topProducts && topProducts.length > 0 ? (
                    topProducts.map((p, idx) => (
                      <tr key={idx} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50">
                         <td className="px-4 py-3">
                           <p className="font-bold text-gray-900 text-sm max-w-[200px] truncate">{p.name}</p>
                           <p className="text-xs text-gray-500 mt-1">تاجر: <span className="text-indigo-600 font-semibold">{p.seller_name}</span></p>
                         </td>
                         <td className="px-4 py-3 text-left">
                           <p className="text-sm font-black text-gray-900">{formatCurrency(p.revenue)} <span className="text-xs font-normal text-gray-500">ريال</span></p>
                           <p className="text-xs text-amber-600 font-bold">{p.sales} قطعة مباعة</p>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td className="p-6 text-center text-gray-400">لايوجد معلومات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Global Orders */}
          <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
               <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg"><TruckIcon className="w-5 h-5 text-white" /></div>
               <h3 className="text-lg font-bold text-gray-900">أحدث العمليات الشرائية</h3>
            </div>
            <div className="p-2">
              <table className="min-w-full">
                 <tbody>
                   {recentOrders && recentOrders.length > 0 ? (
                     recentOrders.map((order, idx) => {
                       const ui = getOrderStatusUI(order.status)
                       return (
                         <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                           <td className="px-4 py-3">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold uppercase">{order.customer_name?.charAt(0) || 'U'}</div>
                               <div>
                                 <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{order.customer_name}</p>
                                 <p className="text-xs text-gray-500 mt-0.5">#{order.order_number}</p>
                               </div>
                             </div>
                           </td>
                           <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 text-xs border rounded-full font-bold ${ui.class}`}>{ui.label}</span>
                           </td>
                           <td className="px-4 py-3 text-left font-black text-gray-900 text-sm">
                              {formatCurrency(order.total)} <span className="font-normal text-xs text-gray-500">ريال</span>
                           </td>
                         </tr>
                       )
                     })
                   ) : (
                     <tr><td className="p-6 text-center text-gray-400">لا توجد طلبات حديثة</td></tr>
                   )}
                 </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Modal for Completed Orders */}
      {showOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TruckIcon className="w-6 h-6" />
                الطلبات المستلمة بنجاح - المتجر: {selectedSellerName}
              </h3>
              <button 
                onClick={() => setShowOrdersModal(false)}
                className="text-indigo-200 hover:text-white transition-colors"
                title="إغلاق"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-indigo-700 font-bold text-xl">✕</div>
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
               {selectedSellerOrders && selectedSellerOrders.length > 0 ? (
                 <div className="grid gap-4">
                   {selectedSellerOrders.map(order => (
                     <div key={order.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                           <BanknotesIcon className="w-6 h-6" />
                         </div>
                         <div>
                           <p className="font-bold text-gray-900">طلب #{order.order_number}</p>
                           <p className="text-sm text-gray-500">للعميل: {order.customer_name}</p>
                         </div>
                       </div>
                       <div className="text-left">
                         <p className="font-black text-gray-900 text-lg">{formatCurrency(order.total_amount)} <span className="text-xs font-normal text-gray-500">ريال</span></p>
                         <p className="text-xs text-gray-400 mt-1">{order.created_at}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12 text-gray-500">لا توجد تفاصيل متاحة أو لم يكمل الطلبات بعد.</div>
               )}
            </div>
            <div className="bg-gray-100 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowOrdersModal(false)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
