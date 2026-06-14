import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { loginUser, selectIsLoading, selectError, clearError } from '../../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'
import { fetchCart } from '../../store/slices/cartSlice'
import { fetchWishlist } from '../../store/slices/wishlistSlice'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.email) {
      errors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح'
    }
    
    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const result = await dispatch(loginUser(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(showSuccessNotification('تم تسجيل الدخول بنجاح!'))
        // Fetch user's cart and wishlist from server
        dispatch(fetchCart())
        dispatch(fetchWishlist())
        navigate(from, { replace: true })
      }
    } catch (error) {
      dispatch(showErrorNotification('فشل تسجيل الدخول'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full">
        {/* Beautiful Card Container */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-amber-200/50 overflow-hidden">
          {/* Header with Gradient Background */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              مرحباً بعودتك
            </h2>
            <p className="text-amber-100 text-sm">
              قم بتسجيل الدخول إلى حسابك
            </p>
          </div>

          {/* Form Container */}
          <div className="px-8 py-6">
            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-amber-700 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full pr-10 pl-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm ${validationErrors.email ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-rose-600">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-amber-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                placeholder="أدخل كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full pr-10 pl-12 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm ${validationErrors.password ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-amber-600" />
                ) : (
                  <FaEye className="h-5 w-5 text-amber-600" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-rose-600">
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between" dir="rtl">
            <div className="flex items-center" dir="rtl">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
              />
              <label htmlFor="remember-me" className="mr-2 block text-sm text-amber-800">
                تذكرني
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                هل نسيت كلمة المرور؟
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full border-2 border-amber-200 border-t-amber-600 h-5 w-5 ml-2"></div>
                  جاري تسجيل الدخول...
                </div>
              ) : (
              'تسجيل الدخول'
              )}
            </button>
          </div>
        </form>

            {/* Register Link */}
            <div className="text-center mt-6 pt-6 border-t border-amber-200">
              <p className="text-amber-700 text-sm">
                ليس لديك حساب؟{' '}
                <Link
                  to="/register"
                  className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
