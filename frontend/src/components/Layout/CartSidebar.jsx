import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { XMarkIcon, PlusIcon, MinusIcon, ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  selectCartIsOpen,
  closeCart,
} from '../../store/slices/uiSlice'
import {
  selectCartItems,
  selectCartTotal,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotalItems,
  selectCartIsLoading,
  selectAppliedCoupon,
  removeFromCart,
  updateCartItem,
  clearCart,
  setAppliedCoupon,
  clearAppliedCoupon,
} from '../../store/slices/cartSlice'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'

const CartSidebar = ({ isOpen }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const cartItems = useSelector(selectCartItems)
  const cartTotal = useSelector(selectCartTotal)
  const cartSubtotal = useSelector(selectCartSubtotal)
  const cartTax = useSelector(selectCartTax)
  const cartTotalItems = useSelector(selectCartTotalItems)
  const isLoading = useSelector(selectCartIsLoading)
  const appliedCoupon = useSelector(selectAppliedCoupon)
  const [couponCode, setCouponCode] = React.useState('')
  const [couponLoading, setCouponLoading] = React.useState(false)
  const [couponError, setCouponError] = React.useState('')
  
  // Also check localStorage as fallback
  const localStorageCart = JSON.parse(localStorage.getItem('cart') || '[]')
  
  // Use whichever has items
  const displayItems = cartItems.length > 0 ? cartItems : localStorageCart
  
  // Calculate totals from display items if Redux state is empty
  const calculatedSubtotal = displayItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0)
  const calculatedTax = 0
  const calculatedTotal = calculatedSubtotal + calculatedTax
  
  // Use Redux values if available, otherwise use calculated values
  const displaySubtotal = cartSubtotal || calculatedSubtotal
  const displayTax = cartTax || calculatedTax
  
  // Calculate discount based on applied coupon
  let discountAmount = 0
  if (appliedCoupon) {
    // Use the discount amount calculated by the backend
    discountAmount = appliedCoupon.discount_amount || 0
  }
  
  const displayTotal = (cartTotal || calculatedTotal) - discountAmount

  const handleClose = () => {
    // Clear applied coupon when closing cart
    dispatch(clearAppliedCoupon())
    setCouponError('')
    dispatch(closeCart())
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return
    dispatch(updateCartItem({ id: itemId, quantity: newQuantity }))
  }

  const handleRemoveItem = (itemId, itemName) => {
    dispatch(removeFromCart(itemId))
    dispatch(showSuccessNotification(`${itemName} تمت إزالته من السلة`))
  }

  const handleClearCart = () => {
    if (window.confirm('هل أنت متأكد من أنك تريد مسح السلة؟')) {
      dispatch(clearCart())
      dispatch(showSuccessNotification('تم مسح السلة'))
    }
  }

  const handleCheckout = () => {
    dispatch(closeCart())
    navigate('/checkout')
  }

  const handleContinueShopping = () => {
    dispatch(closeCart())
    navigate('/products')
  }

  const handleApplyCoupon = async () => {
    console.log('=== handleApplyCoupon called ===')
    console.log('Coupon code:', couponCode)
    console.log('Cart items:', displayItems)
    console.log('Cart subtotal:', displaySubtotal)
    
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
        total_amount: displaySubtotal,
        products: displayItems.map(item => ({
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
          total_amount: displaySubtotal,
          products: displayItems.map(item => ({
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
        dispatch(setAppliedCoupon({
          ...data.data.coupon,
          discount_amount: data.data.discount_amount,
          eligible_amount: data.data.eligible_amount
        }))
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

  // Helper function to get correct image URL
  const getImageUrl = (imagePath, productName) => {
    if (!imagePath) return `https://picsum.photos/seed/${productName?.replace(/\s+/g, '') || 'product'}/80x80.jpg`
    
    // Get base URL from environment or fallback to Railway production
    const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-8385.up.railway.app/api'
    const publicUrl = baseUrl.replace('/api', '')
    
    if (imagePath.startsWith('/images/')) {
      return `${publicUrl}${imagePath}`
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    if (imagePath.includes('via.placeholder.com')) {
      return `https://picsum.photos/seed/${productName?.replace(/\s+/g, '') || 'product'}/80x80.jpg`
    }
    
    return `${publicUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 md:w-96 lg:max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white">
            <h2 className="text-base sm:text-lg font-semibold flex items-center">
              <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary-600" />
              سلة التسوق ({cartTotalItems})
            </h2>
            <div className="flex items-center gap-1 sm:gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="مسح السلة"
                >
                  <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="spinner h-12 w-12"></div>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <ShoppingBagIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  سلتك فارغة
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">
                  أضف بعض المنتجات للبدء
                </p>
                <button
                  onClick={handleContinueShopping}
                  className="btn btn-primary text-sm sm:text-base"
                >
                  متابعة التسوق
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {displayItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center space-x-2 sm:space-x-4 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={getImageUrl(item.image_url || item.product_image, item.product_name)}
                          alt={item.product_name}
                          className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = `https://picsum.photos/seed/${item.product_name?.replace(/\s+/g, '') || 'product'}/80x80.jpg`
                          }}
                        />
                        {item.quantity > 1 && (
                          <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {item.product_name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {item.currency || 'USD'} {parseFloat(item.price).toFixed(2)} x {item.quantity}
                        </p>
                        {/* Display color and size if available */}
                        {(item.color || item.size) && (
                          <div className="flex items-center gap-2 mt-1">
                            {item.color && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-600">اللون:</span>
                                <span className="text-xs font-medium text-gray-800">{item.color}</span>
                                {item.color_code && (
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.color_code }}
                                  />
                                )}
                              </div>
                            )}
                            {item.size && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-600">المقاس:</span>
                                <span className="text-xs font-medium text-gray-800">{item.size}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs sm:text-sm font-medium text-primary-600">
                          {item.currency || 'USD'} {(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="text-xs sm:text-sm font-medium w-6 sm:w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id, item.product_name)}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 transition-colors flex-shrink-0"
                        title="إزالة العنصر"
                      >
                        <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayItems.length > 0 && (
            <div className="border-t border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">المجموع الفرعي ({cartTotalItems} عنصر)</span>
                  <span className="font-medium">{displayItems[0]?.currency || 'USD'} {displaySubtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-green-600">الخصم ({appliedCoupon.code})</span>
                    <span className="font-medium text-green-600">-{displayItems[0]?.currency || 'USD'} {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">الشحن</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">الضريبة</span>
                  <span className="font-medium">{displayItems[0]?.currency || 'USD'} {displayTax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>الإجمالي</span>
                    <span className="text-primary-600">{displayItems[0]?.currency || 'USD'} {displayTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="كود الخصم"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    console.log('Button clicked!')
                    handleApplyCoupon()
                  }}
                  disabled={couponLoading}
                  className="btn btn-outline btn-xs sm:btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {couponLoading ? 'جاري التطبيق...' : 'تطبيق'}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-600">{couponError}</p>
              )}
              {appliedCoupon && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-700">
                      تم تطبيق كود: {appliedCoupon.code}
                    </p>
                    <p className="text-xs text-green-600">
                      الخصم: {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `${appliedCoupon.value}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearAppliedCoupon())
                      setCouponError('')
                      dispatch(showSuccessNotification('تم إزالة كود الخصم'))
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    إزالة
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full btn btn-primary flex items-center justify-center text-sm sm:text-base"
                >
                  المتابعة للدفع
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="w-full btn btn-outline text-sm sm:text-base"
                >
                  متابعة التسوق
                </button>
              </div>

              {/* Security Note */}
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>الدفع الآمن مدعوم بتشفير SSL</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartSidebar
