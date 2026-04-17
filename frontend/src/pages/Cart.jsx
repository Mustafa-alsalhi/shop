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
  // Helper function to get correct image URL
  const getImageUrl = (imageUrl, productName, size = 80) => {
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
    return `https://picsum.photos/seed/${productName?.replace(/\s+/g, '') || 'product'}/${size}x${size}.jpg`
  }
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
    if (window.confirm('هل أنت متأكد من أنك تريد مسح السلة؟')) {
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
      dispatch(showErrorNotification('سلتك فارغة. أضف منتجات قبل الدفع.'))
      return
    }
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login')
      dispatch(showErrorNotification('يرجى تسجيل الدخول للمتابعة للدفع'))
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
            يرجى تسجيل الدخول لعرض سلتك
          </h2>
          <p className="text-gray-600 mb-6">
            تحتاج إلى تسجيل الدخول للوصول إلى سلة التسوق
          </p>
          <Link to="/login" className="btn btn-primary">
            تسجيل الدخول للمتابعة
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8" dir="rtl">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8" dir="rtl">
          <div className="flex items-center">
            <Link to="/products" className="ml-4">
              <ArrowLeftIcon className="h-5 w-5 text-amber-600 hover:text-amber-700 transition-colors" />
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              سلة التسوق ({cartTotalItems} {cartTotalItems === 1 ? 'منتج' : 'منتجات'})
            </h1>
          </div>
          
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-rose-600 hover:text-rose-700 transition-colors"
            >
              مسح السلة
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center border border-amber-200/30">
                <ShoppingBagIcon className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  سلتك فارغة
                </h3>
                <p className="text-amber-700 mb-6">
                  أضف بعض المنتجات للبدء
                </p>
                <Link to="/products" className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  متابعة التسوق
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-amber-200/30"
                    dir="rtl"
                  >
                    <div className="flex items-center space-x-reverse space-x-4">
                      {/* Product Image */}
                      <img
                        src={getImageUrl(item.image_url, item.product_name, 80)}
                        alt={item.product_name}
                        className="h-20 w-20 object-cover rounded-md border border-amber-200/50"
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/seed/${item.product_name?.replace(/\s+/g, '') || 'product'}/80x80.jpg`
                        }}
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-800 text-right">
                          {item.product_name}
                        </h3>
                        {item.variant_attributes && (
                          <p className="text-sm text-amber-600 text-right">
                            {Object.entries(item.variant_attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-amber-600 text-right">
                          SKU: {item.product_sku}
                        </p>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center space-x-reverse space-x-4">
                        <div className="text-left">
                          <p className="font-semibold text-amber-700">
                            ${item.price}
                          </p>
                          <p className="text-sm text-amber-600">
                            الإجمالي: ${item.total}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-reverse space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-amber-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 text-amber-600 hover:text-amber-700 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-rose-600 hover:text-rose-700 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
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
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 sticky top-4 border border-amber-200/30" dir="rtl">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
                ملخص الطلب
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-amber-700">
                  <span>المجموع الفرعي</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>الضريبة</span>
                  <span>${cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>الشحن</span>
                  <span>مجاني</span>
                </div>
                <div className="border-t border-amber-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-amber-800">
                    <span>الإجمالي</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  كود الخصم
                </label>
                <div className="flex space-x-reverse space-x-2">
                  <input
                    type="text"
                    placeholder="أدخل كود الخصم"
                    className="flex-1 px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
                  />
                  <button className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                    تطبيق
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  المتابعة للدفع
                </button>
                <Link
                  to="/products"
                  className="w-full px-6 py-3 border border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
                >
                  متابعة التسوق
                </Link>
              </div>

              {/* Security Note */}
              <div className="mt-6 text-xs text-amber-600 text-center">
                <p>الدفع الآمن بتشفير SSL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
