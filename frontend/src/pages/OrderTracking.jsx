import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  TruckIcon,
  ShoppingBagIcon,
  HomeIcon,
  MapPinIcon
} from '@heroicons/react/24/solid'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../services/api'
import LoadingSpinner from '../components/UI/LoadingSpinner'

// Custom Map Icons
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const MapBoundsUpdater = ({ bounds }) => {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 14)
      } else {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [bounds, map])
  return null
}

const OrderTracking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await api.get(`/orders/${id}`)
        setOrder(response.data)
      } catch (err) {
        setError('فشل في تحميل تفاصيل الطلب')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrderData()
    // Poll every 15 seconds if order is out_for_delivery
    const interval = setInterval(() => {
        if(order && (order.status === 'shipped' || order.driver_status === 'out_for_delivery' || order.status === 'processing')) {
            api.get(`/orders/${id}`).then(res => setOrder(res.data)).catch(console.error)
        }
    }, 15000);
    return () => clearInterval(interval);
  }, [id])

  if (loading) return <LoadingSpinner />
  if (error || !order) return <div className="text-center py-20 text-red-500 font-bold">{error || 'الطلب غير موجود'}</div>

  // Determine current step
  const steps = [
    { id: 'pending', title: 'تم استلام الطلب', icon: ShoppingBagIcon, description: 'تم استلام طلبك وهو قيد المراجعة' },
    { id: 'processing', title: 'قيد التجهيز', icon: ShoppingBagIcon, description: 'يقوم البائع بتجهيز طلبك الآن' },
    { id: 'shipped', title: 'جاري التوصيل', icon: TruckIcon, description: order.driver ? `التوصيل بواسطة المندوب: ${order.driver?.first_name || order.driver?.name || ''}` : 'تم تسليم الطلب للمندوب' },
    { id: 'delivered', title: 'تم التسليم', icon: CheckCircleIcon, description: 'تم تسليم الطلب بنجاح' }
  ]

  let currentStepIndex = 0
  if (order.status === 'processing') currentStepIndex = 1
  if (order.status === 'shipped' || order.driver_status === 'out_for_delivery' || order.driver_status === 'picked_up_from_seller') currentStepIndex = 2
  if (order.status === 'delivered') currentStepIndex = 3
  if (order.status === 'cancelled') currentStepIndex = -1

  // Map coordinates
  const markers = []
  const bounds = []

  // Customer location
  if (order.latitude && order.longitude) {
    markers.push({ pos: [order.latitude, order.longitude], icon: userIcon, popup: 'موقع التوصيل (منزلك)' })
    bounds.push([order.latitude, order.longitude])
  } else if (order.shipping_address && order.shipping_address.latitude) {
      markers.push({ pos: [order.shipping_address.latitude, order.shipping_address.longitude], icon: userIcon, popup: 'موقع التوصيل' })
      bounds.push([order.shipping_address.latitude, order.shipping_address.longitude])
  }

  // Driver location (if shipped and driver assigned)
  if (currentStepIndex === 2 && order.driver && order.driver.latitude && order.driver.longitude) {
    markers.push({ pos: [order.driver.latitude, order.driver.longitude], icon: driverIcon, popup: 'المندوب حالياً هنا' })
    bounds.push([order.driver.latitude, order.driver.longitude])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">تتبع الطلب #{order.order_number || order.id}</h1>
          <button onClick={() => navigate('/orders')} className="text-amber-600 hover:text-amber-700 font-medium">العودة للطلبات</button>
        </div>

        {order.status === 'cancelled' ? (
             <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center text-lg font-bold">
                 تم إلغاء هذا الطلب.
             </div>
        ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 border border-gray-100 mb-8">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200" style={{ zIndex: 0 }}></div>
                <div className="absolute top-8 right-0 h-1 bg-amber-500 transition-all duration-700 ease-in-out" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%`, zIndex: 1 }}></div>

                <div className="relative z-10 flex justify-between">
                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const Icon = step.icon

                    return (
                      <div key={step.id} className="flex flex-col items-center justify-start w-1/4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-colors duration-300 shadow-md ${
                          isCompleted ? 'bg-amber-500 border-amber-200 text-white' : 'bg-white border-gray-200 text-gray-400'
                        }`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <h3 className={`mt-4 font-bold text-sm md:text-base text-center ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.title}
                        </h3>
                        {isCurrent && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs md:text-sm text-gray-500 text-center mt-2 px-1"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
        )}

        {/* Live Map Section (Only show if we have user location) */}
        {bounds.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <MapPinIcon className="w-6 h-6 text-amber-500" />
                 التتبع المباشر للخريطة
               </h2>
               {currentStepIndex === 2 && (
                   <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                       المندوب يتحرك الآن
                   </span>
               )}
            </div>
            <div className="h-96 w-full relative z-0">
              <MapContainer 
                center={bounds[0]} 
                zoom={14} 
                className="w-full h-full z-0"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {markers.map((marker, i) => (
                  <Marker key={i} position={marker.pos} icon={marker.icon}>
                    <Popup>{marker.popup}</Popup>
                  </Marker>
                ))}
                <MapBoundsUpdater bounds={bounds} />
              </MapContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default OrderTracking
