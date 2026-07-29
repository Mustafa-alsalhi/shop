import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, selectIsLoading, selectError, clearError } from '../../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'

import { useNavigate } from 'react-router-dom'
const ForgotPasswordEmail = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)
  
  const [formData, setFormData] = useState({
    email: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

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
      errors.email = 'البريد الإلكتروني غير صالح'
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
      const result = await dispatch(forgotPassword(formData.email))
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(showSuccessNotification('تم إرسال رمز استعادة كلمة المرور إلى بريدك الإلكتروني!'))
        navigate(`/reset-password?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (error) {
      dispatch(showErrorNotification('فشل في إرسال رابط إعادة تعيين كلمة المرور'))
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            هل نسيت كلمة المرور؟
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            أدخل بريدك الإلكتروني وسنرسل لك رمزاً (OTP) لإعادة تعيين كلمة المرور.
          </p>
        </div>

        {/* Forgot Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              عنوان البريد الإلكتروني
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`input ${validationErrors.email ? 'input-error' : ''}`}
                placeholder="أدخل بريدك الإلكتروني"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.email}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner h-5 w-5 mr-2"></div>
                  جاري الإرسال...
                </div>
              ) : (
                'إرسال رمز إعادة التعيين (OTP)'
              )}
            </button>
          </div>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/forgot-password"
            className="font-medium text-amber-600 hover:text-amber-500"
          >
            العودة للخيارات
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordEmail
