import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../../store/slices/authSlice'
import { 
  TruckIcon, CheckCircleIcon, ClockIcon, 
  CurrencyDollarIcon, GlobeAltIcon, 
  ShoppingCartIcon, XCircleIcon, 
  ArrowTrendingUpIcon, MapPinIcon 
} from '@heroicons/react/24/outline'
import api from '../../services/api'
import LocationPicker from '../../components/LocationPicker'

const DriverDashboard = () => {
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  
  const [stats, setStats] = useState({
    active_orders_count: 0,
    completed_orders_count: 0,
    earnings_today: 0,
    earnings_month: 0,
    earnings_year: 0,
    earnings_total: 0,
    recent_active_orders: []
  })
  
  const [driverProfile, setDriverProfile] = useState(null)
  const [workZones, setWorkZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  
  useEffect(() => {
    fetchSettings()
    fetchProfile()
    fetchStats()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      const zones = response.data?.delivery_zones
      if (Array.isArray(zones) && zones.length > 0) {
        setWorkZones(zones)
      } else {
        setWorkZones(['الرياض', 'جدة'])
      }
    } catch (err) {
      console.error('Failed to fetch settings', err)
      setWorkZones(['الرياض', 'جدة'])
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await api.get('/driver/profile')
      setDriverProfile(response.data.data)
    } catch (err) {
      console.error('Failed to fetch profile', err)
      if (err.response && err.response.status === 401) {
        navigate('/login', { state: { message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.' } })
      }
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/driver/statistics')
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching driver stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualLocationSelect = async (loc) => {
    try {
      setUpdatingProfile(true)
      await api.put('/driver/profile/location', { latitude: loc.latitude, longitude: loc.longitude })
      await fetchProfile()
      setShowLocationPicker(false)
      alert('تم تحديث موقعك بنجاح!')
    } catch (e) {
      alert('حدث خطأ في تحديث الموقع' + (e.response?.data?.message ? ': ' + e.response.data.message : ''))
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!driverProfile) return
    setUpdatingProfile(true)
    try {
      const newStatus = !driverProfile.is_online
      
      // Update location if going online
      if (newStatus === true && navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          })
          if (position.coords.latitude && position.coords.longitude) {
            await api.put('/driver/profile/location', {
               latitude: position.coords.latitude,
               longitude: position.coords.longitude
            })
          }
        } catch (locationErr) {
          console.log('Could not get actual location, continuing with status update', locationErr)
        }
      }

      const response = await api.put('/driver/profile/status', { is_online: newStatus })
      setDriverProfile(response.data.data)
    } catch (err) {
      alert('فشل في تحديث الحالة')
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleZoneChange = async (e) => {
    if (!driverProfile) return
    setUpdatingProfile(true)
    try {
      const newZone = e.target.value
      const response = await api.put('/driver/profile/status', { work_zone: newZone })
      setDriverProfile(response.data.data)
    } catch (err) {
      alert('فشل في تحديث منطقة العمل')
    } finally {
      setUpdatingProfile(false)
    }
  }
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { label: 'معين', color: 'bg-blue-100 text-blue-800' },
      picked_up_from_seller: { label: 'تم الاستلام', color: 'bg-purple-100 text-purple-800' },
      out_for_delivery: { label: 'جاري التوصيل', color: 'bg-yellow-100 text-yellow-800' },
      delivered: { label: 'مكتمل', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800' },
    }
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>
  }

  if (loading && !stats.active_orders_count && !stats.completed_orders_count) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">لوحة التحكم</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">نظرة عامة على أدائك ومهام التوصيل الخاصة بك</p>
        </div>
      </div>
      
      {/* Driver Status Card */}
      {driverProfile && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className={`flex-shrink-0 h-5 w-5 rounded-full ${driverProfile.is_online ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-400'}`}></span>
              <div>
                <p className="text-lg font-bold text-gray-900">{driverProfile.is_online ? 'أنت متاح للعمل' : 'أنت غير متاح (متوقف عن العمل)'}</p>
                <div className="text-sm text-gray-500 flex flex-col mt-1">
                   <span>{driverProfile.is_online ? 'جاهز لاستلام طلبات التوصيل' : 'لا تستقبل طلبات جديدة حالياً'}</span>
                   <span className={`font-semibold mt-1 flex items-center gap-1 ${driverProfile.latitude && driverProfile.longitude ? 'text-green-600' : 'text-red-500'}`}>
                     {driverProfile.latitude && driverProfile.longitude ? <><MapPinIcon className="w-4 h-4" /> موقعك مسجل ومتاح للرصد</> : '⚠️ موقعك غير مسجل (لن تتلقى طلبات بشكل دقيق)'}
                   </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={() => setShowLocationPicker(true)}
                disabled={updatingProfile}
                className="px-5 py-2.5 text-sm font-medium rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <GlobeAltIcon className="h-5 w-5" />
                <span>تحديث موقعي</span>
              </button>

              <select
                value={driverProfile.work_zone || ''}
                onChange={handleZoneChange}
                disabled={updatingProfile}
                className="bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer"
              >
                <option value="">اختر منطقة العمل...</option>
                {workZones.map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
              
              <button
                onClick={handleStatusToggle}
                disabled={updatingProfile}
                className={`px-6 py-2.5 text-sm font-bold rounded-xl text-white transition-all shadow-md transform hover:-translate-y-0.5 ${
                  driverProfile.is_online ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/30' : 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {updatingProfile ? 'جاري التحديث...' : (driverProfile.is_online ? 'إيقاف العمل' : 'بدء العمل')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLocationPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative overflow-hidden">
            <h3 className="text-xl font-bold mb-4 text-blue-900 border-b pb-4">تحديث موقع التواجد (لتلقي طلبات قريبة)</h3>
            <LocationPicker 
              onLocationSelect={handleManualLocationSelect} 
              initialPosition={driverProfile?.latitude ? [parseFloat(driverProfile.latitude), parseFloat(driverProfile.longitude)] : null} 
            />
            <button 
              onClick={() => setShowLocationPicker(false)}
              className="absolute top-6 left-6 text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards Row 1: Earnings (Like Real Big E-commerce stores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-10">
            <CurrencyDollarIcon className="w-32 h-32" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">أرباح اليوم</p>
          <p className="text-4xl font-bold font-sans">
             {Number(stats.earnings_today).toFixed(2)} <span className="text-lg text-blue-200">ريال</span>
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-5 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <ArrowTrendingUpIcon className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">أرباح الشهر</p>
            <p className="text-2xl font-bold text-gray-900 border-b border-gray-100 inline-block pb-1">
              {Number(stats.earnings_month).toFixed(2)} <span className="text-sm font-normal text-gray-500">ريال</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-5 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
            <CurrencyDollarIcon className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">أرباح السنة</p>
            <p className="text-2xl font-bold text-gray-900 border-b border-gray-100 inline-block pb-1">
              {Number(stats.earnings_year).toFixed(2)} <span className="text-sm font-normal text-gray-500">ريال</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-5 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
            <ShoppingCartIcon className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">إجمالي الأرباح</p>
            <p className="text-2xl font-bold text-gray-900 border-b border-gray-100 inline-block pb-1">
              {Number(stats.earnings_total).toFixed(2)} <span className="text-sm font-normal text-gray-500">ريال</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Row 2: Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border text-center border-gray-200 rounded-2xl shadow-sm p-6 flex justify-between items-center hover:border-amber-300 transition-colors">
          <div className="text-right">
             <p className="text-sm font-medium text-gray-500 mb-2">طلبات قيد المعالجة والتوصيل</p>
             <h3 className="text-4xl font-extrabold text-amber-500">{stats.active_orders_count}</h3>
          </div>
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
             <ClockIcon className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        <div className="bg-white border text-center border-gray-200 rounded-2xl shadow-sm p-6 flex justify-between items-center hover:border-green-300 transition-colors">
          <div className="text-right">
             <p className="text-sm font-medium text-gray-500 mb-2">الطلبات المكتملة تاريخياً</p>
             <h3 className="text-4xl font-extrabold text-green-500">{stats.completed_orders_count}</h3>
          </div>
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
             <CheckCircleIcon className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TruckIcon className="w-6 h-6 text-blue-600" />
            الطلبات الأخيرة
          </h2>
          <Link to="/driver/orders" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            عرض جميع الطلبات ←
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {stats.recent_active_orders && stats.recent_active_orders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">العميل</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">رسوم التوصيل</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">تاريخ الطلب</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">إجراء</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_active_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">#{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user?.first_name} {order.user?.last_name}</div>
                      <div className="text-xs text-gray-500">{order.shipping_city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.driver_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center gap-1">
                      {Number(order.shipping || 0).toFixed(2)} <span className="text-xs text-gray-500">ريال</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link to={`/driver/orders/${order.id}`} className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                        التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات حديثة</h3>
              <p className="mt-1 text-sm text-gray-500">ستظهر الطلبات الجديدة الموكلة إليك هنا.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard
