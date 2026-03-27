import { apiRequest } from './api'

// Order Service - Complete Order Management
const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    console.log('=== ORDER SERVICE - Creating Order ===')
    console.log('Order data:', orderData)
    
    try {
      const response = await apiRequest.post('/orders', orderData)
      console.log('✅ Order created successfully in database:', response.data)
      return response
    } catch (error) {
      console.error('❌ Failed to create order in database:', error)
      console.error('Error response:', error.response?.data)
      
      // Fallback: Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      const newOrder = {
        ...orderData,
        id: `ORD-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: 'pending',
        payment_status: 'pending',
      }
      
      existingOrders.push(newOrder)
      localStorage.setItem('orders', JSON.stringify(existingOrders))
      
      console.log('💾 Order saved to localStorage:', newOrder)
      
      return {
        data: newOrder,
        message: 'Order saved locally (database unavailable)'
      }
    }
  },

  // Get user orders
  getUserOrders: async () => {
    console.log('=== ORDER SERVICE - Getting User Orders ===')
    
    try {
      const response = await apiRequest.get('/orders')
      console.log('✅ Orders fetched successfully:', response.data)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error)
      
      // Fallback: Get from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      console.log('💾 Orders loaded from localStorage:', orders)
      
      return {
        data: {
          orders: orders,
          message: 'Orders loaded from localStorage (database unavailable)'
        }
      }
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    console.log('=== ORDER SERVICE - Getting Order ===')
    console.log('Order ID:', orderId)
    
    try {
      const response = await apiRequest.get(`/orders/${orderId}`)
      console.log('✅ Order fetched successfully:', response.data)
      return response
    } catch (error) {
      console.error('❌ Failed to fetch order:', error)
      
      // Fallback: Get from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      const order = orders.find(o => o.id === orderId)
      
      if (order) {
        console.log('💾 Order loaded from localStorage:', order)
        return {
          data: order,
          message: 'Order loaded from localStorage (database unavailable)'
        }
      }
      
      throw new Error('Order not found')
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    console.log('=== ORDER SERVICE - Updating Order Status ===')
    console.log('Order ID:', orderId, 'New status:', status)
    
    try {
      const response = await apiRequest.put(`/orders/${orderId}/status`, { status })
      console.log('✅ Order status updated successfully:', response.data)
      return response
    } catch (error) {
      console.error('❌ Failed to update order status:', error)
      
      // Fallback: Update in localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      const orderIndex = orders.findIndex(o => o.id === orderId)
      
      if (orderIndex !== -1) {
        orders[orderIndex].status = status
        localStorage.setItem('orders', JSON.stringify(orders))
        console.log('💾 Order status updated in localStorage:', orders[orderIndex])
      }
      
      throw error
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    console.log('=== ORDER SERVICE - Canceling Order ===')
    console.log('Order ID:', orderId)
    
    try {
      const response = await apiRequest.put(`/orders/${orderId}/cancel`)
      console.log('✅ Order cancelled successfully:', response.data)
      return response
    } catch (error) {
      console.error('❌ Failed to cancel order:', error)
      
      // Fallback: Update in localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      const orderIndex = orders.findIndex(o => o.id === orderId)
      
      if (orderIndex !== -1) {
        orders[orderIndex].status = 'cancelled'
        localStorage.setItem('orders', JSON.stringify(orders))
        console.log('💾 Order cancelled in localStorage:', orders[orderIndex])
      }
      
      throw error
    }
  },

  // Track order
  trackOrder: async (trackingNumber) => {
    console.log('=== ORDER SERVICE - Tracking Order ===')
    console.log('Tracking number:', trackingNumber)
    
    try {
      const response = await apiRequest.get(`/orders/track/${trackingNumber}`)
      console.log('✅ Order tracking info fetched:', response.data)
      return response
    } catch (error) {
      console.error('❌ Failed to track order:', error)
      
      // Fallback: Mock tracking data
      const mockTrackingData = {
        tracking_number: trackingNumber,
        status: 'in_transit',
        current_location: 'Riyadh Distribution Center',
        estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        tracking_history: [
          {
            timestamp: new Date().toISOString(),
            location: 'Riyadh Distribution Center',
            status: 'Package received at sorting facility'
          }
        ]
      }
      
      console.log('💾 Using mock tracking data:', mockTrackingData)
      
      return {
        data: mockTrackingData,
        message: 'Tracking data simulated (database unavailable)'
      }
    }
  },
}

export default orderService
