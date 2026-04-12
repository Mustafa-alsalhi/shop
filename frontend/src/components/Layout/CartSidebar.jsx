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
  selectCartTotalItems,
  selectCartIsLoading,
  removeFromCart,
  updateCartItem,
  clearCart,
} from '../../store/slices/cartSlice'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'

const CartSidebar = ({ isOpen }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const cartItems = useSelector(selectCartItems)
  const cartTotal = useSelector(selectCartTotal)
  const cartSubtotal = useSelector((state) => state.cart?.subtotal || 0)
  const cartTax = useSelector((state) => state.cart?.tax || 0)
  const cartTotalItems = useSelector(selectCartTotalItems)
  const isLoading = useSelector(selectCartIsLoading)
  
  // Also check localStorage as fallback
  const localStorageCart = JSON.parse(localStorage.getItem('cart') || '[]')
  
  // Use whichever has items
  const displayItems = cartItems.length > 0 ? cartItems : localStorageCart
  
  // Calculate totals from display items if Redux state is empty
  const calculatedSubtotal = displayItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0)
  const calculatedTax = calculatedSubtotal * 0.1
  const calculatedTotal = calculatedSubtotal + calculatedTax
  
  // Use Redux values if available, otherwise use calculated values
  const displaySubtotal = cartSubtotal || calculatedSubtotal
  const displayTax = cartTax || calculatedTax
  const displayTotal = cartTotal || calculatedTotal

  const handleClose = () => {
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

  // Helper function to get correct image URL
  const getImageUrl = (imagePath, productName) => {
    if (!imagePath) return `https://picsum.photos/seed/${productName?.replace(/\s+/g, '') || 'product'}/80x80.jpg`
    
    if (imagePath.startsWith('/images/')) {
      return `http://localhost:8000${imagePath}`
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    if (imagePath.includes('via.placeholder.com')) {
      return `https://picsum.photos/seed/${productName?.replace(/\s+/g, '') || 'product'}/80x80.jpg`
    }
    
    return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
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
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold flex items-center">
              <ShoppingBagIcon className="h-5 w-5 mr-2 text-primary-600" />
              سلة التسوق ({cartTotalItems})
            </h2>
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="مسح السلة"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="spinner h-12 w-12"></div>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  سلتك فارغة
                </h3>
                <p className="text-gray-500 mb-4">
                  أضف بعض المنتجات للبدء
                </p>
                <button
                  onClick={handleContinueShopping}
                  className="btn btn-primary"
                >
                  متابعة التسوق
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={getImageUrl(item.image_url || item.product_image, item.product_name)}
                          alt={item.product_name}
                          className="h-20 w-20 object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = `https://picsum.photos/seed/${item.product_name?.replace(/\s+/g, '') || 'product'}/80x80.jpg`
                          }}
                        />
                        {item.quantity > 1 && (
                          <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.product_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ${parseFloat(item.price).toFixed(2)} x {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-primary-600">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
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
                        onClick={() => handleRemoveItem(item.id, item.product_name)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="إزالة العنصر"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4 bg-white">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المجموع الفرعي ({cartTotalItems} عنصر)</span>
                  <span className="font-medium">${displaySubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الشحن</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الضريبة</span>
                  <span className="font-medium">${displayTax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span className="text-primary-600">${displayTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="كود الخصم"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button className="btn btn-outline btn-sm">
                  تطبيق
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full btn btn-primary flex items-center justify-center"
                >
                  المتابعة للدفع
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="w-full btn btn-outline"
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
