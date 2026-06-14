import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  MapPinIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  XMarkIcon,
  ShieldCheckIcon,
  TruckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { selectCartItems, selectCartTotal, selectCartSubtotal, selectCartTax, clearCart, fetchCart } from '../store/slices/cartSlice'
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../store/slices/uiSlice'
import api from '../services/api'
import orderService from '../services/orderService'
import shippingService from '../services/shippingService'
import paymentMethodService from '../services/paymentMethodService'
import LoadingSpinner from '../components/UI/LoadingSpinner'

// Helper function for default icons
const getDefaultIconElement = (code, isSelected) => {
  switch (code) {
    case 'credit_card':
      return <CreditCardIcon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
    case 'paypal':
      return <div className={`h-5 w-5 flex items-center justify-center font-bold ${isSelected ? 'text-white' : 'text-blue-600'}`}>P</div>
    case 'bank_transfer':
      return <div className={`h-5 w-5 flex items-center justify-center font-bold ${isSelected ? 'text-white' : 'text-green-600'}`}>B</div>
    case 'cash_on_delivery':
      return <div className={`h-5 w-5 flex items-center justify-center ${isSelected ? 'text-white' : 'text-orange-600'}`}>💵</div>
    default:
      return <div className={`h-5 w-5 flex items-center justify-center font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}>$</div>
  }
}

// Helper function to get currency from cart items
const getCartCurrency = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return 'USD'; // Default currency
  }
  
  // Get currency from first item (assuming all items use same currency)
  const firstItem = cartItems[0];
  return firstItem.currency || 'USD';
}

const Checkout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const cartItems = useSelector(selectCartItems)
  const cartSubtotal = useSelector(selectCartSubtotal)
  const cartTax = useSelector(selectCartTax)
  const cartTotal = useSelector(selectCartTotal)
  
  // Get currency from cart items
  const currency = getCartCurrency(cartItems)

  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Dynamic data states
  const [shippingCompanies, setShippingCompanies] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)

  // Drag states for horizontal scrolling
  const [shippingDrag, setShippingDrag] = useState({ isDragging: false, startX: 0, scrollLeft: 0 })
  const [paymentDrag, setPaymentDrag] = useState({ isDragging: false, startX: 0, scrollLeft: 0 })

  // Load cart data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart()).catch(error => {
        // If cart fails to load, don't block the checkout page
        // User can still proceed with checkout
      })
    }
  }, [dispatch, isAuthenticated])

  // Load shipping companies and payment methods
  useEffect(() => {
    const loadShippingAndPaymentData = async () => {
      try {
        setLoadingShipping(true)
        setLoadingPayment(true)
        
        const [shippingData, paymentData] = await Promise.all([
          shippingService.getActiveShippingCompanies(),
          paymentMethodService.getActivePaymentMethods()
        ])
        
        setShippingCompanies(shippingData)
        setPaymentMethods(paymentData)
      } catch (error) {
      } finally {
        setLoadingShipping(false)
        setLoadingPayment(false)
      }
    }

    loadShippingAndPaymentData()
  }, [])

  // Utility function for image URLs
  const getImageUrl = useCallback((imageUrl, productName, size = 80) => {
    // Get base URL from environment or fallback to Railway production
    const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-d82a.up.railway.app/api'
    const publicUrl = baseUrl.replace('/api', '')
    
    if (imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' && imageUrl !== null) {
      if (imageUrl.startsWith('http')) {
        return imageUrl
      }
      // If it's a relative path starting with /images/, convert to full URL
      if (imageUrl.startsWith('/images/')) {
        return `${publicUrl}${imageUrl}`
      }
      // Otherwise, treat as relative path
      return `${publicUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }
    
    // Fallback to placeholder
    const encodedName = encodeURIComponent(productName || 'Product')
    return `https://via.placeholder.com/${size}x${size}/f3f4f6/6b7280?text=${encodedName}`
  }, [])

  const [formData, setFormData] = useState({
    // Personal Information
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    
    // Shipping Information
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    
    // Payment Information
    payment_method: '',
    reference_number: '',
    phone_number: '',
    payment_notes: '',
    payer_name: '',
    payment_image: '',
    
    // Billing Information (same as shipping by default)
    billing_address: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: '',
    
    // Order Notes
    order_notes: '',
    
    // Shipping Method
    shipping_method: 'standard',
    
    // Shipping Company
    shipping_company: '',
  })

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Check if cart is empty (but don't block if cart fails to load)
    if (cartItems && cartItems.length === 0) {
      navigate('/cart')
      return
    }

    // Pre-fill user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      }))
    }
  }, [isAuthenticated, navigate, cartItems, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handlePaymentMethodChange = (paymentMethod) => {
    setFormData(prev => ({
      ...prev,
      payment_method: paymentMethod.code
    }))
    setShowPaymentModal(true)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          payment_image: 'حجم الصورة يجب أن يكون أقل من 10MB'
        }))
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          payment_image: 'يجب اختيار ملف صورة صالح'
        }))
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          payment_image: event.target.result
        }))
        // Clear error for this field
        if (errors.payment_image) {
          setErrors(prev => ({
            ...prev,
            payment_image: ''
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSameAsShipping = (e) => {
    const checked = e.target.checked
    if (checked) {
      setFormData(prev => ({
        ...prev,
        billing_address: prev.address,
        billing_city: prev.city,
        billing_state: prev.state,
        billing_postal_code: prev.postal_code,
        billing_country: prev.country,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Personal Information
    if (!formData.first_name.trim()) newErrors.first_name = 'الاسم الأول مطلوب'
    if (!formData.last_name.trim()) newErrors.last_name = 'الاسم الأخير مطلوب'
    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب'
    if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب'

    // Shipping Information
    if (!formData.address.trim()) newErrors.address = 'العنوان مطلوب'
    if (!formData.city.trim()) newErrors.city = 'المدينة مطلوبة'
    if (!formData.state.trim()) newErrors.state = 'الولاية مطلوبة'
    if (!formData.postal_code.trim()) newErrors.postal_code = 'الرمز البريدي مطلوب'
    if (!formData.country.trim()) newErrors.country = 'البلد مطلوب'

    // Shipping Company
    if (!formData.shipping_company.trim()) {
      newErrors.shipping_company = 'شركة التوصيل مطلوبة'
      dispatch(showErrorNotification('يرجى اختيار شركة التوصيل'))
    }

    // Payment Method
    if (!formData.payment_method.trim()) {
      newErrors.payment_method = 'طريقة الدفع مطلوبة'
      dispatch(showErrorNotification('يرجى اختيار طريقة الدفع'))
    }

    // Payment Information
    if (formData.payment_method) {
      if (!formData.payer_name.trim()) {
        newErrors.payer_name = 'اسم الشخص الذي قام بالإيداع مطلوب'
        dispatch(showErrorNotification('يرجى إدخال اسم الشخص الذي قام بالإيداع'))
      }
      if (!formData.reference_number.trim()) {
        newErrors.reference_number = 'رقم المرجع مطلوب'
        dispatch(showErrorNotification('يرجى إدخال رقم المرجع للإيداع'))
      }
      if (!formData.phone_number.trim()) {
        newErrors.phone_number = 'رقم الهاتف مطلوب'
        dispatch(showErrorNotification('يرجى إدخال رقم الهاتف'))
      }
      if (!formData.payment_image) {
        newErrors.payment_image = 'صورة إثبات الدفع مطلوبة'
        dispatch(showErrorNotification('يرجى رفع صورة إثبات الدفع'))
      }
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      // Prepare order data for backend
      const orderData = {
        shipping_address: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
        },
        billing_address: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
        },
        payment_method: formData.payment_method,
        shipping_company: formData.shipping_company,
        notes: formData.order_notes,
      }

      // Save order to database
      const response = await orderService.createOrder(orderData)

      if (response.data) {
        const order = response.data
        
        // Create payment request
        const selectedPaymentMethod = paymentMethods.find(m => m.code === formData.payment_method)
        const paymentRequestData = {
          order_id: order.id,
          payment_method: formData.payment_method,
          payment_method_name: selectedPaymentMethod?.name || 'غير محدد',
          payer_name: formData.payer_name,
          reference_number: formData.reference_number,
          phone_number: formData.phone_number,
          payment_notes: formData.payment_notes,
          payment_amount: cartTotal,
          payment_fee: typeof selectedPaymentMethod?.fee === 'number' ? selectedPaymentMethod.fee : parseFloat(selectedPaymentMethod?.fee || 0),
        }

        // Handle payment image upload
        if (formData.payment_image) {
          try {
            // Convert base64 to blob for upload
            const response_img = await fetch(formData.payment_image)
            const blob = await response_img.blob()
            const file = new File([blob], 'payment_image.jpg', { type: 'image/jpeg' })
            
            const formData_upload = new FormData()
            formData_upload.append('payment_image', file)
            formData_upload.append('order_id', order.id)
            formData_upload.append('payment_method', formData.payment_method)
            formData_upload.append('payment_method_name', selectedPaymentMethod?.name || 'غير محدد')
            formData_upload.append('payer_name', formData.payer_name)
            formData_upload.append('reference_number', formData.reference_number)
            formData_upload.append('phone_number', formData.phone_number)
            formData_upload.append('payment_notes', formData.payment_notes)
            formData_upload.append('payment_amount', cartTotal)
            formData_upload.append('payment_fee', paymentRequestData.payment_fee)

            const paymentResponse = await api.post('/admin/payment-requests', formData_upload, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
          } catch (paymentError) {
            throw paymentError
          }
        } else {
          try {
            const paymentResponse = await api.post('/admin/payment-requests', paymentRequestData)
          } catch (paymentError) {
            throw paymentError
          }
        }
        
        // Store order and show success modal FIRST
        setCreatedOrder(order)
        setShowSuccessModal(true)
        setShowPaymentModal(false)
        
        // Show success notification
        dispatch(showSuccessNotification('تم إنشاء الطلب وإرسال طلب الدفع بنجاح!', {
          title: 'نجاح',
          duration: 5000
        }))
        
        // Don't clear cart automatically - it will be cleared when user confirms in modal
        
      } else {
        dispatch(showErrorNotification('فشل في إنشاء الطلب. يرجى المحاولة مرة أخرى.', {
          title: 'خطأ',
          duration: 5000
        }))
      }

    } catch (error) {
      dispatch(showErrorNotification('حدث خطأ. يرجى المحاولة مرة أخرى.', {
          title: 'خطأ',
          duration: 5000
        }))
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">الدفع</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - Left Side */}
          <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">المعلومات الشخصية</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الأول
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="محمد"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الأخير
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="أحمد"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john.doe@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  معلومات الشحن
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان الشارع
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 الشارع الرئيسي"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدينة
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="الرياض"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الولاية
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="الرياض"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الرمز البريدي
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.postal_code ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10001"
                    />
                    {errors.postal_code && (
                      <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البلد
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="المملكة العربية السعودية"
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Company Selection */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border border-blue-100">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ml-4">
                    <MapPinIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">اختر شركة التوصيل</h2>
                    <p className="text-gray-600">اختر الشركة المناسبة لتوصيل طلبك</p>
                  </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="relative">
                  {loadingShipping ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600 mx-auto mb-6"></div>
                      <p className="text-gray-600 text-lg">جاري تحميل شركات التوصيل...</p>
                    </div>
                  ) : shippingCompanies.length > 0 ? (
                    <div
                      id="shipping-companies-container"
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 cursor-grab active:cursor-grabbing"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                    >
                      {shippingCompanies.map((company) => (
                        <div
                          key={company.id}
                          className={`flex-none w-80 group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                            formData.shipping_company === company.code
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl transform scale-105'
                              : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1'
                          }`}
                          onClick={() => handleInputChange({ target: { name: 'shipping_company', value: company.code } })}
                        >
                          <div className="flex items-start">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 transition-all ${
                              formData.shipping_company === company.code
                                ? 'border-white bg-white'
                                : 'border-gray-300 group-hover:border-blue-500'
                            }`}>
                              {formData.shipping_company === company.code && (
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className={`text-lg font-bold ${
                                  formData.shipping_company === company.code ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {company.name}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  formData.shipping_company === company.code
                                    ? 'bg-white/20 text-white'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {company.delivery_days} يوم
                                </span>
                              </div>
                              <p className={`text-sm mb-4 ${
                                formData.shipping_company === company.code ? 'text-blue-100' : 'text-gray-600'
                              }`}>
                                {company.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className={`text-lg font-bold ${
                                  formData.shipping_company === company.code ? 'text-white' : 'text-blue-600'
                                }`}>
                                  ${typeof company.cost === 'number' ? company.cost.toFixed(2) : parseFloat(company.cost || 0).toFixed(2)}
                                </div>
                                <div className={`text-xs ${
                                  formData.shipping_company === company.code ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  تكلفة التوصيل
                                </div>
                              </div>
                            </div>
                          </div>
                          {formData.shipping_company === company.code && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircleIcon className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">لا توجد شركات توصيل متاحة</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border border-green-100">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center ml-4">
                    <CreditCardIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">اختر طريقة الدفع</h2>
                    <p className="text-gray-600">اختر الطريقة المناسبة لدفع طلبك</p>
                  </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="relative">
                  {loadingPayment ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-green-600 mx-auto mb-6"></div>
                      <p className="text-gray-600 text-lg">جاري تحميل طرق الدفع...</p>
                    </div>
                  ) : paymentMethods.length > 0 ? (
                    <div
                      id="payment-methods-container"
                      className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 cursor-grab active:cursor-grabbing"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                    >
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`flex-none w-80 group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                            formData.payment_method === method.code
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl transform scale-105'
                              : 'bg-white border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transform hover:-translate-y-1'
                          }`}
                          onClick={() => handlePaymentMethodChange(method)}
                        >
                          <div className="flex items-start">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 transition-all ${
                              formData.payment_method === method.code
                                ? 'border-white bg-white'
                                : 'border-gray-300 group-hover:border-green-500'
                            }`}>
                              {formData.payment_method === method.code && (
                                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className={`text-lg font-bold ${
                                  formData.payment_method === method.code ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {method.name}
                                </h3>
                                {typeof method.fee === 'number' && method.fee > 0 && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    formData.payment_method === method.code
                                      ? 'bg-white/20 text-white'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    +${method.fee.toFixed(2)} رسوم
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm mb-4 ${
                                formData.payment_method === method.code ? 'text-green-100' : 'text-gray-600'
                              }`}>
                                {method.description}
                              </p>
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ml-3 ${
                                  formData.payment_method === method.code ? 'bg-white/20' : 'bg-gray-100'
                                }`}>
                                  {method.icon_image ? (
                                    <img
                                      src={method.icon_image}
                                      alt={method.name}
                                      className="w-8 h-8 object-cover rounded-lg"
                                      onError={(e) => {
                                        // Fallback to default icons if image fails to load
                                        e.target.style.display = 'none'
                                        e.target.parentElement.innerHTML = getDefaultIconElement(method.code, formData.payment_method === method.code)
                                      }}
                                    />
                                  ) : (
                                    getDefaultIconElement(method.code, formData.payment_method === method.code)
                                  )}
                                </div>
                                <span className={`text-xs font-medium ${
                                  formData.payment_method === method.code ? 'text-green-100' : 'text-gray-500'
                                }`}>
                                  {method.name}
                                </span>
                              </div>
                            </div>
                          </div>
                          {formData.payment_method === method.code && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircleIcon className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">لا توجد طرق دفع متاحة</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات الطلب (اختياري)
                </label>
                <textarea
                  name="order_notes"
                  value={formData.order_notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="تعليمات خاصة لطلبك..."
                />
              </div>
          </div>

          {/* Order Summary Sidebar - Right Side */}
          <div className="lg:col-span-1 h-fit">
            <div className="bg-white shadow-lg rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                ملخص الطلب
              </h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems && cartItems.length > 0 ? (
                  cartItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center flex-1">
                        <img
                          src={getImageUrl(item.image_url, item.product_name, 60)}
                          alt={item.product_name}
                          className="w-14 h-14 object-cover rounded-lg mr-3"
                          onError={(e) => {
                            e.target.src = `https://picsum.photos/seed/${encodeURIComponent(item.product_name)}/60/60.jpg`
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{item.product_name}</h4>
                          <p className="text-xs text-gray-600">الكمية: {item.quantity}</p>
                          <p className="text-xs text-gray-600">{currency} {parseFloat(item.price || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right mr-3">
                        <p className="font-semibold text-gray-900 text-sm">
                          {currency} {parseFloat(item.price * item.quantity || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">سلتك فارغة</p>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-medium">{currency} {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الضريبة</span>
                  <span className="font-medium">{currency} {cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الشحن</span>
                  <span className="font-medium text-green-600">مجاني</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                  <span>الإجمالي</span>
                  <span className="text-green-600">{currency} {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كود الخصم
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    placeholder="أدخل كود الخصم"
                  />
                  <button className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm">
                    تطبيق
                  </button>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isProcessing || cartItems.length === 0}
                className="w-full btn btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    جاري المعالجة...
                  </div>
                ) : (
                  'تأكيد الطلب'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                بالضغط على هذا الطلب، أنت توافق على شروط الخدمة وسياسة الخصوصية.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Order Success Modal */}
      {showSuccessModal && createdOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-600">تم تقديم الطلب بنجاح!</h2>
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    dispatch(clearCart())
                    navigate('/orders')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    طلب #{createdOrder.id} - {createdOrder.order_number}
                  </h3>
                  <p className="text-green-700">
                    شكراً لطلبك! تم تقديم طلبك بنجاح وهو قيد المعالجة.
                  </p>
                </div>
              </div>

              {/* Order Items with Images */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">ملخص الطلب</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  {createdOrder.order_items?.map((item, index) => (
                    <div key={index} className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
                      <img
                        src={getImageUrl(item.image_url, item.product_name, 80)}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-lg mr-4"
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/seed/${encodeURIComponent(item.product_name)}/80/80.jpg`
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                        <p className="text-sm text-gray-600">السعر: {item.currency || currency} {parseFloat(item.price || 0).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {item.currency || currency} {parseFloat(item.total || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المبلغ الإجمالي:</span>
                    <span className="text-green-600">
                      {createdOrder.currency || currency} {parseFloat(createdOrder.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    dispatch(clearCart())
                    navigate('/orders')
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  عرض الطلبات
                </button>
              </div>
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  dispatch(clearCart())
                  navigate('/')
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                متابعة التسوق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {paymentMethods.find(m => m.code === formData.payment_method)?.name || 'معلومات الدفع'}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                {paymentMethods.find(m => m.code === formData.payment_method)?.description || 'أكمل معلومات الدفع لإتمام عملية الشراء'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الشخص الذي قام بالإيداع
                  </label>
                  <input
                    type="text"
                    name="payer_name"
                    value={formData.payer_name || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.payer_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل الاسم الكامل"
                  />
                  {errors.payer_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.payer_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم المرجع للإيداع
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.reference_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="REF-123456"
                  />
                  {errors.reference_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.reference_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.phone_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+966 50 123 4567"
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة إثبات الدفع
                  </label>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <input
                      type="file"
                      name="payment_image"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className={`hidden`}
                      id="payment_image_upload"
                    />
                    <label
                      htmlFor="payment_image_upload"
                      className={`flex-1 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${
                        errors.payment_image ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        {formData.payment_image ? (
                          <div className="flex items-center justify-center">
                            <img
                              src={formData.payment_image}
                              alt="صورة الدفع"
                              className="h-20 w-20 object-cover rounded-lg"
                            />
                            <div className="mr-4">
                              <p className="text-sm font-medium text-green-600">تم تحميل الصورة</p>
                              <p className="text-xs text-gray-500">انقر لتغيير الصورة</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-700">انقر لرفع صورة إثبات الدفع</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (حتى 10MB)</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  {errors.payment_image && (
                    <p className="mt-1 text-sm text-red-600">{errors.payment_image}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات الدفع
                  </label>
                  <textarea
                    name="payment_notes"
                    value={formData.payment_notes || ''}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.payment_notes ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أي ملاحظات إضافية حول عملية الدفع..."
                  />
                  {errors.payment_notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.payment_notes}</p>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">ملخص الدفع</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">طريقة الدفع:</span>
                    <span className="font-medium text-gray-900">
                      {paymentMethods.find(m => m.code === formData.payment_method)?.name || 'غير محدد'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الرسوم:</span>
                    <span className="font-medium text-gray-900">
                      {currency} {typeof paymentMethods.find(m => m.code === formData.payment_method)?.fee === 'number'
                        ? paymentMethods.find(m => m.code === formData.payment_method)?.fee.toFixed(2)
                        : parseFloat(paymentMethods.find(m => m.code === formData.payment_method)?.fee || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">المبلغ الإجمالي:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {currency} {typeof cartTotal === 'number' ? cartTotal.toFixed(2) : parseFloat(cartTotal || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'جاري المعالجة...' : 'إرسال'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Checkout
