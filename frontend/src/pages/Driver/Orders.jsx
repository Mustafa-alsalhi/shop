import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { ShoppingBagIcon, TruckIcon, CheckCircleIcon, ClockIcon, MapPinIcon, PhoneIcon, UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import LocationPicker from '../../components/LocationPicker'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Custom Map Icons
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapBoundsUpdater = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [bounds, map]);
  return null;
}

const DriverOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [nearbyStores, setNearbyStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('active')

  const [driverProfile, setDriverProfile] = useState(null)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [workZones, setWorkZones] = useState([])

  useEffect(() => {
    fetchSettings()
    fetchProfile()
    fetchOrders()
  }, [activeTab])

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
        navigate('/login', { state: { message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.' } });
      }
    }
  }

  const handleManualLocationSelect = async (loc) => {
    try {
      setUpdatingProfile(true);
      await api.put('/driver/profile/location', { latitude: loc.latitude, longitude: loc.longitude });
      await fetchProfile();
      setShowLocationPicker(false);
      alert('تم تحديث موقعك بنجاح!');
    } catch (e) {
      alert('حدث خطأ في تحديث الموقع' + (e.response && e.response.data && e.response.data.message ? ': ' + e.response.data.message : ''));
    } finally {
      setUpdatingProfile(false);
    }
  }

  const handleStatusToggle = async () => {
    if (!driverProfile) return;
    setUpdatingProfile(true);
    try {
      const newStatus = !driverProfile.is_online;
      
      // Update location if going online
      if (newStatus === true && navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            // timeout after 5 seconds to not block UI forever
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          
          if (position.coords.latitude && position.coords.longitude) {
            await api.put('/driver/profile/location', {
               latitude: position.coords.latitude,
               longitude: position.coords.longitude
            });
          }
        } catch (locationErr) {
          console.log('Could not get actual location, continuing with status update', locationErr);
        }
      }

      const response = await api.put('/driver/profile/status', { is_online: newStatus });
      setDriverProfile(response.data.data);
    } catch (err) {
      alert('فشل في تحديث الحالة');
    } finally {
      setUpdatingProfile(false);
    }
  }

  const handleZoneChange = async (e) => {
    if (!driverProfile) return;
    setUpdatingProfile(true);
    try {
      const newZone = e.target.value;
      const response = await api.put('/driver/profile/status', { work_zone: newZone });
      setDriverProfile(response.data.data);
    } catch (err) {
      alert('فشل في تحديث منطقة العمل');
    } finally {
      setUpdatingProfile(false);
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      if (activeTab === 'nearby_stores') {
        const response = await api.get('/driver/nearby-stores')
        setNearbyStores(response.data.data || response.data)
      } else {
        const endpoint = activeTab === 'active' ? '/driver/orders' : '/driver/orders/completed'
        const response = await api.get(endpoint)
        
        if (activeTab === 'active') {
          setOrders(response.data.data || response.data)
        } else {
          setCompletedOrders(response.data.data || response.data)
        }
      }
      setLoading(false)
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login', { state: { message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.' } });
      } else {
        setError('فشل في جلب الطلبات: ' + err.message);
        setLoading(false);
      }
    }
  }

  const isRestaurantOrder = (order) => {
    return order?.seller?.type === 'restaurant' ||
      order?.items?.some(i => i.product?.seller?.type === 'restaurant' || i.selected_options || i.product?.food_options);
  };

  const getStatusBadge = (status, isRestaurant = false) => {
    const statusConfig = {
      assigned: { 
        label: isRestaurant ? 'طلب مطعم جديد 🍔' : 'معين', 
        color: isRestaurant ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800' 
      },
      picked_up_from_seller: { 
        label: isRestaurant ? 'تم استلام الوجبة 🛵' : 'تم الاستلام من البائع', 
        color: 'bg-yellow-100 text-yellow-800' 
      },
      out_for_delivery: { 
        label: isRestaurant ? 'في طريق التوصيل 🚀' : 'جاري التوصيل', 
        color: 'bg-orange-100 text-orange-800' 
      },
      delivered: { 
        label: 'تم التسليم بنجاح ✅', 
        color: 'bg-green-100 text-green-800' 
      }
    }
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const handleOrderClick = (orderId) => {
    navigate(`/driver/orders/${orderId}`)
  }



  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold flex items-center">
            <TruckIcon className="h-6 w-6 ml-2" />
            طلباتي
          </h1>
        </div>
      </div>

      {/* Driver Status Card */}
      {driverProfile && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className={`flex-shrink-0 h-4 w-4 rounded-full ${driverProfile.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              <div>
                <p className="font-bold text-gray-900">{driverProfile.is_online ? 'أنت متاح للعمل' : 'أنت متوقف عن العمل'}</p>
                <div className="text-xs text-gray-500 flex flex-col">
                   <span>جاهز لاستلام طلبات التوصيل</span>
                   <span className={`font-semibold mt-1 ${driverProfile.latitude && driverProfile.longitude ? 'text-green-600' : 'text-red-500'}`}>
                     {driverProfile.latitude && driverProfile.longitude ? '📍 موقعك مسجل ومتاح للرصد' : '⚠️ موقعك غير مسجل (لن تتلقى طلبات)'}
                   </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowLocationPicker(true)}
                disabled={updatingProfile}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                <GlobeAltIcon className="h-4 w-4" />
                <span>تحديث موقعي جغرافياً</span>
              </button>

              <select
                value={driverProfile.work_zone || ''}
                onChange={handleZoneChange}
                disabled={updatingProfile}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
              >
                <option value="">اختر منطقة العمل...</option>
                {workZones.map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
              
              <button
                onClick={handleStatusToggle}
                disabled={updatingProfile}
                className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors ${
                  driverProfile.is_online ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } disabled:opacity-50`}
              >
                {updatingProfile ? 'جاري التحديث...' : (driverProfile.is_online ? 'إيقاف العمل' : 'بدء العمل')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative overflow-hidden">
            <h3 className="text-xl font-bold mb-4 text-indigo-900 border-b pb-2">حدد موقع تواجدك الحي (لالتقاط الطلبات القريبة)</h3>
            <LocationPicker 
              onLocationSelect={handleManualLocationSelect} 
              initialPosition={driverProfile.latitude ? [parseFloat(driverProfile.latitude), parseFloat(driverProfile.longitude)] : null} 
            />
            <button 
              onClick={() => setShowLocationPicker(false)}
              className="absolute top-4 left-4 text-gray-500 hover:text-gray-800"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            الطلبات النشطة
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            الطلبات المكتملة
          </button>
          <button
            onClick={() => setActiveTab('nearby_stores')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'nearby_stores'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            المتاجر القريبة
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 mt-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <>
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="h-4 w-4 bg-gray-200 rounded-full ml-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="h-4 w-4 bg-gray-200 rounded-full ml-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="h-4 w-4 bg-gray-200 rounded-full ml-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </>
        ) : activeTab === 'nearby_stores' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px] border border-gray-200">
            {/* Map sidebar - List of stores */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-l border-gray-200 overflow-y-auto bg-gray-50 flex flex-col">
              <div className="p-4 border-b bg-white">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <MapPinIcon className="h-5 w-5 ml-2 text-indigo-600" />
                  المتاجر المتاحة حولك ({nearbyStores.length})
                </h3>
                <p className="text-xs text-gray-500 mt-1">تمركز بالقرب منها لتلقي طلبات أسرع</p>
              </div>
              <div className="p-2 space-y-2 flex-grow overflow-y-auto">
                {nearbyStores.map((store, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center overflow-hidden border border-indigo-100 flex-shrink-0">
                        {store.avatar ? (
                          <img src={store.avatar} alt={store.store_name} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBagIcon className="h-5 w-5 text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{store.store_name}</h4>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPinIcon className="h-3 w-3 inline ml-1 flex-shrink-0" />
                          <span className="truncate">{store.city || 'المدينة غير محددة'}</span>
                        </div>
                      </div>
                      <div className="text-left whitespace-nowrap">
                        {store.distance_km != null ? (
                          <div className="text-indigo-600 font-bold font-mono text-sm">
                            {parseFloat(store.distance_km).toFixed(1)} <span className="text-xs">كم</span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">مسافة مجهولة</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {nearbyStores.length === 0 && (
                  <div className="text-center py-8 px-4 text-gray-500">
                    لا يوجد متاجر مسجلة حالياً
                  </div>
                )}
              </div>
            </div>
            
            {/* Map Container */}
            <div className="w-full md:w-2/3 h-full relative" style={{ zIndex: 0 }}>
              {(() => {
                const mapBounds = [];
                // Push driver location if available
                if (driverProfile?.latitude && driverProfile?.longitude) {
                   mapBounds.push([parseFloat(driverProfile.latitude), parseFloat(driverProfile.longitude)]);
                }
                
                // Push stores locations
                nearbyStores.forEach(s => {
                   if (s.latitude && s.longitude) {
                      mapBounds.push([parseFloat(s.latitude), parseFloat(s.longitude)]);
                   }
                });

                return (
                  <MapContainer 
                    center={mapBounds.length > 0 ? mapBounds[0] : [24.7136, 46.6753]} 
                    zoom={12} 
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                  >
                    <TileLayer
                      attribution={"&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"}
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {mapBounds.length > 1 && <MapBoundsUpdater bounds={mapBounds} />}

                    {/* Driver Marker */}
                    {driverProfile?.latitude && driverProfile?.longitude && (
                      <Marker position={[parseFloat(driverProfile.latitude), parseFloat(driverProfile.longitude)]} icon={driverIcon}>
                        <Popup>
                          <div className="text-center font-bold text-blue-700">موقعك الحالي</div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Stores Markers */}
                    {nearbyStores.map((store, idx) => {
                      if (!store.latitude || !store.longitude) return null;
                      return (
                        <Marker key={`store-${idx}`} position={[parseFloat(store.latitude), parseFloat(store.longitude)]} icon={storeIcon}>
                          <Popup>
                            <div className="text-center">
                              <div className="font-bold text-gray-900">{store.store_name}</div>
                              {store.distance_km != null && (
                                <div className="text-xs text-indigo-600 mt-1 font-semibold">يبعد عنك: {parseFloat(store.distance_km).toFixed(1)} كم</div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })}
                  </MapContainer>
                )
              })()}
            </div>
          </div>
        ) : activeTab === 'active' ? (
          orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد طلبات نشطة حالياً</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-lg">#{order.order_number}</h3>
                      {isRestaurantOrder(order) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          🍔 وجبة مطعم ساخنة
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {getStatusBadge(order.driver_status, isRestaurantOrder(order))}
                </div>

                <div className="space-y-2">
                  {order.items?.[0]?.product?.seller && (
                    <div className="flex items-center text-sm text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <ShoppingBagIcon className="h-4 w-4 ml-2 text-indigo-600 shrink-0" />
                      <span className="text-gray-500 ml-1 text-xs">{isRestaurantOrder(order) ? 'المطعم:' : 'المتجر:'}</span>
                      <span className="font-semibold">{order.items[0].product.seller.store_name}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 ml-2 text-gray-400 shrink-0" />
                    <span className="font-medium">{order.user?.name || `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim() || 'غير محدد'}</span>
                  </div>

                  {order.formatted_address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 ml-2 mt-0.5 text-gray-400 shrink-0" />
                      <span className="line-clamp-2">{order.formatted_address}</span>
                    </div>
                  )}

                  {order.user?.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 ml-2 text-gray-400 shrink-0" />
                      <a href={`tel:${order.user.phone}`} className="text-blue-600 hover:text-blue-800" onClick={(e) => e.stopPropagation()}>
                        {order.user.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700 block border-b border-gray-100 pb-1 mb-1">
                      الإجمالي: {order.items?.[0]?.product?.currency || 'SAR'} {parseFloat(order.total_amount || 0).toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-indigo-600 block">
                      قيمة التوصيل لك: {order.items?.[0]?.product?.currency || 'SAR'} {parseFloat(order.shipping || 0).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-indigo-500 font-medium">
                    التفاصيل ←
                  </span>
                </div>
              </div>
            ))
          )
        ) : (
          completedOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <CheckCircleIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد طلبات مكتملة</p>
            </div>
          ) : (
            completedOrders.map(order => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow opacity-75"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">#{order.order_number}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(order.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    تم التسليم
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 ml-2" />
                    <span className="font-medium">{order.user?.name || 'غير محدد'}</span>
                  </div>

                  {order.formatted_address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 ml-2 mt-0.5" />
                      <span className="line-clamp-2">{order.formatted_address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700 block border-b border-gray-100 pb-1 mb-1">
                      الإجمالي: {order.items?.[0]?.product?.currency || 'SAR'} {parseFloat(order.total_amount || 0).toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-indigo-600 block">
                      قيمة التوصيل لك: {order.items?.[0]?.product?.currency || 'SAR'} {parseFloat(order.shipping || 0).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-indigo-500 font-medium">
                    التفاصيل ←
                  </span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}

export default DriverOrders
