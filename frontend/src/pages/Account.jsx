import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  MapPinIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline'
import { selectUser, selectIsAuthenticated, updateUser } from '../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../store/slices/notificationsSlice'
import api from '../services/api'

const Account = () => {
  console.log('👤 Account FULLY FUNCTIONAL component rendering... START')
  console.log('👤 Account component MOUNTED at:', new Date().toISOString())
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [activeSection, setActiveSection] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  })
  
  // Data states
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [addresses, setAddresses] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
  })
  
  // Loading states
  const [loading, setLoading] = useState({
    orders: false,
    wishlist: false,
    addresses: false,
    payment: false,
    profile: false,
  })

  // Form states
  const [showAddAddressForm, setShowAddAddressForm] = useState(false)
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    type: 'shipping',
    name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false,
  })
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'credit_card',
    last_four: '',
    expiry_month: '',
    expiry_year: '',
    cardholder_name: '',
    is_default: false,
  })

  console.log('👤 Account FULLY FUNCTIONAL - authenticated:', isAuthenticated)
  console.log('👤 Account FULLY FUNCTIONAL - user:', user)
  console.log('👤 Account FULLY FUNCTIONAL - activeSection:', activeSection)
  console.log('👤 Account FULLY FUNCTIONAL - component state:', {
    isEditingProfile,
    ordersCount: orders.length,
    wishlistCount: wishlist.length,
    addressesCount: addresses.length,
    paymentMethodsCount: paymentMethods.length,
  })

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      console.log('🔍 User data from Redux:', user)
      
      // Extract first_name and last_name from name if they don't exist
      let firstName = user.first_name || ''
      let lastName = user.last_name || ''
      
      if (!firstName && !lastName && user.name) {
        const nameParts = user.name.split(' ')
        firstName = nameParts[0] || ''
        lastName = nameParts.slice(1).join(' ') || ''
      }
      
      setProfileData({
        first_name: firstName,
        last_name: lastName,
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        country: user.country || '',
      })
    }
  }, [user])

  // Fetch data functions
  const fetchOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }))
      const response = await api.get('/orders')
      setOrders(response.data.data || [])
      console.log('✅ Orders fetched:', response.data)
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      dispatch(showErrorNotification('Failed to fetch orders'))
    } finally {
      setLoading(prev => ({ ...prev, orders: false }))
    }
  }

  const fetchWishlist = async () => {
    try {
      setLoading(prev => ({ ...prev, wishlist: true }))
      const response = await api.get('/wishlist')
      setWishlist(response.data.data || [])
      console.log('✅ Wishlist fetched:', response.data)
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error)
      dispatch(showErrorNotification('Failed to fetch wishlist'))
    } finally {
      setLoading(prev => ({ ...prev, wishlist: false }))
    }
  }

  const fetchAddresses = async () => {
    try {
      setLoading(prev => ({ ...prev, addresses: true }))
      const response = await api.get('/addresses')
      setAddresses(response.data.data || [])
      console.log('✅ Addresses fetched:', response.data)
    } catch (error) {
      console.error('❌ Error fetching addresses:', error)
      dispatch(showErrorNotification('Failed to fetch addresses'))
    } finally {
      setLoading(prev => ({ ...prev, addresses: false }))
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      setLoading(prev => ({ ...prev, payment: true }))
      const response = await api.get('/payment-methods')
      setPaymentMethods(response.data.data || [])
      console.log('✅ Payment methods fetched:', response.data)
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error)
      dispatch(showErrorNotification('Failed to fetch payment methods'))
    } finally {
      setLoading(prev => ({ ...prev, payment: false }))
    }
  }

  // Update profile function
  const updateProfile = async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }))
      
      // Log the data being sent
      console.log('🔍 Profile data being sent:', profileData)
      console.log('🔍 Profile data keys:', Object.keys(profileData))
      console.log('🔍 Profile data values:', Object.values(profileData))
      
      const response = await api.put('/user/profile', profileData)
      
      if (response.data) {
        dispatch(updateUser(response.data))
        dispatch(showSuccessNotification('Profile updated successfully!'))
        setIsEditingProfile(false)
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      dispatch(showErrorNotification('Failed to update profile'))
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
  }

  // Add address function
  const addAddress = async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData)
      if (response.data) {
        setAddresses(prev => [...prev, response.data])
        dispatch(showSuccessNotification('Address added successfully!'))
      }
    } catch (error) {
      console.error('❌ Error adding address:', error)
      dispatch(showErrorNotification('Failed to add address'))
    }
  }

  // Add payment method function
  const addPaymentMethod = async (paymentData) => {
    try {
      const response = await api.post('/payment-methods', paymentData)
      if (response.data) {
        setPaymentMethods(prev => [...prev, response.data])
        dispatch(showSuccessNotification('Payment method added successfully!'))
      }
    } catch (error) {
      console.error('❌ Error adding payment method:', error)
      dispatch(showErrorNotification('Failed to add payment method'))
    }
  }

  // Update notifications function
  const updateNotifications = async () => {
    try {
      const response = await api.put('/user/notifications', notifications)
      if (response.data) {
        dispatch(showSuccessNotification('Notification preferences updated!'))
      }
    } catch (error) {
      console.error('❌ Error updating notifications:', error)
      dispatch(showErrorNotification('Failed to update notifications'))
    }
  }

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'auth/logout' })
    navigate('/login')
    dispatch(showSuccessNotification('Logged out successfully'))
  }

  if (!isAuthenticated) {
    console.log('👤 Not authenticated, redirecting to login')
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">مرحباً بعودتك</h1>
            <p className="text-gray-600 mb-8">يرجى تسجيل الدخول للوصول إلى حسابك</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
            >
              تسجيل الدخول إلى حسابك
            </button>
          </div>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      id: 'overview',
      name: 'نظرة عامة',
      icon: UserIcon,
      description: 'ملخص الحساب والملف الشخصي',
    },
    {
      id: 'orders',
      name: 'الطلبات',
      icon: ShoppingBagIcon,
      description: 'سجل الطلبات والتتبع',
    },
    {
      id: 'wishlist',
      name: 'قائمة الرغبات',
      icon: HeartIcon,
      description: 'العناصر المحفوظة والمفضلة',
    },
    {
      id: 'addresses',
      name: 'العناوين',
      icon: MapPinIcon,
      description: 'عناوين الشحن والفواتير',
    },
    {
      id: 'payment',
      name: 'طرق الدفع',
      icon: CreditCardIcon,
      description: 'البطاقات وخيارات الدفع',
    },
    {
      id: 'notifications',
      name: 'الإشعارات',
      icon: BellIcon,
      description: 'تفضيلات البريد الإلكتروني والرسائل النصية',
    },
    {
      id: 'security',
      name: 'الأمان',
      icon: ShieldCheckIcon,
      description: 'كلمة المرور والمصادقة',
    },
    {
      id: 'settings',
      name: 'الإعدادات',
      icon: CogIcon,
      description: 'تفضيلات الحساب',
    },
  ]

  const renderOverview = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 truncate">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-blue-100 mb-2 sm:mb-4 text-sm sm:text-base truncate">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {user?.role === 'admin' && (
                  <span className="bg-purple-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium">
                    مستخدم مدير
                  </span>
                )}
                <span className="bg-green-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium flex items-center">
                  <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  موثق
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-200 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            تعديل الملف الشخصي
          </button>
        </div>
      </div>

      {/* Profile Edit Form */}
      {isEditingProfile && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">تعديل الملف الشخصي</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العائلة</label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
              <input
                type="text"
                value={profileData.city}
                onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الولاية</label>
              <input
                type="text"
                value={profileData.state}
                onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الرمز البريدي</label>
              <input
                type="text"
                value={profileData.postal_code}
                onChange={(e) => setProfileData(prev => ({ ...prev, postal_code: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البلد</label>
              <input
                type="text"
                value={profileData.country}
                onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              onClick={updateProfile}
              disabled={loading.profile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.profile ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      )}

    </div>
  )

  const renderOrders = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">سجل الطلبات</h3>
      
      {loading.orders ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">جاري تحميل الطلبات...</p>
          </div>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">التاريخ: {new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">الإجمالي: ${order.total}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات بعد</h4>
            <p className="text-gray-600 mb-6">ابدأ التسوق لرؤية سجل الطلبات</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              ابدأ التسوق
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderWishlist = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">قائمة الرغبات</h3>
      
      {loading.wishlist ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-pink-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">جاري تحميل قائمة الرغبات...</p>
          </div>
        </div>
      ) : wishlist.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <img
                  src={item.product?.image || '/placeholder.jpg'}
                  alt={item.product?.name}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg mb-3 sm:mb-4"
                />
                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base truncate">{item.product?.name}</h4>
                <p className="text-base sm:text-lg font-bold text-blue-600 mb-3 sm:mb-4">${item.product?.price}</p>
                <button
                  onClick={() => navigate(`/products/${item.product_id}`)}
                  className="w-full bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  عرض المنتج
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="text-center py-8 sm:py-12">
            <HeartIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">قائمة الرغبات فارغة</h4>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">احفظ العناصر التي تحبها لوقت لاحق</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-pink-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-pink-700 transition-colors text-sm sm:text-base"
            >
              تصفح المنتجات
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderAddresses = () => {
    const handleAddAddress = () => {
      addAddress(newAddress)
      setNewAddress({
        type: 'shipping',
        name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false,
      })
      setShowAddAddressForm(false)
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">عناوين الشحن</h3>
          <button
            onClick={() => setShowAddAddressForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            إضافة عنوان جديد
          </button>
        </div>

        {showAddAddressForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">إضافة عنوان جديد</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="shipping">شحن</option>
                  <option value="billing">فوترة</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الولاية</label>
                <input
                  type="text"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الرمز البريدي</label>
                <input
                  type="text"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البلد</label>
                <input
                  type="text"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="mr-2"
                  />
                  تعيين كعنوان افتراضي
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddAddressForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                إضافة عنوان
              </button>
            </div>
          </div>
        )}
        
        {loading.addresses ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل العناوين...</p>
            </div>
          </div>
        ) : addresses.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{address.name}</p>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-sm text-gray-600">{address.country}</p>
                      {address.is_default && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          افتراضي
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <MapPinIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد عناوين محفوظة</h4>
              <p className="text-gray-600">أضف عناوين لتسجيل أسرع</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderPayment = () => {
    const handleAddPayment = () => {
      addPaymentMethod(newPaymentMethod)
      setNewPaymentMethod({
        type: 'credit_card',
        last_four: '',
        expiry_month: '',
        expiry_year: '',
        cardholder_name: '',
        is_default: false,
      })
      setShowAddPaymentForm(false)
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">طرق الدفع</h3>
          <button
            onClick={() => setShowAddPaymentForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            إضافة طريقة دفع
          </button>
        </div>

        {showAddPaymentForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">إضافة طريقة دفع جديدة</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع البطاقة</label>
                <select
                  value={newPaymentMethod.type}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر نوع البطاقة</option>
                  <option value="visa">فيزا</option>
                  <option value="mastercard">ماستر كارد</option>
                  <option value="amex">أمريكان إكسبريس</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">آخر 4 أرقام</label>
                <input
                  type="text"
                  value={newPaymentMethod.last_four}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, last_four: e.target.value }))}
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">شهر الانتهاء</label>
                <select
                  value={newPaymentMethod.expiry_month}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiry_month: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">الشهر</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سنة الانتهاء</label>
                <select
                  value={newPaymentMethod.expiry_year}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiry_year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">السنة</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={new Date().getFullYear() + i} value={new Date().getFullYear() + i}>
                      {new Date().getFullYear() + i}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newPaymentMethod.is_default}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="mr-2"
                  />
                  تعيين كطريقة دفع افتراضية
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddPaymentForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                إضافة طريقة دفع
              </button>
            </div>
          </div>
        )}
        
        {loading.payment ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل طرق الدفع...</p>
            </div>
          </div>
        ) : paymentMethods.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CreditCardIcon className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last_four}
                        </p>
                        <p className="text-sm text-gray-600">
                          تنتهي {method.expiry_month}/{method.expiry_year}
                        </p>
                        {method.is_default && (
                          <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            افتراضي
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد طرق دفع محفوظة</h4>
              <p className="text-gray-600">أضف بطاقات لتسجيل أسرع</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">تفضيلات الإشعارات</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">الإشعارات البريد الإلكتروني</h4>
            <p className="text-sm text-gray-600">تلقي تحديثات الطلبات والعروض الترويجية</p>
          </div>
          <button
            onClick={() => setNotifications(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              notifications.email_notifications ? 'translate-x-6' : 'translate-x-1'
            }`}></span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">الإشعارات النصية</h4>
            <p className="text-sm text-gray-600">الحصول على رسائل نصية للتحديثات المهمة</p>
          </div>
          <button
            onClick={() => setNotifications(prev => ({ ...prev, sms_notifications: !prev.sms_notifications }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.sms_notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              notifications.sms_notifications ? 'translate-x-6' : 'translate-x-1'
            }`}></span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">رسائل التسويق</h4>
            <p className="text-sm text-gray-600">تلقي عروض خاصة وتوصيات</p>
          </div>
          <button
            onClick={() => setNotifications(prev => ({ ...prev, marketing_emails: !prev.marketing_emails }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.marketing_emails ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              notifications.marketing_emails ? 'translate-x-6' : 'translate-x-1'
            }`}></span>
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={updateNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            حفظ التفضيلات
          </button>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">إعدادات الأمان</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">المصادقة الثنائية</h4>
            <p className="text-sm text-gray-600">إضافة طبقة أمان إضافية لحسابك</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors">
            تفعيل
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">تغيير كلمة المرور</h4>
            <p className="text-sm text-gray-600">تحديث كلمة المرور بانتظام</p>
          </div>
          <button
            onClick={() => navigate('/change-password')}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            تحديث
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">سجل الدخول</h4>
            <p className="text-sm text-gray-600">عرض نشاط تسجيل الدخول الحديث</p>
          </div>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-700 transition-colors">
            عرض
          </button>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">إعدادات الحساب</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">اللغة</h4>
            <p className="text-sm text-gray-600">اختر لغتك المفضلة</p>
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>English</option>
            <option>العربية</option>
            <option>Spanish</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">العملة</h4>
            <p className="text-sm text-gray-600">عرض الأسعار بعملتك المفضلة</p>
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>USD</option>
            <option>EUR</option>
            <option>SAR</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">إعدادات الخصوصية</h4>
            <p className="text-sm text-gray-600">التحكم في بياناتك وخصوصيتك</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            إدارة
          </button>
        </div>
      </div>
      
      {/* Logout Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'orders':
        return renderOrders()
      case 'wishlist':
        return renderWishlist()
      case 'addresses':
        return renderAddresses()
      case 'payment':
        return renderPayment()
      case 'notifications':
        return renderNotifications()
      case 'security':
        return renderSecurity()
      case 'settings':
        return renderSettings()
      default:
        return renderOverview()
    }
  }

  console.log('👤 Rendering FULLY FUNCTIONAL account page for user:', user?.name)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">حسابي</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">إدارة إعدادات وتفضيلات حسابك</p>
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between"
          >
            <span className="font-medium text-gray-900">
              {menuItems.find(item => item.id === activeSection)?.name || 'القائمة'}
            </span>
            <Bars3Icon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Menu - Hidden on mobile, shown when toggled */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <nav className="space-y-1 sm:space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{item.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </nav>
              
              {/* Admin Dashboard Link */}
              {user?.role === 'admin' && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="w-full bg-purple-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center text-sm sm:text-base"
                  >
                    <CogIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="truncate">لوحة تحكم المدير</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
