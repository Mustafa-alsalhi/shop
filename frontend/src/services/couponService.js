const API_BASE_URL = '/api'

// Simple toast function
const showToast = (message, type = 'success') => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }
  
  const toast = document.createElement('div')
  toast.className = `fixed top-4 left-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse`
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.remove()
  }, 3000)
}

class CouponService {
  // التحقق من صحة الكوبون
  async validateCoupon(code, totalAmount, products = []) {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          total_amount: totalAmount,
          products: products
        })
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          coupon: data.data.coupon,
          discountAmount: data.data.discount_amount,
          finalAmount: data.data.final_amount,
          message: data.message
        }
      } else {
        return {
          success: false,
          message: data.message
        }
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      return {
        success: false,
        message: 'فشل في التحقق من الكوبون'
      }
    }
  }

  // الحصول على الكوبونات النشطة (للعملاء)
  async getActiveCoupons() {
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/active`)
      
      if (response.ok) {
        const data = await response.json()
        return data.data
      }
      return []
    } catch (error) {
      console.error('Error fetching active coupons:', error)
      return []
    }
  }

  // تطبيق الكوبون في سلة التسوق
  async applyCouponToCart(code) {
    try {
      // الحصول على سلة التسوق الحالية
      const cartResponse = await fetch(`${API_BASE_URL}/cart`)
      if (!cartResponse.ok) {
        throw new Error('فشل في جلب سلة التسوق')
      }
      
      const cartData = await cartResponse.json()
      const cartItems = cartData.data || []
      
      // حساب المبلغ الإجمالي
      const totalAmount = cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
      
      // تحضير بيانات المنتجات للتحقق
      const products = cartItems.map(item => ({
        id: item.product_id,
        category_id: item.category_id,
        price: item.price,
        quantity: item.quantity
      }))
      
      // التحقق من الكوبون
      const validation = await this.validateCoupon(code, totalAmount, products)
      
      if (validation.success) {
        // حفظ الكوبون في localStorage
        localStorage.setItem('appliedCoupon', JSON.stringify({
          code: validation.coupon.code,
          discountAmount: validation.discountAmount,
          coupon: validation.coupon
        }))
        
        showToast(`تم تطبيق الكوبون: خصم ${validation.discountAmount} ريال`)
        return validation
      } else {
        showToast(validation.message, 'error')
        return null
      }
    } catch (error) {
      console.error('Error applying coupon to cart:', error)
      showToast('فشل في تطبيق الكوبون', 'error')
      return null
    }
  }

  // إزالة الكوبون من سلة التسوق
  removeCouponFromCart() {
    localStorage.removeItem('appliedCoupon')
    showToast('تم إزالة الكوبون', 'info')
  }

  // الحصول على الكوبون المطبق حالياً
  getAppliedCoupon() {
    const couponData = localStorage.getItem('appliedCoupon')
    return couponData ? JSON.parse(couponData) : null
  }

  // حساب الخصم النهائي بناءً على الكوبون المطبق
  calculateDiscount(totalAmount) {
    const appliedCoupon = this.getAppliedCoupon()
    
    if (!appliedCoupon) {
      return 0
    }
    
    // التحقق مرة أخرى من صحة الكوبون
    return this.validateCoupon(appliedCoupon.code, totalAmount).then(validation => {
      if (validation.success) {
        return validation.discountAmount
      } else {
        // الكوبون لم يعد صالحاً، إزالته
        this.removeCouponFromCart()
        return 0
      }
    }).catch(() => {
      // في حالة الخطأ، إزالة الكوبون
      this.removeCouponFromCart()
      return 0
    })
  }

  // توليد كود كوبون عشوائي
  generateCouponCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // التحقق من تنسيق كود الكوبون
  isValidCouponCode(code) {
    // يجب أن يكون من 4-50 حرف، أحرف إنجليزية وأرقام فقط
    const regex = /^[A-Z0-9]{4,50}$/i
    return regex.test(code)
  }

  // تنسيق كود الكوبون (تحويل إلى أحرف كبيرة)
  formatCouponCode(code) {
    return code.toUpperCase().trim()
  }

  // حساب التوفير من الكوبون
  calculateSavings(originalPrice, discountedPrice) {
    const savings = originalPrice - discountedPrice
    const percentage = originalPrice > 0 ? (savings / originalPrice) * 100 : 0
    
    return {
      amount: savings,
      percentage: percentage.toFixed(1)
    }
  }

  // التحقق من شروط الكوبون
  checkCouponConditions(coupon, cartItems, totalAmount) {
    const conditions = {
      minimumAmount: true,
      applicableProducts: true,
      usageLimit: true,
      dateValid: true
    }

    // التحقق من الحد الأدنى للطلب
    if (coupon.minimum_amount && totalAmount < coupon.minimum_amount) {
      conditions.minimumAmount = false
    }

    // التحقق من المنتجات المطبقة
    if (coupon.applicable_products && coupon.applicable_products.length > 0) {
      const cartProductIds = cartItems.map(item => item.product_id)
      conditions.applicableProducts = cartProductIds.some(id => 
        coupon.applicable_products.includes(id)
      )
    }

    // التحقق من تاريخ الصلاحية
    const now = new Date()
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      conditions.dateValid = false
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      conditions.dateValid = false
    }

    return conditions
  }

  // عرض رسالة خطأ مفصلة
  getDetailedErrorMessage(coupon, conditions) {
    if (!conditions.dateValid) {
      return 'هذا الكوبون منتهي الصلاحية أو لم يبدأ بعد'
    }
    
    if (!conditions.minimumAmount) {
      return `الحد الأدنى للطلب هو ${coupon.minimum_amount} ريال`
    }
    
    if (!conditions.applicableProducts) {
      return 'هذا الكوبون لا ينطبق على المنتجات في سلة التسوق'
    }
    
    if (!conditions.usageLimit) {
      return 'تم الوصول إلى الحد الأقصى لاستخدام هذا الكوبون'
    }
    
    return 'كوبون غير صالح'
  }
}

export default new CouponService()
