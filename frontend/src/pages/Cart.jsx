import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'
import {
  fetchCart,
  selectCartItems,
  selectCartTotal,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotalItems,
  selectIsLoading,
  removeFromCart,
  updateCartItem,
  clearCart,
} from '../store/slices/cartSlice'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const Cart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const cartItems = useSelector(selectCartItems)
  const cartTotal = useSelector(selectCartTotal)
  const cartSubtotal = useSelector(selectCartSubtotal)
  const cartTax = useSelector(selectCartTax)
  const cartTotalItems = useSelector(selectCartTotalItems)
  const isLoading = useSelector(selectIsLoading)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  React.useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [dispatch, isAuthenticated])

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    dispatch(updateCartItem({ id: itemId, quantity: newQuantity }))
  }

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId))
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart())
    }
  }

  const handleCheckout = () => {
    console.log('=== CART CHECKOUT ===')
    console.log('Navigating to checkout...')
    console.log('Cart items:', cartItems)
    console.log('Cart total:', cartTotal)
    
    if (cartItems.length === 0) {
      console.log('❌ Cart is empty, cannot proceed to checkout')
      dispatch(showErrorNotification('Your cart is empty. Add items before checkout.'))
      return
    }
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login')
      dispatch(showErrorNotification('Please login to proceed to checkout'))
      navigate('/login')
      return
    }
    
    console.log('✅ Proceeding to checkout')
    navigate('/checkout')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please login to view your cart
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access your shopping cart
          </p>
          <Link to="/login" className="btn btn-primary">
            Login to Continue
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/products" className="mr-4">
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Shopping Cart ({cartTotalItems} {cartTotalItems === 1 ? 'item' : 'items'})
            </h1>
          </div>
          
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-6">
                  Add some products to get started
                </p>
                <Link to="/products" className="btn btn-primary">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <img
                        src={item.image_url || 'https://via.placeholder.com/80x80'}
                        alt={item.product_name}
                        className="h-20 w-20 object-cover rounded-md"
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.product_name}
                        </h3>
                        {item.variant_attributes && (
                          <p className="text-sm text-gray-500">
                            {Object.entries(item.variant_attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          SKU: {item.product_sku}
                        </p>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${item.price}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total: ${item.total}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 text-gray-600 hover:text-primary-600 transition-colors disabled:opacity-50"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 input"
                  />
                  <button className="btn btn-outline">
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/products"
                  className="w-full btn btn-outline"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Security Note */}
              <div className="mt-6 text-xs text-gray-500 text-center">
                <p>Secure checkout powered by SSL encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
