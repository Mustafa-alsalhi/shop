import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  MapPinIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { selectCartItems, selectCartTotal, selectCartSubtotal, selectCartTax, clearCart } from '../../store/slices/cartSlice'
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/notificationsSlice'
import api from '../../services/api'
import orderService from '../../services/orderService'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const Checkout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const cartItems = useSelector(selectCartItems)
  const cartSubtotal = useSelector(selectCartSubtotal)
  const cartTax = useSelector(selectCartTax)
  const cartTotal = useSelector(selectCartTotal)

  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [errors, setErrors] = useState({})

  // Utility function for image URLs
  const getImageUrl = (imageUrl, productName, size = 80) => {
    console.log('🖼️ Checkout getImageUrl called:', { imageUrl, productName, size })
    
    if (imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' && imageUrl !== null) {
      if (imageUrl.startsWith('http')) {
        console.log('✅ Using absolute URL:', imageUrl)
        return imageUrl
      }
      if (imageUrl.startsWith('/')) {
        const absoluteUrl = `${imageUrl}`
        console.log('🔗 Converting relative to absolute:', absoluteUrl)
        return absoluteUrl
      }
      console.log('✅ Using URL as-is:', imageUrl)
      return imageUrl
    }
    
    const seed = productName ? encodeURIComponent(productName.substring(0, 20)) : 'product'
    const fallbackUrl = `https://picsum.photos/seed/${seed}/${size}/${size}.jpg`
    console.log('⚠️ Using fallback URL:', fallbackUrl)
    return fallbackUrl
  }

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
    payment_method: 'credit_card',
    card_number: '',
    card_name: '',
    card_expiry: '',
    card_cvv: '',
    
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
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    if (cartItems.length === 0) {
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
  }, [isAuthenticated, navigate, cartItems.length, user])

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
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'

    // Shipping Information
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'

    // Payment Information
    if (formData.payment_method === 'credit_card') {
      if (!formData.card_number.trim()) newErrors.card_number = 'Card number is required'
      if (!formData.card_name.trim()) newErrors.card_name = 'Name on card is required'
      if (!formData.card_expiry.trim()) newErrors.card_expiry = 'Expiry date is required'
      if (!formData.card_cvv.trim()) newErrors.card_cvv = 'CVV is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      console.log('=== CREATING ORDER ===')
      console.log('Form data:', formData)
      console.log('Cart items:', cartItems)
      console.log('Order total:', cartTotal)

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
        notes: formData.order_notes,
      }

      console.log('Order data to send:', orderData)

      // Save order to database
      const response = await orderService.createOrder(orderData)

      if (response.data) {
        const order = response.data
        console.log('✅ Order created successfully:', order)
        
        // Store order and show success modal
        setCreatedOrder(order)
        setShowSuccessModal(true)
        
        // Clear cart
        dispatch(clearCart())
        
        // Show success notification
        dispatch(showSuccessNotification(`Order #${order.id} created successfully!`))
        
      } else {
        dispatch(showErrorNotification('Failed to create order. Please try again.'))
      }

    } catch (error) {
      console.error('❌ Error creating order:', error)
      dispatch(showErrorNotification('An error occurred. Please try again.'))
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-4 py-6 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John"
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
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
                      Phone Number
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
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main St"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="NY"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
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
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="United States"
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Payment Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="cash_on_delivery">Cash on Delivery</option>
                    </select>
                  </div>

                  {formData.payment_method === 'credit_card' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="card_number"
                          value={formData.card_number}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.card_number ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.card_number && (
                          <p className="mt-1 text-sm text-red-600">{errors.card_number}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          name="card_name"
                          value={formData.card_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.card_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="John Doe"
                        />
                        {errors.card_name && (
                          <p className="mt-1 text-sm text-red-600">{errors.card_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="card_expiry"
                          value={formData.card_expiry}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.card_expiry ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="MM/YY"
                        />
                        {errors.card_expiry && (
                          <p className="mt-1 text-sm text-red-600">{errors.card_expiry}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="card_cvv"
                          value={formData.card_cvv}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.card_cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123"
                        />
                        {errors.card_cvv && (
                          <p className="mt-1 text-sm text-red-600">{errors.card_cvv}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Order Summary
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center">
                        <img
                          src={getImageUrl(item.image_url, item.product_name, 80)}
                          alt={item.product_name}
                          className="w-20 h-20 object-cover rounded-lg mr-4"
                          onError={(e) => {
                            console.error('❌ Checkout image failed to load:', item.image_url)
                            e.target.src = `https://picsum.photos/seed/${encodeURIComponent(item.product_name)}/80/80.jpg`
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Price: ${parseFloat(item.price || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${parseFloat(item.price * item.quantity || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="order_notes"
                  value={formData.order_notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Special instructions for your order..."
                />
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
                    Processing...
                  </div>
                ) : (
                  'Place Order'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      {showSuccessModal && createdOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-600">Order Placed Successfully!</h2>
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
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
                    Order #{createdOrder.id} - {createdOrder.order_number}
                  </h3>
                  <p className="text-green-700">
                    Thank you for your order! Your order has been successfully placed and is being processed.
                  </p>
                </div>
              </div>

              {/* Order Items with Images */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  {createdOrder.order_items?.map((item, index) => (
                    <div key={index} className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
                      <img
                        src={getImageUrl(item.image_url, item.product_name, 80)}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-lg mr-4"
                        onError={(e) => {
                          console.error('❌ Modal image failed to load:', item.image_url)
                          e.target.src = `https://picsum.photos/seed/${encodeURIComponent(item.product_name)}/80/80.jpg`
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ${parseFloat(item.price || 0).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${parseFloat(item.total || 0).toFixed(2)}
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
                    <span>Total Amount:</span>
                    <span className="text-green-600">
                      ${parseFloat(createdOrder.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    navigate('/orders')
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  View All Orders
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    navigate('/')
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Continue Shopping
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
