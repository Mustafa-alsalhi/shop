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
    const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-8385.up.railway.app/api'
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
  const [couponCode, setCouponCode] = React.useState('')
  const [couponLoading, setCouponLoading] = React.useState(false)
  const [couponError, setCouponError] = React.useState('')
  const [appliedCoupon, setAppliedCoupon] = React.useState(null)


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

  const handleApplyCoupon = async () => {
    console.log('=== handleApplyCoupon called ===')
    console.log('Coupon code:', couponCode)
    console.log('Cart items:', cartItems)
    console.log('Cart subtotal:', cartSubtotal)
    
    if (!couponCode.trim()) {
      console.log('Coupon code is empty')
      setCouponError('يرجى إدخال كود الخصم')
      return
    }

    console.log('Setting loading to true')
    setCouponLoading(true)
    setCouponError('')

    try {
      const token = localStorage.getItem('token')
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      
      console.log('Fetching:', `${apiUrl}/coupons/apply`)
      console.log('Request body:', {
        code: couponCode.trim(),
        total_amount: cartSubtotal,
        products: cartItems.map(item => ({
          id: item.product_id,
          category_id: item.category_id,
          price: item.price,
          quantity: item.quantity
        }))
      })

      const response = await fetch(`${apiUrl}/coupons/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          total_amount: cartSubtotal,
          products: cartItems.map(item => ({
            id: item.product_id,
            category_id: item.category_id,
            price: item.price,
            quantity: item.quantity
          }))
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        console.log('Coupon applied successfully')
        setAppliedCoupon(data.data.coupon)
        dispatch(showSuccessNotification('تم تطبيق كود الخصم بنجاح'))
        setCouponCode('')
      } else {
        console.log('Coupon application failed:', data.message)
        setCouponError(data.message || 'كود الخصم غير صالح')
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      setCouponError('حدث خطأ أثناء تطبيق كود الخصم')
    } finally {
      console.log('Setting loading to false')
      setCouponLoading(false)
    }
  }

  const handleCheckout = () => {
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      dispatch(showErrorNotification('سلتك فارغة. أضف منتجات قبل الدفع.'))
      return
    }
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      dispatch(showErrorNotification('يرجى تسجيل الدخول للمتابعة للدفع'))
      navigate('/login', { replace: true })
      return
    }
    
    // Show loading state
    dispatch(showSuccessNotification('جاري الانتقال إلى صفحة الدفع...'))
    
    // Navigate to checkout with a small delay to ensure state is updated
    setTimeout(() => {
      try {
        navigate('/checkout', { replace: false })
      } catch (error) {
        dispatch(showErrorNotification('حدث خطأ في التوجيه'))
      }
    }, 100)
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
                          SKU: {item.sku}
                        </p>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center space-x-reverse space-x-4">
                        <div className="text-left">
                          <p className="font-semibold text-amber-700">
                            {item.currency || 'USD'} {item.price}
                          </p>
                          <p className="text-sm text-amber-600">
                            الإجمالي: {item.currency || 'USD'} {item.total}
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
                  <span>{cartItems[0]?.currency || 'USD'} {cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>الضريبة</span>
                  <span>{cartItems[0]?.currency || 'USD'} {cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>الشحن</span>
                  <span>مجاني</span>
                </div>
                <div className="border-t border-amber-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-amber-800">
                    <span>الإجمالي</span>
                    <span>{cartItems[0]?.currency || 'USD'} {cartTotal.toFixed(2)}</span>
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
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Button clicked!')
                      handleApplyCoupon()
                    }}
                    disabled={couponLoading}
                    className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponLoading ? 'جاري التطبيق...' : 'تطبيق'}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-sm text-rose-600">{couponError}</p>
                )}
                {appliedCoupon && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      تم تطبيق كود: {appliedCoupon.code}
                    </p>
                    <p className="text-sm text-green-600">
                      الخصم: {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `${appliedCoupon.value}`}
                    </p>
                  </div>
                )}
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
