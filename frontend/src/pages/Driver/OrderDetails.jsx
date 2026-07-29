import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  MapPinIcon, 
  PhoneIcon, 
  UserIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map center updater component
const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

// Map bounds updater component
const MapBoundsUpdater = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const DriverOrderDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/driver/orders/${id}`)
      setOrder(response.data.data)
      setLoading(false)
    } catch (err) {
      setError('فشل في جلب تفاصيل الطلب: ' + err.message)
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`هل أنت متأكد من تغيير حالة الطلب إلى "${newStatus}"؟`)) {
      return
    }

    setUpdatingStatus(true)
    try {
      const response = await api.patch(`/driver/orders/${id}/status`, {
        driver_status: newStatus
      })
      
      setOrder(response.data.data)
      alert('تم تحديث حالة الطلب بنجاح')
    } catch (err) {
      console.error('فشل في تحديث الحالة:', err)
      alert('فشل في تحديث حالة الطلب')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { label: 'معين', color: 'bg-blue-100 text-blue-800' },
      picked_up_from_seller: { label: 'تم الاستلام من البائع', color: 'bg-yellow-100 text-yellow-800' },
      out_for_delivery: { label: 'جاري التوصيل', color: 'bg-orange-100 text-orange-800' },
      delivered: { label: 'تم التسليم', color: 'bg-green-100 text-green-800' }
    }
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      assigned: 'picked_up_from_seller',
      picked_up_from_seller: 'out_for_delivery',
      out_for_delivery: 'delivered'
    }
    return statusFlow[currentStatus]
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return (R * c).toFixed(1);
  };

  const getGoogleMapsUrl = () => {
    if (order.latitude && order.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sticky top-0 z-50 shadow-lg relative">
          <div className="max-w-6xl mx-auto flex items-center">
            <button
              onClick={() => navigate('/driver/orders')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold flex-1 text-center">تفاصيل الشحنة</h1>
            <div className="w-10"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-4 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded-lg bg-opacity-50"></div>
              <div className="h-16 bg-gray-200 rounded-lg bg-opacity-50"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error || 'لم يتم العثور على الطلب'}
          </div>
          <button
            onClick={() => navigate('/driver/orders')}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            العودة للطلبات
          </button>
        </div>
      </div>
    )
  }

  const isDelivered = order.driver_status === 'delivered'
  const nextStatus = getNextStatus(order.driver_status)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center">
          <button
            onClick={() => navigate('/driver/orders')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">تفاصيل الشحنة</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-4 space-y-4">
        {/* Order Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">#{order.order_number}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(order.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {getStatusBadge(order.driver_status)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">إجمالي الفاتورة</p>
              <p className="text-lg font-bold text-gray-900">
                {order.items?.[0]?.product?.currency || 'SAR'} {parseFloat(order.total_amount || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
              <p className="text-xs text-indigo-800 mb-1 font-semibold">قيمة التوصيل (أرباحك)</p>
              <p className="text-lg font-bold text-indigo-700">
                {order.items?.[0]?.product?.currency || 'SAR'} {parseFloat(order.shipping || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg mt-4 flex justify-between items-center">
             <div>
                <p className="text-xs text-gray-600 mb-1">عدد المنتجات</p>
                <p className="text-lg font-bold text-gray-900">{order.items?.length || 0}</p>
             </div>
             <div>
                <span className="text-xs text-gray-500">رقم الفاتورة: #{order.id}</span>
             </div>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 ml-2" />
            معلومات العميل
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-600 w-24 text-sm">الاسم:</span>
              <span className="font-medium text-gray-900">{order.user?.name || 'غير محدد'}</span>
            </div>
            {order.user?.phone && (
              <div className="flex items-center">
                <span className="text-gray-600 w-24 text-sm">الهاتف:</span>
                <a
                  href={`tel:${order.user.phone}`}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <PhoneIcon className="h-4 w-4 ml-1" />
                  {order.user.phone}
                </a>
              </div>
            )}
            {order.formatted_address && (
              <div className="flex items-start">
                <span className="text-gray-600 w-24 text-sm">العنوان:</span>
                <span className="font-medium text-gray-900 flex-1">{order.formatted_address}</span>
              </div>
            )}
            {order.building_details && (
              <div className="flex items-start">
                <span className="text-gray-600 w-24 text-sm">تفاصيل المبنى:</span>
                <span className="font-medium text-gray-900 flex-1">{order.building_details}</span>
              </div>
            )}
          </div>
        </div>

        {/* Seller Info Card */}
        {order.items && order.items.length > 0 && order.items[0]?.product?.seller && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <ShoppingBagIcon className="h-5 w-5 ml-2 text-indigo-600" />
              موقع استلام البائع
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-600 w-24 text-sm">اسم المتجر:</span>
                <span className="font-medium text-gray-900">{order.items[0].product.seller.store_name || 'غير معروف'}</span>
              </div>
              {order.items[0].product.seller.address && (
                <div className="flex items-start">
                  <span className="text-gray-600 w-24 text-sm">العنوان:</span>
                  <span className="font-medium text-gray-900 flex-1">{order.items[0].product.seller.address}</span>
                </div>
              )}
              {order.items[0].product.seller.city && (
                <div className="flex items-start">
                  <span className="text-gray-600 w-24 text-sm">المدينة:</span>
                  <span className="font-medium text-gray-900 flex-1">{order.items[0].product.seller.city}</span>
                </div>
              )}
              {order.items[0].product.seller.latitude && order.items[0].product.seller.longitude && (
                <div className="mt-2 text-left">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.items[0].product.seller.latitude},${order.items[0].product.seller.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <TruckIcon className="h-4 w-4" />
                    توجيه لعنوان البائع (خرائط جوجل)
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Unified Route Map Card */}
        {order.latitude && order.longitude && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 ml-2 text-indigo-600" />
                خريطة المسار (الاستلام والتسليم)
              </h3>
              {getGoogleMapsUrl() && (
                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <TruckIcon className="h-4 w-4" />
                  توجيه عبر جوجل
                </a>
              )}
            </div>

            {order.items?.[0]?.product?.seller?.latitude && order.items?.[0]?.product?.seller?.longitude && (
              <div className="mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center text-indigo-800">
                  <MapPinIcon className="h-5 w-5 ml-2" />
                  <span className="font-medium text-sm">المسافة المقدرة لمعلم الخريطة (بين المتجر والعميل):</span>
                </div>
                <span className="font-bold text-lg text-indigo-700 font-mono">
                  {calculateDistance(order.items[0].product.seller.latitude, order.items[0].product.seller.longitude, order.latitude, order.longitude)} كم
                </span>
              </div>
            )}

            <div className="h-[350px] rounded-lg overflow-hidden border-2 border-gray-200 relative z-0">
              <MapContainer
                center={[order.latitude, order.longitude]}
                zoom={14}
                scrollWheelZoom={false}
                dragging={true}
                touchZoom={true}
                zoomControl={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Seller Map Marker */}
                {order.items?.[0]?.product?.seller?.latitude && order.items?.[0]?.product?.seller?.longitude && (
                  <Marker position={[order.items[0].product.seller.latitude, order.items[0].product.seller.longitude]}>
                    <Popup>
                      <strong>موقع الاستلام (المتجر)</strong><br />
                      {order.items[0].product.seller.store_name}
                    </Popup>
                  </Marker>
                )}

                {/* Customer Map Marker */}
                <Marker position={[order.latitude, order.longitude]}>
                  <Popup>
                    <strong>موقع التسليم (العميل)</strong><br />
                    {order.user?.name}
                  </Popup>
                </Marker>

                {/* Route Line */}
                {order.items?.[0]?.product?.seller?.latitude && order.items?.[0]?.product?.seller?.longitude && (
                  <>
                    <Polyline 
                      positions={[
                        [order.items[0].product.seller.latitude, order.items[0].product.seller.longitude],
                        [order.latitude, order.longitude]
                      ]}
                      pathOptions={{ color: '#4f46e5', weight: 4, dashArray: '5, 10' }} 
                    />
                    <MapBoundsUpdater 
                      bounds={[
                        [order.items[0].product.seller.latitude, order.items[0].product.seller.longitude],
                        [order.latitude, order.longitude]
                      ]}
                    />
                  </>
                )}
                
                {/* Center Fallback if only 1 location exists */}
                {!(order.items?.[0]?.product?.seller?.latitude && order.items?.[0]?.product?.seller?.longitude) && (
                   <MapCenterUpdater center={[order.latitude, order.longitude]} />
                )}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Order Items Card */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <ShoppingBagIcon className="h-5 w-5 ml-2" />
            المنتجات
          </h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    الكمية: {item.quantity} × {item.product?.currency} {parseFloat(item.price || 0).toFixed(2)}
                  </p>
                  {item.color && (
                    <p className="text-xs text-gray-600">اللون: {item.color}</p>
                  )}
                  {item.size && (
                    <p className="text-xs text-gray-600">المقاس: {item.size}</p>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">
                    {item.product?.currency} {(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Update Actions */}
        {!isDelivered && order.driver_status !== 'rejected' && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 ml-2" />
              أوامر التوصيل المستلمة
            </h3>
            <div className="space-y-3">
              {order.driver_status === 'assigned' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusUpdate('picked_up_from_seller')}
                    disabled={updatingStatus}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center text-sm shadow-sm"
                  >
                    <CheckCircleIcon className="h-5 w-5 ml-1" />
                    موافقة واستلام
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={updatingStatus}
                    className="w-full px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center text-sm shadow-sm"
                  >
                    <ExclamationTriangleIcon className="h-5 w-5 ml-1" />
                    رفض / غير متاح
                  </button>
                </div>
              )}
              
              {order.driver_status === 'picked_up_from_seller' && (
                <button
                  onClick={() => handleStatusUpdate('out_for_delivery')}
                  disabled={updatingStatus}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  <TruckIcon className="h-5 w-5 ml-2" />
                  جاري التوصيل للعميل
                </button>
              )}
              
              {order.driver_status === 'out_for_delivery' && (
                <button
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={updatingStatus}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  <CheckCircleIcon className="h-5 w-5 ml-2" />
                  تم التسليم بنجاح
                </button>
              )}
            </div>
          </div>
        )}

        {order.driver_status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 ml-2" />
              <div>
                <p className="font-bold text-red-900">تم رفض الطلب</p>
                <p className="text-sm text-red-700">لقد قمت برفض هذا الطلب. شكراً لك.</p>
              </div>
            </div>
          </div>
        )}

        {isDelivered && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 ml-2" />
              <div>
                <p className="font-bold text-green-900">تم التسليم بنجاح</p>
                <p className="text-sm text-green-700">تم إكمال هذه الشحنة</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 ml-2 mt-0.5" />
              <div>
                <p className="font-bold text-orange-900 mb-1">ملاحظات</p>
                <p className="text-sm text-orange-800">{order.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverOrderDetails
