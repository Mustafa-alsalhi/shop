import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShoppingBagIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  TruckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import orderService from '../services/orderService'

const Orders = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0
    return numPrice.toFixed(2)
  }

  const getImageUrl = (imageUrl, productName, size = 80) => {
    // Try to use the provided image URL first (from order_item)
    if (imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' && imageUrl !== null) {
      // If it's already an absolute URL, use it directly
      if (imageUrl.startsWith('http')) {
        return imageUrl
      }
      // If it's a relative path, make it absolute
      if (imageUrl.startsWith('/')) {
        return `http://localhost:8000${imageUrl}`
      }
      return imageUrl
    }
    
    // Generate a placeholder with product name as last resort
    const seed = productName ? encodeURIComponent(productName.substring(0, 20)) : 'product'
    return `https://picsum.photos/seed/${seed}/${size}/${size}.jpg`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      case 'shipped':
        return 'text-purple-600 bg-purple-100'
      case 'delivered':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      case 'processing':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      case 'shipped':
        return <TruckIcon className="h-4 w-4" />
      case 'delivered':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'cancelled':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'processing':
        return 'Processing'
      case 'shipped':
        return 'Shipped'
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('=== FETCHING ORDERS ===')

      const response = await orderService.getUserOrders()

      if (response.data) {
        console.log('✅ Orders fetched successfully:', response.data)
        // Handle different response formats
        let ordersData = []
        
        if (Array.isArray(response.data)) {
          ordersData = response.data
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders
        } else if (response.data.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data
        }
        
        // Process and normalize order data
        ordersData = ordersData.map(order => ({
          ...order,
          total_amount: parseFloat(order.total_amount) || 0,
          subtotal: parseFloat(order.subtotal) || 0,
          tax: parseFloat(order.tax) || 0,
          shipping: parseFloat(order.shipping) || 0,
          order_items: order.order_items || order.items || []
        }))
        
        console.log('📋 Processed orders data:', ordersData)
        setOrders(ordersData)
      } else {
        console.log('⚠️ No orders data received')
        setOrders([])
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      setError('Failed to load orders. Please try again.')
      dispatch(showErrorNotification('Failed to load orders'))
    } finally {
      setLoading(false)
    }
  }

  // Handle order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false)
    setSelectedOrder(null)
  }

  // Handle track order
  const handleTrackOrder = async (order) => {
    try {
      if (!order.tracking_number) {
        dispatch(showErrorNotification('No tracking number available'))
        return
      }

      const response = await orderService.trackOrder(order.tracking_number)
      
      if (response.data) {
        dispatch(showSuccessNotification('Tracking information updated'))
        // Refresh orders to get updated tracking info
        fetchOrders()
      }
    } catch (error) {
      console.error('Error tracking order:', error)
      dispatch(showErrorNotification('Failed to track order'))
    }
  }

  // Handle reorder
  const handleReorder = (order) => {
    console.log('Reordering items from order:', order.id)
    dispatch(showSuccessNotification('Items added to cart!'))
    navigate('/cart')
  }

  // Effects
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    fetchOrders()
  }, [isAuthenticated, navigate, dispatch])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your orders
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchOrders}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders List */}
          {(!orders || orders.length === 0) && !error ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Link
                to="/products"
                className="btn btn-primary"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders && Array.isArray(orders) && orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-2">{getStatusText(order.status)}</span>
                        </div>
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="px-6 py-4">
                    <div className="flex items-center space-x-4 mb-4">
                      {(order.order_items || []).slice(0, 3).map((item, index) => (
                        <img
                          key={index}
                          src={getImageUrl(item.image_url, item.product_name, 64)}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                      {(order.order_items || []).length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm text-gray-600 font-medium">
                            +{(order.order_items || []).length - 3}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {(order.order_items || []).length} {(order.order_items || []).length === 1 ? 'item' : 'items'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: <span className="font-semibold text-gray-900">${order.total_amount ? formatPrice(order.total_amount) : '0.00'}</span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.tracking_number && (
                          <button
                            onClick={() => handleTrackOrder(order)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Track Order
                          </button>
                        )}
                        <button
                          onClick={() => handleReorder(order)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Details Modal */}
          {showOrderDetails && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Order #{selectedOrder.id} Details
                    </h2>
                    <button
                      onClick={handleCloseOrderDetails}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Date:</span>
                            <span className="font-medium">{formatDate(selectedOrder.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <div className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                              {getStatusIcon(selectedOrder.status)}
                              <span className="ml-2">{getStatusText(selectedOrder.status)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${selectedOrder.payment_status === 'paid'
                              ? 'text-green-600 bg-green-100'
                              : 'text-yellow-600 bg-yellow-100'
                              }`}>
                              {selectedOrder.payment_status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                          {selectedOrder.tracking_number && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tracking Number:</span>
                              <span className="font-medium">{selectedOrder.tracking_number}</span>
                            </div>
                          )}
                          {selectedOrder.estimated_delivery && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estimated Delivery:</span>
                              <span className="font-medium">{formatDate(selectedOrder.estimated_delivery)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <p className="font-medium">
                              {selectedOrder.customer_info ?
                                `${selectedOrder.customer_info.first_name || ''} ${selectedOrder.customer_info.last_name || ''}`.trim()
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p className="font-medium">{selectedOrder.customer_info ? selectedOrder.customer_info.email : 'N/A'}</p>
                          </div>
                          {selectedOrder.customer_info && selectedOrder.customer_info.phone && (
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <p className="font-medium">{selectedOrder.customer_info.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium">{selectedOrder.shipping_address ? selectedOrder.shipping_address.address : 'N/A'}</p>
                          <p className="text-gray-600">
                            {selectedOrder.shipping_address ? 
                              `${selectedOrder.shipping_address.city || ''}, ${selectedOrder.shipping_address.state || ''}`.trim()
                              : 'N/A'
                            }
                          </p>
                          <p className="text-gray-600">
                            {selectedOrder.shipping_address ? 
                              `${selectedOrder.shipping_address.postal_code || ''}, ${selectedOrder.shipping_address.country || ''}`.trim()
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="lg:col-span-2 mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        {(selectedOrder.order_items || []).map((item, index) => (
                          <div
                            key={index}
                            className={`flex items-center p-4 ${index !== (selectedOrder.order_items || []).length - 1 ? 'border-b border-gray-200' : ''}`}
                          >
                            <img
                              src={getImageUrl(item.image_url, item.product_name, 80)}
                              alt={item.product_name}
                              className="w-20 h-20 object-cover rounded-lg mr-4"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">${item.price ? formatPrice(item.price) : '0.00'} each</p>
                              <p className="font-semibold text-gray-900">${item.total ? formatPrice(item.total) : '0.00'}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">${selectedOrder.total_amount ? formatPrice(selectedOrder.total_amount * 0.9) : '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-medium">${selectedOrder.total_amount ? formatPrice(selectedOrder.total_amount * 0.1) : '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="font-medium text-green-600">Free</span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total:</span>
                              <span className="text-primary-600">${selectedOrder.total_amount ? formatPrice(selectedOrder.total_amount) : '0.00'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleCloseOrderDetails}
                      className="btn btn-outline"
                    >
                      Close
                    </button>
                    <div className="flex items-center space-x-3">
                      {selectedOrder.tracking_number && (
                        <button
                          onClick={() => handleTrackOrder(selectedOrder)}
                          className="btn btn-outline"
                        >
                          Track Order
                        </button>
                      )}
                      <button
                        onClick={() => handleReorder(selectedOrder)}
                        className="btn btn-primary"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Orders
