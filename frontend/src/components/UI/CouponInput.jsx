import React, { useState, useEffect } from 'react'
import { GiftIcon, CheckCircleIcon, XCircleIcon, TagIcon } from '@heroicons/react/24/outline'
import couponService from '../services/couponService'

const CouponInput = ({ totalAmount, onCouponApplied, onCouponRemoved }) => {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [error, setError] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    // التحقق من وجود كوبون مطبق
    const savedCoupon = couponService.getAppliedCoupon()
    if (savedCoupon) {
      setAppliedCoupon(savedCoupon)
    }
  }, [])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('يرجى إدخال كود الكوبون')
      return
    }

    // تنسيق الكود
    const formattedCode = couponService.formatCouponCode(couponCode)
    
    if (!couponService.isValidCouponCode(formattedCode)) {
      setError('كود الكوبون غير صالح')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await couponService.applyCouponToCart(formattedCode)
      
      if (result) {
        setAppliedCoupon({
          code: result.coupon.code,
          discountAmount: result.discountAmount,
          coupon: result.coupon
        })
        setCouponCode('')
        setShowInput(false)
        
        if (onCouponApplied) {
          onCouponApplied(result)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    couponService.removeCouponFromCart()
    setAppliedCoupon(null)
    
    if (onCouponRemoved) {
      onCouponRemoved()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon()
    }
  }

  const generateRandomCode = () => {
    const randomCode = couponService.generateCouponCode()
    setCouponCode(randomCode)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <GiftIcon className="h-5 w-5 text-amber-600 ml-2" />
          <h3 className="text-lg font-semibold text-gray-900">كوبون الخصم</h3>
        </div>
        
        {!appliedCoupon && (
          <button
            onClick={() => setShowInput(!showInput)}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            {showInput ? 'إلغاء' : 'إضافة كوبون'}
          </button>
        )}
      </div>

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
              <div>
                <div className="font-medium text-green-900">
                  {appliedCoupon.code}
                </div>
                <div className="text-sm text-green-700">
                  خصم: {appliedCoupon.discountAmount} ريال
                </div>
              </div>
            </div>
            
            <button
              onClick={handleRemoveCoupon}
              className="text-red-600 hover:text-red-700"
              title="إزالة الكوبون"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Coupon Input */}
      {!appliedCoupon && showInput && (
        <div className="space-y-3">
          <div className="flex space-x-reverse space-x-2">
            <div className="flex-1 relative">
              <TagIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value)
                  setError('')
                }}
                onKeyPress={handleKeyPress}
                placeholder="أدخل كود الكوبون"
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                disabled={loading}
              />
            </div>
            
            <button
              onClick={handleApplyCoupon}
              disabled={loading || !couponCode.trim()}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'تطبيق'
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Generate Random Code */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              لا تملك كوبون؟ جرب كود عشوائي:
            </div>
            <button
              onClick={generateRandomCode}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              توليد كود
            </button>
          </div>
        </div>
      )}

      {/* No Coupon Applied */}
      {!appliedCoupon && !showInput && (
        <div className="text-center py-4">
          <TagIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">
            لا يوجد كوبون مطبق
          </p>
          <p className="text-gray-500 text-xs mt-1">
            أضف كوبون للحصول على خصم على طلبك
          </p>
        </div>
      )}

      {/* Coupon Info */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>المبلغ الإجمالي:</span>
            <span className="font-medium">{totalAmount} ريال</span>
          </div>
          {appliedCoupon && (
            <>
              <div className="flex items-center justify-between text-green-600">
                <span>الخصم:</span>
                <span className="font-medium">-{appliedCoupon.discountAmount} ريال</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-gray-900 pt-1">
                <span>المبلغ بعد الخصم:</span>
                <span>{(totalAmount - appliedCoupon.discountAmount).toFixed(2)} ريال</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CouponInput
